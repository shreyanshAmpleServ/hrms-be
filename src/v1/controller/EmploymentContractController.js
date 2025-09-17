const EmploymentContractService = require("../services/EmploymentContractService");
const EmploymentContractModel = require("../models/employmentContractModel");

const CustomError = require("../../utils/CustomError");
const moment = require("moment");
const {
  uploadToBackblaze,
  deleteFromBackblaze,
  uploadToBackblazeWithValidation,
} = require("../../utils/uploadBackblaze");
const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch").default;
const PDFLib = require("pdf-lib");
const crypto = require("crypto");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const sendEmail = require("../../utils/mailer");
const {
  generateContractHTML,
  generateContractPDF,
} = require("../../utils/contractUtils");
const { saveContractPayComponents } = require("../../utils/payComponentHelper");

const createEmploymentContract = async (req, res, next) => {
  try {
    let imageUrl = null;
    if (req.file) {
      imageUrl = await uploadToBackblaze(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        "EmploymentContract"
      );
    }
    const data = {
      ...req.body,
      createdby: req.user.id,
      document_path: imageUrl,
      log_inst: req.user.log_inst,
    };
    const reqData = await EmploymentContractService.createEmploymentContract(
      data
    );
    res
      .status(201)
      .success("Employment contract created successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const findEmploymentContractById = async (req, res, next) => {
  try {
    const reqData = await EmploymentContractService.findEmploymentContractById(
      req.params.id
    );
    if (!reqData) throw new CustomError("Employment contract not found", 404);
    res.status(200).success(null, reqData);
  } catch (error) {
    next(error);
  }
};

const updateEmploymentContract = async (req, res, next) => {
  try {
    const existingData =
      await EmploymentContractService.findEmploymentContractById(req.params.id);
    if (!existingData) throw new CustomError("Resume not found", 404);
    let imageUrl = existingData.resume_path;

    if (req.file) {
      imageUrl = await uploadToBackblaze(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        "EmploymentContract"
      );
    }
    const data = {
      ...req.body,
      document_path: req.file ? imageUrl : existingData.document_path,
      updatedby: req.user.id,
      log_inst: req.user.log_inst,
    };
    const reqData = await EmploymentContractService.updateEmploymentContract(
      req.params.id,
      data
    );
    res
      .status(200)
      .success("Employment contract updated successfully", reqData);
    if (req.file) {
      if (existingData.image) {
        await deleteFromBackblaze(existingData.image);
      }
    }
  } catch (error) {
    next(error);
  }
};

const deleteEmploymentContract = async (req, res, next) => {
  try {
    const existingData =
      await EmploymentContractService.findEmploymentContractById(req.params.id);
    await EmploymentContractService.deleteEmploymentContract(req.params.id);
    res.status(200).success("Employment contract deleted successfully", null);
    if (existingData.image) {
      await deleteFromBackblaze(existingData.image);
    }
  } catch (error) {
    next(error);
  }
};

const getAllEmploymentContract = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate, candidate_id } = req.query;
    const data = await EmploymentContractService.getAllEmploymentContract(
      search,
      Number(page),
      Number(size),
      startDate && moment(startDate),
      endDate && moment(endDate),
      candidate_id ? parseInt(candidate_id) : null
    );
    res.status(200).success(null, data);
  } catch (error) {
    next(error);
  }
};

// 2. with autodeklet(Made and designed by shivang)

const downloadContractPDF = async (req, res, next) => {
  try {
    const data = req.body;
    if (!data) {
      throw new CustomError("Missing required parameters", 400);
    }

    const filePath = await EmploymentContractService.downloadContractPDF(data);
    const fileBuffer = fs.readFileSync(filePath);

    const originalName = `contract_${data.employee_id || Date.now()}.pdf`;
    const mimeType = "application/pdf";

    const fileUrl = await uploadToBackblazeWithValidation(
      fileBuffer,
      originalName,
      mimeType,
      "contracts",
      { "b2-content-disposition": `inline; filename="${originalName}"` }
    );

    fs.unlink(filePath, (err) => {
      if (err) console.error("Error deleting temp contract PDF:", err);
    });

    if (!/^https?:\/\//i.test(fileUrl)) {
      throw new CustomError("Invalid file URL returned from Backblaze", 500);
    }

    const description = `Contract signed on ${new Date(
      data.startDate
    ).toLocaleDateString()} for ${
      data.contractType || "Full Time"
    } term, valid until ${new Date(
      new Date(data.startDate).setFullYear(
        new Date(data.startDate).getFullYear() + 1
      )
    ).toLocaleDateString()}`;

    const contract = await EmploymentContractModel.createEmploymentContract({
      candidate_id: Number(data.employeeId) || null,
      contract_start_date: new Date(data.startDate).toISOString(),
      contract_end_date: new Date(
        new Date(data.startDate).setFullYear(
          new Date(data.startDate).getFullYear() + 1
        )
      ).toISOString(),
      contract_type: data.contractType || "Full Time",
      document_path: fileUrl,
      description: description,
      createdby: data.userId || 1,
    });

    if (data.benefits?.length > 0 || data.deductions?.length > 0) {
      const payComponents = [
        ...(data.benefits || []),
        ...(data.deductions || []),
      ].map((item) => ({
        pay_component_id: Number(item.componentId),
        amount: Number(item.amount),
        currency_id: item.currencyId ? Number(item.currencyId) : null,
      }));

      console.log(" Pay Components to Save:", payComponents);

      await saveContractPayComponents(
        contract.id,
        payComponents,
        data.userId || 1
      );
    }

    res.json({ url: fileUrl, contractId: contract.id });
  } catch (error) {
    next(error);
  }
};

const sendContractToCandidate = async (req, res, next) => {
  try {
    const contractId = req.params.id;
    const { log_inst } = req.body;

    const contract = await prisma.hrms_d_employment_contract.findUnique({
      where: { id: Number(contractId) },
      include: {
        contracted_candidate: true,
      },
    });

    if (!contract || !contract.contracted_candidate) {
      throw new CustomError("Candidate not found for this contract", 404);
    }

    const candidateEmail = contract.contracted_candidate.email;
    const candidateName = contract.contracted_candidate.full_name;

    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.hrms_d_employment_contract.update({
      where: { id: Number(contractId) },
      data: { token, token_expiry: expiry },
    });

    const signingLink = `${
      process.env.FRONTEND_URL || "http://localhost:3000"
    }/sign-contract?contract_id=${contractId}&token=${token}`;
    const html = `
      <p>Dear ${candidateName},</p>
      <p>Your employment contract is ready for signing.</p>
      <p><a href="${signingLink}" target="_blank">Click here to sign your contract</a></p>
      <p>This link expires on <b>${expiry.toDateString()}</b>.</p>
      <p>Regards,<br/>HR Team</p>
    `;

    await sendEmail({
      to: candidateEmail,
      subject: "Employment Contract - Please Sign",
      html,
      log_inst,
    });

    res.status(200).send({ success: true, message: "Email sent successfully" });
  } catch (error) {
    console.log("Error in sending mail", error);
    next(error);
  }
};
// const showEmploymentContractForCandidate = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const { token } = req.query;

//     console.log("Contract ID:", id);
//     console.log("Token:", token);

//     const contract = await prisma.hrms_d_employment_contract.findUnique({
//       where: { id: Number(id) },
//     });

//     if (!contract) throw new CustomError("Contract Not Found", 404);

//     if (contract.token) {
//       if (contract.token !== token)
//         throw new CustomError("Invalid or expired link", 401);
//       if (contract.token_expiry && new Date() > contract.token_expiry) {
//         throw new CustomError("Link expired", 401);
//       }
//     }

//     console.log("Contract employee_id:", contract.employee_id);
//     console.log("Contract hrms_d_employeeId:", contract.hrms_d_employeeId);
//     console.log("Contract candidate_id:", contract.candidate_id);

//     let employee = null;
//     const employeeId = contract.employee_id || contract.hrms_d_employeeId;

//     if (employeeId) {
//       console.log("Looking for employee ID:", employeeId);

//       employee = await prisma.hrms_d_employee.findUnique({
//         where: { id: employeeId },
//         include: {
//           hrms_employee_designation: true,
//           hrms_employee_department: true,
//           hrms_d_employee_pay_component_assignment_header: {
//             where: { status: "Active" },
//             include: {
//               hrms_d_employee_pay_component_assignment_line: {
//                 include: {
//                   pay_component_for_line: true,
//                 },
//               },
//             },
//           },
//         },
//       });
//     }

//     if (!employee) {
//       console.log("Employee not found for contract");
//       throw new CustomError("Employee not found for this contract", 404);
//     }

//     console.log("Employee found:", employee.full_name);
//     console.log("Employee ID:", employee.id);

//     const companyConfig =
//       await prisma.hrms_d_default_configurations.findFirst();

//     let benefits = [];
//     let deductions = [];

//     console.log(
//       "Pay component headers found:",
//       employee.hrms_d_employee_pay_component_assignment_header?.length || 0
//     );

//     if (
//       employee.hrms_d_employee_pay_component_assignment_header &&
//       employee.hrms_d_employee_pay_component_assignment_header.length > 0
//     ) {
//       employee.hrms_d_employee_pay_component_assignment_header.forEach(
//         (header, headerIndex) => {
//           console.log(`Header ${headerIndex}:`, {
//             id: header.id,
//             status: header.status,
//             lines:
//               header.hrms_d_employee_pay_component_assignment_line?.length || 0,
//           });

//           if (header.hrms_d_employee_pay_component_assignment_line) {
//             header.hrms_d_employee_pay_component_assignment_line.forEach(
//               (line, lineIndex) => {
//                 console.log(`  Line ${lineIndex}:`, {
//                   id: line.id,
//                   amount: line.amount,
//                   component_name: line.pay_component_for_line?.component_name,
//                   is_active: line.pay_component_for_line?.is_active,
//                   pay_or_deduct: line.pay_component_for_line?.pay_or_deduct,
//                 });
//               }
//             );
//           }
//         }
//       );

//       const payComponentLines =
//         employee.hrms_d_employee_pay_component_assignment_header.flatMap(
//           (header) => header.hrms_d_employee_pay_component_assignment_line
//         );

//       console.log("Total pay component lines found:", payComponentLines.length);

//       benefits = payComponentLines
//         .filter(
//           (pc) =>
//             pc.pay_component_for_line &&
//             pc.pay_component_for_line.is_active === "Y" &&
//             pc.pay_component_for_line.pay_or_deduct === "P"
//         )
//         .map((pc) => ({
//           description: pc.pay_component_for_line.component_name,
//           type: "Benefit",
//           amount: pc.amount.toString(),
//           frequency: "Annual",
//         }));

//       deductions = payComponentLines
//         .filter(
//           (pc) =>
//             pc.pay_component_for_line &&
//             pc.pay_component_for_line.is_active === "Y" &&
//             pc.pay_component_for_line.pay_or_deduct === "D"
//         )
//         .map((pc) => ({
//           description: pc.pay_component_for_line.component_name,
//           type: "Deduction",
//           amount: pc.amount.toString(),
//           period: "Annual",
//         }));

//       console.log("Employee benefits found:", benefits.length);
//       console.log(" Employee deductions found:", deductions.length);

//       if (benefits.length > 0) {
//         console.log(
//           "Benefits:",
//           benefits.map((b) => `${b.description}: ${b.amount}`)
//         );
//       }
//       if (deductions.length > 0) {
//         console.log(
//           "Deductions:",
//           deductions.map((d) => `${d.description}: ${d.amount}`)
//         );
//       }
//     } else {
//       console.log(" No pay component headers found for employee");
//     }

//     if (benefits.length === 0 && deductions.length === 0) {
//       console.log("Using default pay components fallback");

//       try {
//         const defaultPayComponents = await prisma.hrms_m_pay_component.findMany(
//           {
//             where: { is_active: "Y" },
//             orderBy: { component_name: "asc" },
//             take: 10,
//           }
//         );

//         benefits = defaultPayComponents
//           .filter((pc) => pc.pay_or_deduct === "P")
//           .map((pc) => ({
//             description: pc.component_name,
//             type: "Benefit",
//             amount: "0",
//             frequency: "Annual",
//           }));

//         deductions = defaultPayComponents
//           .filter((pc) => pc.pay_or_deduct === "D")
//           .map((pc) => ({
//             description: pc.component_name,
//             type: "Deduction",
//             amount: "0",
//             period: "Annual",
//           }));
//       } catch (error) {
//         benefits = [
//           {
//             description: "Basic Salary",
//             type: "Benefit",
//             amount: "0",
//             frequency: "Annual",
//           },
//         ];
//         deductions = [
//           {
//             description: "Income Tax",
//             type: "Deduction",
//             amount: "0",
//             period: "Annual",
//           },
//         ];
//       }
//     }

//     let employeeCurrency = "INR";
//     console.log("Employee currency field:", employee?.currency);
//     console.log(
//       "Employee employee_currency field:",
//       employee?.employee_currency
//     );
//     console.log("Employee currency_id field:", employee?.currency_id);

//     employeeCurrency =
//       employee?.currency || employee?.employee_currency || "INR";
//     console.log("Final currency from employee:", employeeCurrency);

//     const contractData = {
//       contractNumber: contract.id || "N/A",
//       date: contract.createdate || new Date(),
//       companyName: companyConfig?.company_name || "N/A",
//       companyAddress: companyConfig?.street_address || "N/A",
//       companyCity: companyConfig?.city || "N/A",
//       companyState: companyConfig?.province || "N/A",
//       companyZip: companyConfig?.zip_code || "N/A",
//       companyPhone: companyConfig?.phone_number || "N/A",
//       companyEmail: companyConfig?.email || "N/A",
//       companyLogo: companyConfig?.company_logo || "",
//       companySignature: companyConfig?.company_signature || "",
//       employeeName: employee.full_name || "N/A",
//       employeeNationality: employee.nationality || "N/A",
//       employeePhone: employee.phone_number || "N/A",
//       employeeEmail: employee.email || employee.official_email || "N/A",
//       position: employee.hrms_employee_designation?.designation_name || "N/A",
//       department: employee.hrms_employee_department?.department_name || "N/A",
//       contractType: contract.contract_type || employee.employment_type || "N/A",
//       startDate: contract.contract_start_date
//         ? contract.contract_start_date.toLocaleDateString("en-US")
//         : employee.join_date
//         ? employee.join_date.toLocaleDateString("en-US")
//         : "N/A",
//       endDate: contract.contract_end_date
//         ? contract.contract_end_date.toLocaleDateString("en-US")
//         : "N/A",
//       workingHours: companyConfig?.full_day_working_hours || "8",
//       probationPeriod: companyConfig?.local_employee_probation_period || "3",
//       noticePeriod: companyConfig?.local_employee_notice_period || "30",
//       paymentFrequency: "Annual",
//       baseSalary: "0",
//       currency: employeeCurrency,
//       benefits: benefits,
//       deductions: deductions,
//       additionalTerms:
//         companyConfig?.terms_and_conditions ||
//         "Standard employment terms and conditions apply.",
//       notes: companyConfig?.notes || "",
//       employeeSignature: contract.signature,
//     };

//     console.log("Contract data built:", {
//       employeeName: contractData.employeeName,
//       position: contractData.position,
//       currency: contractData.currency,
//       benefits: contractData.benefits.length,
//       deductions: contractData.deductions.length,
//     });

//     const htmlContent = await generateContractHTML(contractData);

//     if (
//       !htmlContent ||
//       typeof htmlContent !== "string" ||
//       htmlContent.length === 0
//     ) {
//       console.error("HTML generation failed");
//       return res
//         .status(500)
//         .json({ error: "Failed to generate contract HTML" });
//     }

//     res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
//     res.setHeader("Pragma", "no-cache");
//     res.setHeader("Expires", "0");
//     res.setHeader("Content-Type", "text/html");
//     res.send(htmlContent);

//     console.log("Employee contract sent successfully");
//   } catch (error) {
//     console.error("Error in showEmploymentContractForEmployee:", error);
//     next(error);
//   }
// };

// II
// const showEmploymentContractForCandidate = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const { token } = req.query;

//     console.log("Contract ID:", id);
//     console.log("Token:", token);

//     const contract = await prisma.hrms_d_employment_contract.findUnique({
//       where: { id: Number(id) },
//     });

//     if (!contract) throw new CustomError("Contract Not Found", 404);

//     if (contract.token) {
//       if (contract.token !== token)
//         throw new CustomError("Invalid or expired link", 401);
//       if (contract.token_expiry && new Date() > contract.token_expiry) {
//         throw new CustomError("Link expired", 401);
//       }
//     }

//     console.log("Contract employee_id:", contract.employee_id);
//     console.log("Contract hrms_d_employeeId:", contract.hrms_d_employeeId);
//     console.log("Contract candidate_id:", contract.candidate_id);

//     let person = null;
//     let personType = null;
//     let personId = null;

//     const employeeId = contract.employee_id || contract.hrms_d_employeeId;

//     if (employeeId) {
//       console.log("Looking for employee ID:", employeeId);

//       person = await prisma.hrms_d_employee.findUnique({
//         where: { id: employeeId },
//         include: {
//           hrms_employee_designation: true,
//           hrms_employee_department: true,
//           employee_currency: true,
//           hrms_d_employee_pay_component_assignment_header: {
//             where: { status: "Active" },
//             include: {
//               hrms_d_employee_pay_component_assignment_line: {
//                 include: {
//                   pay_component_for_line: true,
//                 },
//               },
//             },
//           },
//         },
//       });

//       if (person) {
//         personType = "employee";
//         personId = employeeId;
//         console.log("Employee found:", person.full_name);
//         console.log("Using EMPLOYEE data (Priority 1)");
//       }
//     }

//     if (!person && contract.candidate_id) {
//       console.log(
//         "No employee found, looking for candidate ID:",
//         contract.candidate_id
//       );

//       person = await prisma.hrms_d_candidate_master.findUnique({
//         where: { id: contract.candidate_id },
//         include: {
//           candidate_master_applied_position: true,
//           candidate_department: true,
//           candidate_job_posting: true,
//           candidate_application_source: true,
//         },
//       });

//       if (person) {
//         personType = "candidate";
//         personId = contract.candidate_id;
//         console.log("Candidate found:", person.full_name);
//         console.log("Using CANDIDATE data (Priority 2)");
//       }
//     }

//     if (!person) {
//       console.log("Neither employee nor candidate found for contract");
//       throw new CustomError(
//         "No employee or candidate found for this contract",
//         404
//       );
//     }

//     console.log(`Final decision: Using ${personType.toUpperCase()} data`);
//     console.log(`${personType} found:`, person.full_name);
//     console.log(`${personType} ID:`, personId);
//     console.log(`${personType} found:`, person.full_name);
//     console.log(`${personType} ID:`, personId);

//     const companyConfig =
//       await prisma.hrms_d_default_configurations.findFirst();

//     let benefits = [];
//     let deductions = [];

//     if (personType === "employee") {
//       console.log("=== PROCESSING EMPLOYEE COMPENSATION ===");
//       console.log(
//         "Pay component headers found:",
//         person.hrms_d_employee_pay_component_assignment_header?.length || 0
//       );

//       if (
//         person.hrms_d_employee_pay_component_assignment_header &&
//         person.hrms_d_employee_pay_component_assignment_header.length > 0
//       ) {
//         person.hrms_d_employee_pay_component_assignment_header.forEach(
//           (header, headerIndex) => {
//             console.log(`Header ${headerIndex}:`, {
//               id: header.id,
//               status: header.status,
//               lines:
//                 header.hrms_d_employee_pay_component_assignment_line?.length ||
//                 0,
//             });

//             if (header.hrms_d_employee_pay_component_assignment_line) {
//               header.hrms_d_employee_pay_component_assignment_line.forEach(
//                 (line, lineIndex) => {
//                   console.log(`  Line ${lineIndex}:`, {
//                     id: line.id,
//                     amount: line.amount,
//                     component_name: line.pay_component_for_line?.component_name,
//                     is_active: line.pay_component_for_line?.is_active,
//                     pay_or_deduct: line.pay_component_for_line?.pay_or_deduct,
//                   });
//                 }
//               );
//             }
//           }
//         );

//         const payComponentLines =
//           person.hrms_d_employee_pay_component_assignment_header.flatMap(
//             (header) => header.hrms_d_employee_pay_component_assignment_line
//           );

//         console.log(
//           "Total pay component lines found:",
//           payComponentLines.length
//         );

//         benefits = payComponentLines
//           .filter(
//             (pc) =>
//               pc.pay_component_for_line &&
//               pc.pay_component_for_line.is_active === "Y" &&
//               pc.pay_component_for_line.pay_or_deduct === "P"
//           )
//           .map((pc) => ({
//             description: pc.pay_component_for_line.component_name,
//             type: "Benefit",
//             amount: pc.amount.toString(),
//             frequency: "Annual",
//           }));

//         deductions = payComponentLines
//           .filter(
//             (pc) =>
//               pc.pay_component_for_line &&
//               pc.pay_component_for_line.is_active === "Y" &&
//               pc.pay_component_for_line.pay_or_deduct === "D"
//           )
//           .map((pc) => ({
//             description: pc.pay_component_for_line.component_name,
//             type: "Deduction",
//             amount: pc.amount.toString(),
//             period: "Annual",
//           }));

//         console.log("Employee benefits found:", benefits.length);
//         console.log("Employee deductions found:", deductions.length);

//         if (benefits.length > 0) {
//           console.log(
//             "Benefits:",
//             benefits.map((b) => `${b.description}: ${b.amount}`)
//           );
//         }
//         if (deductions.length > 0) {
//           console.log(
//             "Deductions:",
//             deductions.map((d) => `${d.description}: ${d.amount}`)
//           );
//         }
//       } else {
//         console.log("No pay component headers found for employee");
//       }
//     } else if (personType === "candidate") {
//       console.log("=== PROCESSING CANDIDATE COMPENSATION (DEFAULT) ===");

//       if (contract.base_salary) {
//         benefits.push({
//           description: "Base Salary",
//           type: "Benefit",
//           amount: contract.base_salary.toString(),
//           frequency: "Annual",
//         });
//       }

//       if (person.candidate_job_posting) {
//         const jobPosting = person.candidate_job_posting;
//         if (jobPosting.min_salary && jobPosting.min_salary > 0) {
//           benefits.push({
//             description: "Offered Salary Range (Min)",
//             type: "Benefit",
//             amount: jobPosting.min_salary.toString(),
//             frequency: "Annual",
//           });
//         }

//         if (jobPosting.max_salary && jobPosting.max_salary > 0) {
//           benefits.push({
//             description: "Offered Salary Range (Max)",
//             type: "Benefit",
//             amount: jobPosting.max_salary.toString(),
//             frequency: "Annual",
//           });
//         }
//       }
//     }

//     // *** STEP 6: FALLBACK TO DEFAULT PAY COMPONENTS ***
//     if (benefits.length === 0 && deductions.length === 0) {
//       console.log("Using default pay components fallback");

//       try {
//         const defaultPayComponents = await prisma.hrms_m_pay_component.findMany(
//           {
//             where: { is_active: "Y" },
//             orderBy: { component_name: "asc" },
//             take: 10,
//           }
//         );

//         benefits = defaultPayComponents
//           .filter((pc) => pc.pay_or_deduct === "P")
//           .map((pc) => ({
//             description: pc.component_name,
//             type: "Benefit",
//             amount: "0",
//             frequency: "Annual",
//           }));

//         deductions = defaultPayComponents
//           .filter((pc) => pc.pay_or_deduct === "D")
//           .map((pc) => ({
//             description: pc.component_name,
//             type: "Deduction",
//             amount: "0",
//             period: "Annual",
//           }));
//       } catch (error) {
//         console.error("Error fetching default pay components:", error);
//         benefits = [
//           {
//             description: "Basic Salary",
//             type: "Benefit",
//             amount: "0",
//             frequency: "Annual",
//           },
//         ];
//         deductions = [
//           {
//             description: "Income Tax",
//             type: "Deduction",
//             amount: "0",
//             period: "Annual",
//           },
//         ];
//       }
//     }

//     // *** STEP 7: CONDITIONAL CURRENCY LOGIC ***
//     let personCurrency = "INR";
//     console.log("=== DETERMINING CURRENCY ===");

//     if (personType === "employee") {
//       console.log(
//         "Employee currency relation:",
//         person.employee_currency?.currency_code
//       );
//       console.log("Employee currency_id field:", person.currency_id);
//       // Use the related currency master data
//       personCurrency =
//         person.employee_currency?.currency_code ||
//         person.employee_currency?.currency_name ||
//         "INR";
//     } else if (personType === "candidate") {
//       // Candidates may not have currency directly, use default or contract currency
//       console.log("Using default currency for candidate");
//       personCurrency = contract.currency || "INR";
//     }

//     console.log("Final currency:", personCurrency);

//     // *** STEP 8: BUILD CONTRACT DATA WITH ACCURATE FIELD MAPPINGS ***
//     const contractData = {
//       contractNumber: contract.id || "N/A",
//       date: contract.createdate || new Date(),

//       // Company details
//       companyName: companyConfig?.company_name || "N/A",
//       companyAddress: companyConfig?.street_address || "N/A",
//       companyCity: companyConfig?.city || "N/A",
//       companyState: companyConfig?.province || "N/A",
//       companyZip: companyConfig?.zip_code || "N/A",
//       companyPhone: companyConfig?.phone_number || "N/A",
//       companyEmail: companyConfig?.email || "N/A",
//       companyLogo: companyConfig?.company_logo || "",
//       companySignature: companyConfig?.company_signature || "",

//       // *** CONDITIONAL PERSON DETAILS WITH ACCURATE SCHEMA FIELDS ***
//       employeeName:
//         personType === "candidate"
//           ? person.full_name || "N/A"
//           : person.full_name ||
//             (person.first_name && person.last_name
//               ? `${person.first_name} ${person.last_name}`
//               : "") ||
//             "N/A",

//       employeeNationality: person.nationality || "N/A",

//       employeePhone:
//         personType === "candidate"
//           ? person.phone || "N/A"
//           : person.phone_number || "N/A",

//       employeeEmail:
//         personType === "candidate"
//           ? person.email || "N/A"
//           : person.email || person.official_email || "N/A",

//       // Position and department based on actual schema relationships
//       position:
//         personType === "employee"
//           ? person.hrms_employee_designation?.designation_name || "N/A"
//           : person.candidate_master_applied_position?.designation_name || "N/A",

//       department:
//         personType === "employee"
//           ? person.hrms_employee_department?.department_name || "N/A"
//           : person.candidate_department?.department_name || "N/A",

//       contractType:
//         contract.contract_type ||
//         (personType === "employee" ? person.employment_type : "Full-time") ||
//         "N/A",

//       startDate: contract.contract_start_date
//         ? contract.contract_start_date.toLocaleDateString("en-US")
//         : personType === "employee" && person.join_date
//         ? person.join_date.toLocaleDateString("en-US")
//         : personType === "candidate" && person.expected_joining_date
//         ? person.expected_joining_date.toLocaleDateString("en-US")
//         : "N/A",

//       endDate: contract.contract_end_date
//         ? contract.contract_end_date.toLocaleDateString("en-US")
//         : "N/A",

//       workingHours: companyConfig?.full_day_working_hours || "8",
//       probationPeriod: companyConfig?.local_employee_probation_period || "3",
//       noticePeriod: companyConfig?.local_employee_notice_period || "30",
//       paymentFrequency: "Annual",
//       baseSalary: "0",
//       currency: personCurrency,
//       benefits: benefits,
//       deductions: deductions,

//       additionalTerms:
//         companyConfig?.terms_and_conditions ||
//         "Standard employment terms and conditions apply.",
//       notes: companyConfig?.notes || "",
//       employeeSignature: contract.signature,

//       // *** METADATA ***
//       personType: personType,
//       personId: personId,

//       // Additional details from schema
//       employeeGender: person.gender || "N/A",
//       employeeDateOfBirth: person.date_of_birth
//         ? person.date_of_birth.toLocaleDateString("en-US")
//         : "N/A",

//       // Candidate specific fields
//       ...(personType === "candidate" && {
//         candidateCode: person.candidate_code,
//         applicationDate: person.date_of_application
//           ? person.date_of_application.toLocaleDateString("en-US")
//           : "N/A",
//         applicationSource:
//           person.candidate_application_source?.source_name || "N/A",
//         candidateStatus: person.status || "N/A",
//         resumePath: person.resume_path || "",
//         profilePic: person.profile_pic || "",
//       }),

//       // Employee specific fields
//       ...(personType === "employee" && {
//         employeeCode: person.employee_code,
//         employeeCategory: person.employee_category || "N/A",
//         confirmDate: person.confirm_date
//           ? person.confirm_date.toLocaleDateString("en-US")
//           : "N/A",
//         workLocation: person.work_location || "N/A",
//       }),
//     };

//     console.log("Contract data built:", {
//       personType: contractData.personType,
//       personName: contractData.employeeName,
//       position: contractData.position,
//       department: contractData.department,
//       currency: contractData.currency,
//       benefits: contractData.benefits.length,
//       deductions: contractData.deductions.length,
//     });

//     // *** STEP 9: GENERATE HTML CONTENT ***
//     const htmlContent = await generateContractHTML(contractData);

//     if (
//       !htmlContent ||
//       typeof htmlContent !== "string" ||
//       htmlContent.length === 0
//     ) {
//       console.error("HTML generation failed");
//       return res
//         .status(500)
//         .json({ error: "Failed to generate contract HTML" });
//     }

//     // *** STEP 10: SEND RESPONSE ***
//     res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
//     res.setHeader("Pragma", "no-cache");
//     res.setHeader("Expires", "0");
//     res.setHeader("Content-Type", "text/html");
//     res.send(htmlContent);

//     console.log(`${personType} contract sent successfully`);
//   } catch (error) {
//     console.error("Error in showEmploymentContractForCandidate:", error);
//     next(error);
//   }
// };

const showEmploymentContractForCandidate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { token } = req.query;

    console.log("Contract ID:", id);
    console.log("Token:", token);

    const contract = await prisma.hrms_d_employment_contract.findUnique({
      where: { id: Number(id) },
      // *** INCLUDE CONTRACT PAY COMPONENTS FOR CANDIDATES ***
      include: {
        pay_component_contract: {
          include: {
            pay_component_for_contract: true, // Include actual pay component details
          },
        },
      },
    });

    if (!contract) throw new CustomError("Contract Not Found", 404);

    if (contract.token) {
      if (contract.token !== token)
        throw new CustomError("Invalid or expired link", 401);
      if (contract.token_expiry && new Date() > contract.token_expiry) {
        throw new CustomError("Link expired", 401);
      }
    }

    console.log("Contract employee_id:", contract.employee_id);
    console.log("Contract hrms_d_employeeId:", contract.hrms_d_employeeId);
    console.log("Contract candidate_id:", contract.candidate_id);
    console.log(
      "Contract pay components found:",
      contract.pay_component_contract?.length || 0
    );

    let person = null;
    let personType = null;
    let personId = null;

    const employeeId = contract.employee_id || contract.hrms_d_employeeId;

    if (employeeId) {
      console.log("Looking for employee ID:", employeeId);

      person = await prisma.hrms_d_employee.findUnique({
        where: { id: employeeId },
        include: {
          hrms_employee_designation: true,
          hrms_employee_department: true,
          employee_currency: true,
          hrms_d_employee_pay_component_assignment_header: {
            where: { status: "Active" },
            include: {
              hrms_d_employee_pay_component_assignment_line: {
                include: {
                  pay_component_for_line: true,
                },
              },
            },
          },
        },
      });

      if (person) {
        personType = "employee";
        personId = employeeId;
        console.log("Employee found:", person.full_name);
        console.log("Using EMPLOYEE data (Priority 1)");
      }
    }

    if (!person && contract.candidate_id) {
      console.log(
        "No employee found, looking for candidate ID:",
        contract.candidate_id
      );

      person = await prisma.hrms_d_candidate_master.findUnique({
        where: { id: contract.candidate_id },
        include: {
          candidate_master_applied_position: true,
          candidate_department: true,
          candidate_job_posting: true,
          candidate_application_source: true,
        },
      });

      if (person) {
        personType = "candidate";
        personId = contract.candidate_id;
        console.log("Candidate found:", person.full_name);
        console.log("Using CANDIDATE data (Priority 2)");
      }
    }

    if (!person) {
      console.log("Neither employee nor candidate found for contract");
      throw new CustomError(
        "No employee or candidate found for this contract",
        404
      );
    }

    console.log(`Final decision: Using ${personType.toUpperCase()} data`);
    console.log(`${personType} found:`, person.full_name);
    console.log(`${personType} ID:`, personId);

    const companyConfig =
      await prisma.hrms_d_default_configurations.findFirst();

    let benefits = [];
    let deductions = [];

    if (personType === "employee") {
      console.log("=== PROCESSING EMPLOYEE COMPENSATION ===");
      console.log(
        "Pay component headers found:",
        person.hrms_d_employee_pay_component_assignment_header?.length || 0
      );

      if (
        person.hrms_d_employee_pay_component_assignment_header &&
        person.hrms_d_employee_pay_component_assignment_header.length > 0
      ) {
        person.hrms_d_employee_pay_component_assignment_header.forEach(
          (header, headerIndex) => {
            console.log(`Header ${headerIndex}:`, {
              id: header.id,
              status: header.status,
              lines:
                header.hrms_d_employee_pay_component_assignment_line?.length ||
                0,
            });

            if (header.hrms_d_employee_pay_component_assignment_line) {
              header.hrms_d_employee_pay_component_assignment_line.forEach(
                (line, lineIndex) => {
                  console.log(`  Line ${lineIndex}:`, {
                    id: line.id,
                    amount: line.amount,
                    component_name: line.pay_component_for_line?.component_name,
                    is_active: line.pay_component_for_line?.is_active,
                    pay_or_deduct: line.pay_component_for_line?.pay_or_deduct,
                  });
                }
              );
            }
          }
        );

        const payComponentLines =
          person.hrms_d_employee_pay_component_assignment_header.flatMap(
            (header) => header.hrms_d_employee_pay_component_assignment_line
          );

        console.log(
          "Total pay component lines found:",
          payComponentLines.length
        );

        benefits = payComponentLines
          .filter(
            (pc) =>
              pc.pay_component_for_line &&
              pc.pay_component_for_line.is_active === "Y" &&
              pc.pay_component_for_line.pay_or_deduct === "P"
          )
          .map((pc) => ({
            description: pc.pay_component_for_line.component_name,
            type: "Benefit",
            amount: pc.amount.toString(),
            frequency: "Annual",
          }));

        deductions = payComponentLines
          .filter(
            (pc) =>
              pc.pay_component_for_line &&
              pc.pay_component_for_line.is_active === "Y" &&
              pc.pay_component_for_line.pay_or_deduct === "D"
          )
          .map((pc) => ({
            description: pc.pay_component_for_line.component_name,
            type: "Deduction",
            amount: pc.amount.toString(),
            period: "Annual",
          }));

        console.log("Employee benefits found:", benefits.length);
        console.log("Employee deductions found:", deductions.length);

        if (benefits.length > 0) {
          console.log(
            "Benefits:",
            benefits.map((b) => `${b.description}: ${b.amount}`)
          );
        }
        if (deductions.length > 0) {
          console.log(
            "Deductions:",
            deductions.map((d) => `${d.description}: ${d.amount}`)
          );
        }
      } else {
        console.log("No pay component headers found for employee");
      }
    } else if (personType === "candidate") {
      console.log("=== PROCESSING CANDIDATE COMPENSATION FROM CONTRACT ===");

      // *** PRIORITY 1: USE CONTRACT-SPECIFIC PAY COMPONENTS FOR CANDIDATE ***
      if (
        contract.pay_component_contract &&
        contract.pay_component_contract.length > 0
      ) {
        console.log(
          "Found contract-specific pay components:",
          contract.pay_component_contract.length
        );

        contract.pay_component_contract.forEach((contractComponent, index) => {
          console.log(`Contract Pay Component ${index}:`, {
            id: contractComponent.id,
            pay_component_id: contractComponent.pay_component_id,
            amount: contractComponent.amount,
            component_name:
              contractComponent.pay_component_for_contract?.component_name,
            is_active: contractComponent.pay_component_for_contract?.is_active,
            pay_or_deduct:
              contractComponent.pay_component_for_contract?.pay_or_deduct,
          });
        });

        // Process contract pay components
        benefits = contract.pay_component_contract
          .filter(
            (contractPc) =>
              contractPc.pay_component_for_contract &&
              contractPc.pay_component_for_contract.is_active === "Y" &&
              contractPc.pay_component_for_contract.pay_or_deduct === "P"
          )
          .map((contractPc) => ({
            description: contractPc.pay_component_for_contract.component_name,
            type: "Benefit",
            amount: contractPc.amount.toString(),
            frequency: "Annual",
            componentId: contractPc.pay_component_id,
            contractComponentId: contractPc.id,
          }));

        deductions = contract.pay_component_contract
          .filter(
            (contractPc) =>
              contractPc.pay_component_for_contract &&
              contractPc.pay_component_for_contract.is_active === "Y" &&
              contractPc.pay_component_for_contract.pay_or_deduct === "D"
          )
          .map((contractPc) => ({
            description: contractPc.pay_component_for_contract.component_name,
            type: "Deduction",
            amount: contractPc.amount.toString(),
            period: "Annual",
            componentId: contractPc.pay_component_id,
            contractComponentId: contractPc.id,
          }));

        console.log("Candidate contract benefits found:", benefits.length);
        console.log("Candidate contract deductions found:", deductions.length);

        if (benefits.length > 0) {
          console.log(
            "Contract Benefits:",
            benefits.map((b) => `${b.description}: ${b.amount}`)
          );
        }
        if (deductions.length > 0) {
          console.log(
            "Contract Deductions:",
            deductions.map((d) => `${d.description}: ${d.amount}`)
          );
        }
      } else {
        console.log(
          "No contract-specific pay components found, checking other sources"
        );

        // *** FALLBACK: CHECK CONTRACT FIELDS AND JOB POSTING ***
        if (contract.base_salary) {
          benefits.push({
            description: "Base Salary",
            type: "Benefit",
            amount: contract.base_salary.toString(),
            frequency: "Annual",
            source: "contract_field",
          });
        }

        if (person.candidate_job_posting) {
          const jobPosting = person.candidate_job_posting;
          if (jobPosting.min_salary && jobPosting.min_salary > 0) {
            benefits.push({
              description: "Offered Salary Range (Min)",
              type: "Benefit",
              amount: jobPosting.min_salary.toString(),
              frequency: "Annual",
              source: "job_posting",
            });
          }

          if (jobPosting.max_salary && jobPosting.max_salary > 0) {
            benefits.push({
              description: "Offered Salary Range (Max)",
              type: "Benefit",
              amount: jobPosting.max_salary.toString(),
              frequency: "Annual",
              source: "job_posting",
            });
          }
        }

        console.log("Candidate fallback compensation sources used");
      }
    }

    // default-for sort time , mene cooment out kr rkha hai
    // if (benefits.length === 0 && deductions.length === 0) {
    //   console.log("Using default pay components fallback");

    //   try {
    //     const defaultPayComponents = await prisma.hrms_m_pay_component.findMany(
    //       {
    //         where: { is_active: "Y" },
    //         orderBy: { component_name: "asc" },
    //         take: 10,
    //       }
    //     );

    //     benefits = defaultPayComponents
    //       .filter((pc) => pc.pay_or_deduct === "P")
    //       .map((pc) => ({
    //         description: pc.component_name,
    //         type: "Benefit",
    //         amount: "0",
    //         frequency: "Annual",
    //         source: "default",
    //       }));

    //     deductions = defaultPayComponents
    //       .filter((pc) => pc.pay_or_deduct === "D")
    //       .map((pc) => ({
    //         description: pc.component_name,
    //         type: "Deduction",
    //         amount: "0",
    //         period: "Annual",
    //         source: "default",
    //       }));
    //   } catch (error) {
    //     console.error("Error fetching default pay components:", error);
    //     benefits = [
    //       {
    //         description: "Basic Salary",
    //         type: "Benefit",
    //         amount: "0",
    //         frequency: "Annual",
    //         source: "hardcoded_fallback",
    //       },
    //     ];
    //     deductions = [
    //       {
    //         description: "Income Tax",
    //         type: "Deduction",
    //         amount: "0",
    //         period: "Annual",
    //         source: "hardcoded_fallback",
    //       },
    //     ];
    //   }
    // }

    let personCurrency = "INR";
    console.log("=== DETERMINING CURRENCY ===");

    if (personType === "employee") {
      console.log(
        "Employee currency relation:",
        person.employee_currency?.currency_code
      );
      console.log("Employee currency_id field:", person.currency_id);
      personCurrency =
        person.employee_currency?.currency_code ||
        person.employee_currency?.currency_name ||
        "INR";
    } else if (personType === "candidate") {
      if (
        contract.pay_component_contract &&
        contract.pay_component_contract.length > 0
      ) {
        const firstComponent = contract.pay_component_contract[0];
        if (firstComponent.currency_id) {
          console.log(
            "Found currency_id in contract pay component:",
            firstComponent.currency_id
          );
        }
      }
      console.log("Using contract or default currency for candidate");
      personCurrency = contract.currency || "INR";
    }

    console.log("Final currency:", personCurrency);

    const contractData = {
      contractNumber: contract.id || "N/A",
      date: contract.createdate || new Date(),

      companyName: companyConfig?.company_name || "N/A",
      companyAddress: companyConfig?.street_address || "N/A",
      companyCity: companyConfig?.city || "N/A",
      companyState: companyConfig?.province || "N/A",
      companyZip: companyConfig?.zip_code || "N/A",
      companyPhone: companyConfig?.phone_number || "N/A",
      companyEmail: companyConfig?.email || "N/A",
      companyLogo: companyConfig?.company_logo || "",
      companySignature: companyConfig?.company_signature || "",

      employeeName:
        personType === "candidate"
          ? person.full_name || "N/A"
          : person.full_name ||
            (person.first_name && person.last_name
              ? `${person.first_name} ${person.last_name}`
              : "") ||
            "N/A",

      employeeNationality: person.nationality || "N/A",

      employeePhone:
        personType === "candidate"
          ? person.phone || "N/A"
          : person.phone_number || "N/A",

      employeeEmail:
        personType === "candidate"
          ? person.email || "N/A"
          : person.email || person.official_email || "N/A",

      position:
        personType === "employee"
          ? person.hrms_employee_designation?.designation_name || "N/A"
          : person.candidate_master_applied_position?.designation_name || "N/A",

      department:
        personType === "employee"
          ? person.hrms_employee_department?.department_name || "N/A"
          : person.candidate_department?.department_name || "N/A",

      contractType:
        contract.contract_type ||
        (personType === "employee" ? person.employment_type : "Full-time") ||
        "N/A",

      startDate: contract.contract_start_date
        ? contract.contract_start_date.toLocaleDateString("en-US")
        : personType === "employee" && person.join_date
        ? person.join_date.toLocaleDateString("en-US")
        : personType === "candidate" && person.expected_joining_date
        ? person.expected_joining_date.toLocaleDateString("en-US")
        : "N/A",

      endDate: contract.contract_end_date
        ? contract.contract_end_date.toLocaleDateString("en-US")
        : "N/A",

      workingHours: companyConfig?.full_day_working_hours || "8",
      probationPeriod: companyConfig?.local_employee_probation_period || "3",
      noticePeriod: companyConfig?.local_employee_notice_period || "30",
      paymentFrequency: "Annual",
      baseSalary: "0",
      currency: personCurrency,
      benefits: benefits,
      deductions: deductions,

      additionalTerms:
        companyConfig?.terms_and_conditions ||
        "Standard employment terms and conditions apply.",
      notes: companyConfig?.notes || "",
      employeeSignature: contract.signature,

      personType: personType,
      personId: personId,

      employeeGender: person.gender || "N/A",
      employeeDateOfBirth: person.date_of_birth
        ? person.date_of_birth.toLocaleDateString("en-US")
        : "N/A",

      compensationSource:
        personType === "employee"
          ? "employee_assignment"
          : contract.pay_component_contract?.length > 0
          ? "contract_specific"
          : "fallback",

      ...(personType === "candidate" && {
        candidateCode: person.candidate_code,
        applicationDate: person.date_of_application
          ? person.date_of_application.toLocaleDateString("en-US")
          : "N/A",
        applicationSource:
          person.candidate_application_source?.source_name || "N/A",
        candidateStatus: person.status || "N/A",
        resumePath: person.resume_path || "",
        profilePic: person.profile_pic || "",
        contractPayComponentsCount:
          contract.pay_component_contract?.length || 0,
      }),

      ...(personType === "employee" && {
        employeeCode: person.employee_code,
        employeeCategory: person.employee_category || "N/A",
        confirmDate: person.confirm_date
          ? person.confirm_date.toLocaleDateString("en-US")
          : "N/A",
        workLocation: person.work_location || "N/A",
      }),
    };

    console.log("Contract data built:", {
      personType: contractData.personType,
      personName: contractData.employeeName,
      position: contractData.position,
      department: contractData.department,
      currency: contractData.currency,
      benefits: contractData.benefits.length,
      deductions: contractData.deductions.length,
      compensationSource: contractData.compensationSource,
      ...(personType === "candidate" && {
        contractPayComponentsCount: contractData.contractPayComponentsCount,
      }),
    });

    const htmlContent = await generateContractHTML(contractData);

    if (
      !htmlContent ||
      typeof htmlContent !== "string" ||
      htmlContent.length === 0
    ) {
      console.error("HTML generation failed");
      return res
        .status(500)
        .json({ error: "Failed to generate contract HTML" });
    }

    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.setHeader("Content-Type", "text/html");
    res.send(htmlContent);

    console.log(`${personType} contract sent successfully`);
  } catch (error) {
    console.error("Error in showEmploymentContractForCandidate:", error);
    next(error);
  }
};

const signEmploymentContractByCandidate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { token } = req.query;
    const signatureFile = req.file;

    console.log("Contract ID:", id);
    console.log("Token provided:", !!token);
    console.log("Signature file provided:", !!signatureFile);

    const contract = await prisma.hrms_d_employment_contract.findUnique({
      where: { id: Number(id) },
    });

    if (!contract) {
      throw new CustomError("Contract Not Found", 404);
    }

    if (contract.token) {
      if (contract.token !== token) {
        throw new CustomError("Invalid or expired link", 401);
      }
      if (contract.token_expiry && new Date() > contract.token_expiry) {
        throw new CustomError("Link expired", 401);
      }
    }

    // *** STEP 2: GET EMPLOYEE DATA (SAME AS VIEWING FUNCTION) ***
    let employee = null;
    const employeeId = contract.employee_id || contract.hrms_d_employeeId;

    if (employeeId) {
      console.log("Looking for employee ID:", employeeId);

      employee = await prisma.hrms_d_employee.findUnique({
        where: { id: employeeId },
        include: {
          hrms_employee_designation: true,
          hrms_employee_department: true,
          hrms_d_employee_pay_component_assignment_header: {
            where: { status: "Active" },
            include: {
              hrms_d_employee_pay_component_assignment_line: {
                include: {
                  pay_component_for_line: true,
                },
              },
            },
          },
        },
      });
    }

    if (!employee) {
      console.log("Employee not found for contract");
      throw new CustomError("Employee not found for this contract", 404);
    }

    console.log("Employee found:", employee.full_name);
    console.log("Employee ID:", employee.id);

    const companyConfig =
      await prisma.hrms_d_default_configurations.findFirst();
    let benefits = [];
    let deductions = [];

    console.log("=== GETTING EMPLOYEE COMPENSATION FOR SIGNING ===");
    console.log(
      "Pay component headers found:",
      employee.hrms_d_employee_pay_component_assignment_header?.length || 0
    );

    if (
      employee.hrms_d_employee_pay_component_assignment_header &&
      employee.hrms_d_employee_pay_component_assignment_header.length > 0
    ) {
      const payComponentLines =
        employee.hrms_d_employee_pay_component_assignment_header.flatMap(
          (header) => header.hrms_d_employee_pay_component_assignment_line
        );

      benefits = payComponentLines
        .filter(
          (pc) =>
            pc.pay_component_for_line &&
            pc.pay_component_for_line.is_active === "Y" &&
            pc.pay_component_for_line.pay_or_deduct === "P"
        )
        .map((pc) => ({
          description: pc.pay_component_for_line.component_name,
          type: "Benefit",
          amount: pc.amount.toString(),
          frequency: "Annual",
        }));

      deductions = payComponentLines
        .filter(
          (pc) =>
            pc.pay_component_for_line &&
            pc.pay_component_for_line.is_active === "Y" &&
            pc.pay_component_for_line.pay_or_deduct === "D"
        )
        .map((pc) => ({
          description: pc.pay_component_for_line.component_name,
          type: "Deduction",
          amount: pc.amount.toString(),
          period: "Annual",
        }));

      console.log(" Employee benefits for signing:", benefits.length);
      console.log(" Employee deductions for signing:", deductions.length);

      if (benefits.length > 0) {
        console.log(
          "Benefits:",
          benefits.map((b) => `${b.description}: ${b.amount}`)
        );
      }
      if (deductions.length > 0) {
        console.log(
          "Deductions:",
          deductions.map((d) => `${d.description}: ${d.amount}`)
        );
      }
    } else {
      console.log(" No pay component headers found, using fallback");
    }

    if (benefits.length === 0 && deductions.length === 0) {
      console.log("Using default pay components fallback for signing");

      try {
        const defaultPayComponents = await prisma.hrms_m_pay_component.findMany(
          {
            where: { is_active: "Y" },
            orderBy: { component_name: "asc" },
            take: 10,
          }
        );

        benefits = defaultPayComponents
          .filter((pc) => pc.pay_or_deduct === "P")
          .map((pc) => ({
            description: pc.component_name,
            type: "Benefit",
            amount: "0",
            frequency: "Annual",
          }));

        deductions = defaultPayComponents
          .filter((pc) => pc.pay_or_deduct === "D")
          .map((pc) => ({
            description: pc.component_name,
            type: "Deduction",
            amount: "0",
            period: "Annual",
          }));
      } catch (error) {
        benefits = [
          {
            description: "Basic Salary",
            type: "Benefit",
            amount: "0",
            frequency: "Annual",
          },
        ];
        deductions = [
          {
            description: "Income Tax",
            type: "Deduction",
            amount: "0",
            period: "Annual",
          },
        ];
      }
    }

    let employeeCurrency = "INR";
    console.log("=== EMPLOYEE CURRENCY FOR SIGNING ===");
    console.log("Employee currency field:", employee?.currency);
    console.log(
      "Employee employee_currency field:",
      employee?.employee_currency
    );

    employeeCurrency =
      employee?.currency || employee?.employee_currency || "INR";
    console.log("Final currency from employee:", employeeCurrency);

    let signatureUrl = null;
    let signatureSource = "";

    if (signatureFile) {
      console.log("Processing new employee signature file upload...");

      if (!signatureFile.mimetype.startsWith("image/")) {
        throw new CustomError(
          "Only image files are allowed for signatures",
          400
        );
      }

      const signatureFileName = `signature_employee_${employeeId}_${Date.now()}.${signatureFile.originalname
        .split(".")
        .pop()}`;

      signatureUrl = await uploadToBackblaze(
        signatureFile.buffer,
        signatureFileName,
        signatureFile.mimetype,
        "signatures"
      );

      signatureSource = "new_file_upload";
      console.log("New employee signature uploaded:", signatureUrl);
    } else {
      const existingSignature = contract.signature;
      if (existingSignature) {
        signatureUrl = existingSignature;
        signatureSource = "existing_signature";
      } else {
        throw new CustomError(
          "No signature provided. Please upload a signature file.",
          400
        );
      }
    }

    let signedDocumentUrl = contract.document_path;

    try {
      console.log("Regenerating contract with dynamic employee data...");

      const contractData = {
        contractNumber: contract.id || "N/A",
        date: contract.createdate || new Date(),

        companyName: companyConfig?.company_name || "N/A",
        companyAddress: companyConfig?.street_address || "N/A",
        companyCity: companyConfig?.city || "N/A",
        companyState: companyConfig?.province || "N/A",
        companyZip: companyConfig?.zip_code || "N/A",
        companyPhone: companyConfig?.phone_number || "N/A",
        companyEmail: companyConfig?.email || "N/A",
        companyLogo: companyConfig?.company_logo || "",
        companySignature: companyConfig?.company_signature || "",

        employeeName: employee.full_name || "N/A",
        employeeNationality: employee.nationality || "N/A",
        employeePhone: employee.phone_number || "N/A",
        employeeEmail: employee.email || employee.official_email || "N/A",

        position: employee.hrms_employee_designation?.designation_name || "N/A",
        department: employee.hrms_employee_department?.department_name || "N/A",
        contractType:
          contract.contract_type || employee.employment_type || "N/A",
        startDate: contract.contract_start_date
          ? contract.contract_start_date.toLocaleDateString("en-US")
          : employee.join_date
          ? employee.join_date.toLocaleDateString("en-US")
          : "N/A",
        endDate: contract.contract_end_date
          ? contract.contract_end_date.toLocaleDateString("en-US")
          : "N/A",
        workingHours: companyConfig?.full_day_working_hours || "8",
        probationPeriod: companyConfig?.local_employee_probation_period || "3",
        noticePeriod: companyConfig?.local_employee_notice_period || "30",
        paymentFrequency: "Annual",

        baseSalary: "0",
        currency: employeeCurrency,
        benefits: benefits,
        deductions: deductions,

        additionalTerms:
          companyConfig?.terms_and_conditions ||
          "Standard employment terms and conditions apply.",
        notes: companyConfig?.notes || "",
        employeeSignature: signatureUrl,
      };

      console.log("Contract data prepared with dynamic employee values:", {
        employeeName: contractData.employeeName,
        position: contractData.position,
        currency: contractData.currency,
        benefits: contractData.benefits.length,
        deductions: contractData.deductions.length,
      });

      const tempDir = path.join(__dirname, "../temp");
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
        console.log("Created temp directory:", tempDir);
      }

      const signedFileName = `signed_contract_employee_${id}_${Date.now()}.pdf`;
      const signedPdfPath = path.join(tempDir, signedFileName);

      console.log("Generating employee PDF at path:", signedPdfPath);

      await generateContractPDF(contractData, signedPdfPath);

      if (!fs.existsSync(signedPdfPath)) {
        throw new CustomError("PDF generation failed - file not created", 500);
      }

      const signedPdfBuffer = fs.readFileSync(signedPdfPath);

      signedDocumentUrl = await uploadToBackblazeWithValidation(
        signedPdfBuffer,
        signedFileName,
        "application/pdf",
        "contracts",
        { "b2-content-disposition": `inline; filename="${signedFileName}"` }
      );

      console.log(
        "Employee signed PDF uploaded successfully:",
        signedDocumentUrl
      );

      fs.unlink(signedPdfPath, (err) => {
        if (err) console.error("Error deleting temp employee PDF:", err);
        else console.log("Temporary employee PDF file deleted successfully");
      });

      if (contract.document_path !== signedDocumentUrl) {
        try {
          await deleteFromBackblaze(contract.document_path);
          console.log("Original unsigned document deleted successfully");
        } catch (deleteError) {
          console.warn(
            "Warning: Failed to delete original document:",
            deleteError.message
          );
        }
      }
    } catch (contractError) {
      console.error(
        "Error regenerating contract with employee signature:",
        contractError
      );
      throw new CustomError(
        "Failed to create signed employee contract document",
        500
      );
    }

    const updateData = {
      signature: signatureUrl,
      document_path: signedDocumentUrl,
      updatedate: new Date(),
      updatedby: employeeId,
      token: null,
      token_expiry: null,
    };

    console.log("Contract ID:", id);
    console.log("Employee ID:", employeeId);
    console.log("Previous document_path:", contract.document_path);
    console.log("New document_path:", signedDocumentUrl);

    const updatedContract = await prisma.hrms_d_employment_contract.update({
      where: { id: Number(id) },
      data: updateData,
    });

    // *** STEP 8: RETURN RESPONSE WITH DYNAMIC EMPLOYEE DATA ***
    const responseData = {
      contractId: updatedContract.id,
      employeeId: employeeId, // *** Employee ID ***
      signed: true,
      signatureUrl: updatedContract.signature,
      signedDocumentUrl: updatedContract.document_path,
      updateDate: updatedContract.updatedate,
      signatureSource: signatureSource,

      // *** DYNAMIC EMPLOYEE DETAILS ***
      employeeDetails: {
        id: employee.id,
        fullName: employee.full_name,
        email: employee.email || employee.official_email,
        phone: employee.phone_number,
        nationality: employee.nationality,
        position: employee.hrms_employee_designation?.designation_name,
        department: employee.hrms_employee_department?.department_name,
        employmentType: employee.employment_type,
        joinDate: employee.join_date,
        currency: employeeCurrency,
      },

      // *** DYNAMIC COMPENSATION DETAILS ***
      compensationDetails: {
        benefits: benefits,
        deductions: deductions,
        totalBenefits: benefits.reduce(
          (sum, b) => sum + parseFloat(b.amount),
          0
        ),
        totalDeductions: deductions.reduce(
          (sum, d) => sum + parseFloat(d.amount),
          0
        ),
        currency: employeeCurrency,
      },

      originalDocumentReplaced: contract.document_path !== signedDocumentUrl,
      fileDetails: signatureFile
        ? {
            originalName: signatureFile.originalname,
            mimeType: signatureFile.mimetype,
            size: signatureFile.size,
          }
        : null,
    };

    const successMessage =
      signatureSource === "new_file_upload"
        ? `Employee contract signed successfully with uploaded signature: ${signatureFile.originalname}`
        : "Employee contract signed successfully using existing signature";

    res.status(200).json({
      success: true,
      message: successMessage,
      data: responseData,
    });
  } catch (error) {
    console.error("Error in signEmploymentContractByEmployee:", error);
    next(error);
  }
};

module.exports = {
  createEmploymentContract,
  findEmploymentContractById,
  updateEmploymentContract,
  deleteEmploymentContract,
  getAllEmploymentContract,
  downloadContractPDF,
  sendContractToCandidate,
  showEmploymentContractForCandidate,
  signEmploymentContractByCandidate,
};

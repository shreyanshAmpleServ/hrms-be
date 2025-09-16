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

//  1. without autodeklet(Made and designed by shivang)
// const downloadContractPDF = async (req, res, next) => {
//   try {
//     const data = req.body;
//     if (!data) {
//       throw new CustomError("Missing required parameters", 400);
//     }

//     const filePath = await EmploymentContractService.downloadContractPDF(data);
//     const fileBuffer = fs.readFileSync(filePath);

//     const originalName = `contract_${data.employee_id || Date.now()}.pdf`;
//     const mimeType = "application/pdf";

//     const fileUrl = await uploadToBackblazeWithValidation(
//       fileBuffer,
//       originalName,
//       mimeType,
//       "contracts",
//       { "b2-content-disposition": `inline; filename="${originalName}"` }
//     );

//     fs.unlink(filePath, (err) => {
//       if (err) console.error("Error deleting temp contract PDF:", err);
//     });

//     if (!/^https?:\/\//i.test(fileUrl)) {
//       throw new CustomError("Invalid file URL returned from Backblaze", 500);
//     }

//     res.json({ url: fileUrl });
//   } catch (error) {
//     next(error);
//   }
// };

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
    await EmploymentContractModel.createEmploymentContract({
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
    });

    // setTimeout(async () => {
    //   try {
    //     await deleteFromBackblaze(fileUrl);
    //     console.log(
    //       `Contract file auto-deleted from Backblaze after 20 seconds`
    //     );
    //   } catch (error) {
    //     console.error(
    //       "Error auto-deleting contract file from Backblaze:",
    //       error
    //     );
    //   }
    // }, 10000);

    res.json({ url: fileUrl });
  } catch (error) {
    next(error);
  }
};

const sendContractToCandidate = async (req, res, next) => {
  try {
    const { contractId, candidateEmail, candidateName, log_inst } = req.body;

    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.hrms_d_employment_contract.update({
      where: { id: contractId },
      data: { token, token_expiry: expiry },
    });

    const signingLink = `${process.env.API_URL}/api/v1/contracts/${contractId}/sign?token=${token}`;
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

const showEmploymentContractForCandidate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { token } = req.query;

    console.log("Contract ID:", id);
    console.log("Token:", token);

    const contract = await prisma.hrms_d_employment_contract.findUnique({
      where: { id: Number(id) },
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

    console.log("=== EMPLOYEE COMPENSATION DEBUG ===");
    console.log(
      "Pay component headers found:",
      employee.hrms_d_employee_pay_component_assignment_header?.length || 0
    );

    if (
      employee.hrms_d_employee_pay_component_assignment_header &&
      employee.hrms_d_employee_pay_component_assignment_header.length > 0
    ) {
      employee.hrms_d_employee_pay_component_assignment_header.forEach(
        (header, headerIndex) => {
          console.log(`Header ${headerIndex}:`, {
            id: header.id,
            status: header.status,
            lines:
              header.hrms_d_employee_pay_component_assignment_line?.length || 0,
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
        employee.hrms_d_employee_pay_component_assignment_header.flatMap(
          (header) => header.hrms_d_employee_pay_component_assignment_line
        );

      console.log("Total pay component lines found:", payComponentLines.length);

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
      console.log(" Employee deductions found:", deductions.length);

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
      console.log(" No pay component headers found for employee");
    }

    if (benefits.length === 0 && deductions.length === 0) {
      console.log("Using default pay components fallback");

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
    console.log("Employee currency field:", employee?.currency);
    console.log(
      "Employee employee_currency field:",
      employee?.employee_currency
    );
    console.log("Employee currency_id field:", employee?.currency_id);

    employeeCurrency =
      employee?.currency || employee?.employee_currency || "INR";
    console.log("Final currency from employee:", employeeCurrency);

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
      contractType: contract.contract_type || employee.employment_type || "N/A",
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
      employeeSignature: contract.signature,
    };

    console.log("Contract data built:", {
      employeeName: contractData.employeeName,
      position: contractData.position,
      currency: contractData.currency,
      benefits: contractData.benefits.length,
      deductions: contractData.deductions.length,
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

    console.log("Employee contract sent successfully");
  } catch (error) {
    console.error("Error in showEmploymentContractForEmployee:", error);
    next(error);
  }
};

// const signEmploymentContractByCandidate = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const { token } = req.query;
//     const signatureFile = req.file;

//     console.log("Contract ID:", id);
//     console.log("Token provided:", !!token);
//     console.log("Signature file provided:", !!signatureFile);

//     // Find the contract with candidate information
//     const contract = await prisma.hrms_d_employment_contract.findUnique({
//       where: { id: Number(id) },
//       include: {
//         contracted_candidate: {
//           include: {
//             candidate_department: true,
//             candidate_master_applied_position: true,
//           },
//         },
//       },
//     });

//     if (!contract) {
//       throw new CustomError("Contract Not Found", 404);
//     }

//     // Validate token and expiry
//     if (contract.token) {
//       if (contract.token !== token) {
//         throw new CustomError("Invalid or expired link", 401);
//       }
//       if (contract.token_expiry && new Date() > contract.token_expiry) {
//         throw new CustomError("Link expired", 401);
//       }
//     }

//     const candidateId = contract.candidate_id;
//     if (!candidateId) {
//       throw new CustomError("No candidate associated with this contract", 400);
//     }

//     let signatureUrl = null;
//     let signatureSource = "";

//     // Step 1: Handle signature - Upload new file OR use existing from database
//     if (signatureFile) {
//       console.log("Processing new signature file upload...");

//       // Validate file type
//       if (!signatureFile.mimetype.startsWith("image/")) {
//         throw new CustomError(
//           "Only image files are allowed for signatures",
//           400
//         );
//       }

//       const signatureFileName = `signature_candidate_${candidateId}_${Date.now()}.${signatureFile.originalname
//         .split(".")
//         .pop()}`;

//       signatureUrl = await uploadToBackblaze(
//         signatureFile.buffer,
//         signatureFileName,
//         signatureFile.mimetype,
//         "signatures"
//       );

//       signatureSource = "new_file_upload";
//       console.log("New signature file uploaded successfully:", signatureUrl);
//     } else {
//       // Check for existing signature in database
//       const existingSignature = contract.signature;

//       if (existingSignature) {
//         console.log("Found existing signature in contract:", existingSignature);
//         signatureUrl = existingSignature;
//         signatureSource = "existing_signature";
//       } else {
//         throw new CustomError(
//           "No signature found for this candidate. Please upload a signature file to sign the contract.",
//           400
//         );
//       }
//     }

//     // Step 2: Regenerate contract with employee signature using existing method
//     let signedDocumentUrl = contract.document_path;

//     try {
//       console.log("Starting contract regeneration with employee signature...");

//       const candidate = contract.contracted_candidate;
//       const companyConfig =
//         await prisma.hrms_d_default_configurations.findFirst();

//       const contractData = {
//         contractNumber: contract.id || "N/A",
//         date: contract.createdate
//           ? contract.createdate.toLocaleDateString("en-US")
//           : new Date().toLocaleDateString("en-US"),
//         companyName: companyConfig?.company_name || "N/A",
//         companyAddress: companyConfig?.street_address || "N/A",
//         companyCity: companyConfig?.city || "N/A",
//         companyState: companyConfig?.province || "N/A",
//         companyZip: companyConfig?.zip_code || "N/A",
//         companyPhone: companyConfig?.phone_number || "N/A",
//         companyEmail: companyConfig?.email || "N/A",
//         companyLogo: companyConfig?.company_logo || "",
//         companySignature: companyConfig?.company_signature || "",
//         employeeName: candidate?.full_name || "N/A",
//         employeeNationality: candidate?.nationality || "N/A",
//         employeePhone: candidate?.phone || "N/A",
//         employeeEmail: candidate?.email || "N/A",
//         position:
//           candidate?.candidate_master_applied_position?.designation_name ||
//           "N/A",
//         department: candidate?.candidate_department?.department_name || "N/A",
//         contractType: contract.contract_type || "N/A",
//         startDate: contract.contract_start_date
//           ? contract.contract_start_date.toLocaleDateString("en-US")
//           : "N/A",
//         workingHours: companyConfig?.full_day_working_hours || "8",
//         probationPeriod: companyConfig?.local_employee_probation_period || "3",
//         noticePeriod: companyConfig?.local_employee_notice_period || "30",
//         paymentFrequency: "Monthly",
//         baseSalary: "0",
//         currency: companyConfig?.column_one || "INR",
//         benefits: contract.benefits || [],
//         deductions: contract.deductions || [],
//         additionalTerms:
//           companyConfig?.terms_and_conditions ||
//           "Standard employment terms and conditions apply.",
//         notes: companyConfig?.notes || "",
//         employeeSignature: signatureUrl, // *** ADD EMPLOYEE SIGNATURE HERE ***
//       };

//       console.log("Contract data prepared with employee signature");

//       // *** FIX: CREATE TEMP DIRECTORY IF IT DOESN'T EXIST ***
//       const tempDir = path.join(__dirname, "../temp");
//       if (!fs.existsSync(tempDir)) {
//         fs.mkdirSync(tempDir, { recursive: true });
//         console.log("Created temp directory:", tempDir);
//       }

//       // Generate signed PDF using existing method
//       const signedFileName = `signed_contract_${id}_${Date.now()}.pdf`;
//       const signedPdfPath = path.join(tempDir, signedFileName);

//       console.log("Generating PDF at path:", signedPdfPath);

//       // Use existing PDF generation method with updated data
//       await generateContractPDF(contractData, signedPdfPath);

//       // Verify PDF was created
//       if (!fs.existsSync(signedPdfPath)) {
//         throw new CustomError("PDF generation failed - file not created", 500);
//       }

//       // Read the generated PDF file
//       const signedPdfBuffer = fs.readFileSync(signedPdfPath);

//       // Upload the signed PDF document (REPLACE original)
//       signedDocumentUrl = await uploadToBackblazeWithValidation(
//         signedPdfBuffer,
//         signedFileName,
//         "application/pdf",
//         "contracts",
//         { "b2-content-disposition": `inline; filename="${signedFileName}"` }
//       );

//       console.log("Signed PDF uploaded successfully:", signedDocumentUrl);

//       // Clean up temporary PDF file
//       fs.unlink(signedPdfPath, (err) => {
//         if (err) console.error("Error deleting temp signed PDF:", err);
//         else console.log("Temporary PDF file deleted successfully");
//       });

//       // DELETE the original unsigned document from cloud storage
//       if (contract.document_path !== signedDocumentUrl) {
//         try {
//           await deleteFromBackblaze(contract.document_path);
//           console.log("Original unsigned document deleted successfully");
//         } catch (deleteError) {
//           console.warn(
//             "Warning: Failed to delete original document:",
//             deleteError.message
//           );
//         }
//       }
//     } catch (contractError) {
//       console.error(
//         "Error regenerating contract with signature:",
//         contractError
//       );
//       throw new CustomError("Failed to create signed contract document", 500);
//     }

//     // Step 3: Update contract record
//     const updateData = {
//       signature: signatureUrl,
//       document_path: signedDocumentUrl,
//       updatedate: new Date(),
//       updatedby: candidateId,
//       token: null,
//       token_expiry: null,
//     };

//     console.log("=== DATABASE UPDATE PROCESS ===");
//     console.log("Contract ID:", id);
//     console.log("Update Data:", updateData);
//     console.log("Previous document_path:", contract.document_path);
//     console.log("New document_path:", signedDocumentUrl);

//     const updatedContract = await prisma.hrms_d_employment_contract.update({
//       where: { id: Number(id) },
//       data: updateData,
//     });

//     // Step 4: Return response
//     const responseData = {
//       contractId: updatedContract.id,
//       candidateId: candidateId,
//       signed: true,
//       signatureUrl: updatedContract.signature,
//       signedDocumentUrl: updatedContract.document_path,
//       updateDate: updatedContract.updatedate,
//       signatureSource: signatureSource,
//       originalDocumentReplaced: contract.document_path !== signedDocumentUrl,
//       fileDetails: signatureFile
//         ? {
//             originalName: signatureFile.originalname,
//             mimeType: signatureFile.mimetype,
//             size: signatureFile.size,
//           }
//         : null,
//     };

//     const successMessage =
//       signatureSource === "new_file_upload"
//         ? `Contract signed successfully with uploaded signature file: ${signatureFile.originalname}`
//         : "Contract signed successfully using existing signature";

//     res.status(200).json({
//       success: true,
//       message: successMessage,
//       data: responseData,
//     });
//   } catch (error) {
//     console.error("Error in signEmploymentContractByCandidate:", error);
//     next(error);
//   }
// };

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

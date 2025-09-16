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
const { generateContractHTML } = require("../../utils/contractUtils");

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

// const sendContractToCandidate = async (req, res, next) => {
//   try {
//     const { contractId, candidateEmail, candidateName, log_inst } = req.body;

//     const token = crypto.randomBytes(32).toString("hex");
//     const expiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

//     await prisma.hrms_d_employment_contract.update({
//       where: { id: contractId },
//       data: { token, token_expiry: expiry },
//     });

//     const signingLink = `${process.env.API_URL}/api/v1/contracts/${contractId}/sign?token=${token}`;
//     const html = `
//       <p>Dear ${candidateName},</p>
//       <p>Your employment contract is ready for signing.</p>
//       <p><a href="${signingLink}" target="_blank">Click here to sign your contract</a></p>
//       <p>This link expires on <b>${expiry.toDateString()}</b>.</p>
//       <p>Regards,<br/>HR Team</p>
//     `;

//     await sendEmail({
//       to: candidateEmail,
//       subject: "Employment Contract - Please Sign",
//       html,
//       log_inst,
//     });
//     res.status(200).send({ success: true, message: "Email sent successfully" });
//   } catch (error) {
//     next(error);
//   }
// };

// const showEmploymentContractForCandidate = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const { token } = req.query;

//     const contract = await prisma.hrms_d_employment_contract.findUnique({
//       where: { id: Number(id) },
//     });

//     if (!contract) throw new CustomError("Contract Not Found", 404);
//     if (contract.token !== token)
//       throw new CustomError("Invalid or expired link", 401);

//     if (contract.token_expiry && new Date() > contract.token_expiry)
//       throw new CustomError("Link expired", 401);

//     res.status(200).json({
//       success: true,
//       data: {
//         contractId: contract.id,
//         documentUrl: contract.document_path,
//       },
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// const signEmploymentContractByCandidate = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const { token } = req.query;
//     const { signatureBase64 } = req.body;

//     if (!signatureBase64) throw new CustomError("Signature is required", 400);

//     const contract = await prisma.hrms_d_employment_contract.findUnique({
//       where: { id: Number(id) },
//     });

//     if (!contract) throw new CustomError("Contract not found", 404);
//     if (contract.token !== token)
//       throw new CustomError("Invalid or expired link", 401);
//     if (contract.token_expiry && new Date() > contract.token_expiry)
//       throw new CustomError("Link expired", 401);

//     const response = await fetch(contract.document_path);
//     const originalPdfBytes = await response.arrayBuffer();

//     const pdfDoc = await PDFLib.PDFDocument.load(originalPdfBytes);
//     const signatureImage = await pdfDoc.embedPng(
//       Buffer.from(signatureBase64.split(",")[1], "base64")
//     );

//     const pages = pdfDoc.getPages();
//     const lastPage = pages[pages.length - 1];

//     lastPage.drawImage(signatureImage, {
//       x: 50,
//       y: 100,
//       width: 150,
//       height: 75,
//     });

//     const signedPdfBytes = await pdfDoc.save();
//     const tempFile = path.join(__dirname, `signed_contract_${id}.pdf`);
//     fs.writeFileSync(tempFile, signedPdfBytes);

//     const fileName = `contracts/contract_${id}.pdf`;
//     const signedFileUrl = await uploadToBackblazeWithValidation(
//       tempFile,
//       fileName,
//       "application/pdf"
//     );
//     fs.unlinkSync(tempFile);

//     await prisma.hrms_d_employment_contract.update({
//       where: { id: Number(id) },
//       data: {
//         document_path: signedFileUrl,
//         updatedate: new Date(),
//         token: null,
//         token_expiry: null,
//       },
//     });

//     res.status(200).send({
//       success: true,
//       message: "Contract signed successfully",
//       data: { document_path: signedFileUrl },
//     });
//   } catch (error) {
//     console.log(`Error in signing`, error);
//     next(error);
//   }
// };

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
      include: {
        contracted_candidate: {
          include: {
            candidate_department: true,
            candidate_master_applied_position: true,
          },
        },
      },
    });

    console.log("Contract found:", !!contract);
    console.log("Contract data:", JSON.stringify(contract, null, 2));

    if (!contract) throw new CustomError("Contract Not Found", 404);

    if (contract.token) {
      if (contract.token !== token)
        throw new CustomError("Invalid or expired link", 401);
      if (contract.token_expiry && new Date() > contract.token_expiry) {
        throw new CustomError("Link expired", 401);
      }
    }
    const candidate = contract.contracted_candidate;
    console.log("Candidate data:", !!candidate);

    const companyConfig =
      await prisma.hrms_d_default_configurations.findFirst();
    console.log("Company config found:", !!companyConfig);

    const contractData = {
      contractNumber: contract.id || "N/A",
      date: contract.createdate
        ? contract.createdate.toLocaleDateString("en-US")
        : new Date().toLocaleDateString("en-US"),

      companyName: companyConfig?.company_name || "N/A",
      companyAddress: companyConfig?.street_address || "N/A",
      companyCity: companyConfig?.city || "N/A",
      companyState: companyConfig?.province || "N/A",
      companyZip: companyConfig?.zip_code || "N/A",
      companyPhone: companyConfig?.phone_number || "N/A",
      companyEmail: companyConfig?.email || "N/A",
      companyLogo: companyConfig?.company_logo || "",
      companySignature: companyConfig?.company_signature || "",

      employeeName: candidate?.full_name || "N/A",
      employeeNationality: candidate?.nationality || "N/A",
      employeePhone: candidate?.phone || "N/A",
      employeeEmail: candidate?.email || "N/A",

      position:
        candidate?.candidate_master_applied_position?.designation_name || "N/A",
      department: candidate?.candidate_department?.department_name || "N/A",

      contractType: contract.contract_type || "N/A",
      startDate: contract.contract_start_date
        ? contract.contract_start_date.toLocaleDateString("en-US")
        : "N/A",
      endDate: contract.contract_end_date
        ? contract.contract_end_date.toLocaleDateString("en-US")
        : "N/A",
      workingHours: companyConfig?.full_day_working_hours
        ? `${companyConfig.full_day_working_hours}`
        : "8",
      probationPeriod: companyConfig?.local_employee_probation_period || "3",
      noticePeriod: companyConfig?.local_employee_notice_period
        ? `${companyConfig.local_employee_notice_period}`
        : "30",
      paymentFrequency: "Monthly",

      baseSalary: "0",
      currency: companyConfig?.column_one || "INR",
      benefits: [],
      deductions: [],
      additionalTerms:
        companyConfig?.terms_and_conditions ||
        "Standard employment terms and conditions apply.",
      notes: companyConfig?.notes || "",
    };

    console.log("Contract data built:", JSON.stringify(contractData, null, 2));

    const html = await generateContractHTML(contractData);

    console.log("HTML generation completed");
    console.log("HTML type:", typeof html);
    console.log("HTML length:", html ? html.length : 0);
    console.log("HTML is string:", typeof html === "string");
    console.log(
      "HTML preview (first 200 chars):",
      html ? html.substring(0, 200) : "null/undefined"
    );

    if (!html || typeof html !== "string" || html.length === 0) {
      console.error("HTML generation failed - no content returned");
      return res
        .status(500)
        .json({ error: "Failed to generate contract HTML" });
    }

    console.log("Setting headers and sending response...");
    res.setHeader("Content-Type", "text/html");
    res.send(html);
    console.log("Response sent successfully");
  } catch (error) {
    console.error("Error in showEmploymentContractForCandidate:", error);
    next(error);
  }
};

const signEmploymentContractByCandidate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { token } = req.query;
    const { signatureBase64 } = req.body;

    console.log("Contract ID:", id);
    console.log("Token provided:", !!token);
    console.log("Signature provided:", !!signatureBase64);

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

    const updateData = {
      updatedate: new Date(),
      updatedby: contract.candidate_id || null,
    };

    if (signatureBase64) {
      try {
        if (!signatureBase64.startsWith("data:image/")) {
          throw new CustomError("Invalid signature format", 400);
        }

        const signatureBuffer = Buffer.from(
          signatureBase64.split(",")[1],
          "base64"
        );
        const signatureFileName = `signature_${id}_${Date.now()}.png`;

        const signatureUrl = await uploadToBackblaze(
          signatureBuffer,
          signatureFileName,
          "image/png",
          "signatures"
        );

        console.log("Signature uploaded successfully:", signatureUrl);

        updateData.signature = signatureUrl;

        updateData.token = null;
        updateData.token_expiry = null;
      } catch (signatureError) {
        console.error("Error processing signature:", signatureError);
        throw new CustomError("Failed to process signature", 500);
      }
    } else {
      console.log("No signature provided, updating contract without signature");
    }

    const updatedContract = await prisma.hrms_d_employment_contract.update({
      where: { id: Number(id) },
      data: updateData,
    });

    console.log("Contract updated successfully");

    const responseMessage = signatureBase64
      ? "Contract signed successfully"
      : "Contract updated successfully";

    const responseData = {
      contractId: updatedContract.id,
      signed: !!signatureBase64,
      signatureUrl: updatedContract.signature || null,
      updateDate: updatedContract.updatedate,
    };

    res.status(200).json({
      success: true,
      message: responseMessage,
      data: responseData,
    });
  } catch (error) {
    console.error("Error in signEmploymentContractByCandidate:", error);
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

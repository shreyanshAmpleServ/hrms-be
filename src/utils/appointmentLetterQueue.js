const Queue = require("bull");
const path = require("path");
const fs = require("fs");
const archiver = require("archiver");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const appointmentLatterModel = require("../v1/models/AppointmentLatterModel");
const {
  generateAppointmentLetterPDF,
} = require("../utils/appointmentLetterPDF");
const logger = require("../Comman/logger");

const appointmentLetterQueue = new Queue("appointment-letter-bulk-download", {
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: process.env.REDIS_PORT || 6379,
  },
});

const getCompanyConfig = async () => {
  try {
    const defaultConfig = await prisma.hrms_d_default_configurations.findFirst({
      select: {
        company_logo: true,
        company_name: true,
        company_signature: true,
        street_address: true,
        city: true,
        state: true,
        country: true,
        phone_number: true,
        website: true,
      },
    });

    if (!defaultConfig) {
      return {
        companyLogo: "",
        companySignature: "",
        companyName: "Company Name",
        companyAddress: "",
        companyEmail: "info@company.com",
        companyPhone: "Phone Number",
        companySignatory: "HR Manager",
      };
    }

    let companyLogoBase64 = "";
    let companySignatureBase64 = "";

    if (defaultConfig.company_logo) {
      try {
        const fetch = require("node-fetch");
        const logoResponse = await fetch(defaultConfig.company_logo);
        const logoBuffer = await logoResponse.buffer();
        const logoBase64 = logoBuffer.toString("base64");
        const logoMimeType =
          logoResponse.headers.get("content-type") || "image/png";
        companyLogoBase64 = `data:${logoMimeType};base64,${logoBase64}`;
      } catch (err) {
        logger.error("✗ Error fetching logo:", err.message);
        companyLogoBase64 = defaultConfig.company_logo;
      }
    }

    if (defaultConfig.company_signature) {
      try {
        const fetch = require("node-fetch");
        const signatureResponse = await fetch(defaultConfig.company_signature);
        const signatureBuffer = await signatureResponse.buffer();
        const signatureBase64 = signatureBuffer.toString("base64");
        const signatureMimeType =
          signatureResponse.headers.get("content-type") || "image/png";
        companySignatureBase64 = `data:${signatureMimeType};base64,${signatureBase64}`;
      } catch (err) {
        logger.error("✗ Error fetching signature:", err.message);
        companySignatureBase64 = defaultConfig.company_signature;
      }
    }

    const addressParts = [
      defaultConfig.street_address,
      defaultConfig.city,
      defaultConfig.state,
      defaultConfig.country,
    ].filter(Boolean);
    const fullAddress = addressParts.join(", ") || "Company Address";

    return {
      companyLogo: companyLogoBase64 || defaultConfig.company_logo || "",
      companySignature:
        companySignatureBase64 || defaultConfig.company_signature || "",
      companyName: defaultConfig.company_name || "Company Name",
      companyAddress: fullAddress,
      companyEmail: defaultConfig.website || "info@company.com",
      companyPhone: defaultConfig.phone_number || "Phone Number",
      companySignatory: "HR Manager",
    };
  } catch (error) {
    logger.error("Error fetching company config:", error);
    return {
      companyLogo: "",
      companySignature: "",
      companyName: "Company Name",
      companyAddress: "",
      companyEmail: "info@company.com",
      companyPhone: "Phone Number",
      companySignatory: "HR Manager",
    };
  }
};

const getEmployeeName = (appointmentLetter) => {
  if (appointmentLetter.appointment_candidate?.full_name) {
    return appointmentLetter.appointment_candidate.full_name;
  }
  if (appointmentLetter.appointment_candidate?.candidate_code) {
    return appointmentLetter.appointment_candidate.candidate_code;
  }
  return "Unknown";
};

appointmentLetterQueue.process(async (job) => {
  const { userId, filters, advancedFilters, jobId } = job.data;

  console.log(`[Job ${jobId}] Starting bulk appointment letter download...`);

  try {
    await job.progress(10);

    const appointmentLetters =
      await appointmentLatterModel.getAllAppointmentLettersForBulkDownload(
        filters || {},
        advancedFilters || {}
      );

    console.log(
      `[Job ${jobId}] Found ${appointmentLetters.length} appointment letters to process`
    );

    if (appointmentLetters.length === 0) {
      throw new Error("No appointment letters found");
    }

    await job.progress(20);

    const tempDir = path.join(process.cwd(), "temp", jobId);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    const companyConfig = await getCompanyConfig();
    console.log(`[Job ${jobId}] Company configuration loaded`);

    const pdfPaths = [];
    const totalLetters = appointmentLetters.length;

    for (let i = 0; i < totalLetters; i++) {
      const appointmentLetter = appointmentLetters[i];

      try {
        const employeeName = getEmployeeName(appointmentLetter);
        console.log(
          `[Job ${jobId}] Processing ${i + 1}/${totalLetters}: ${employeeName}`
        );
        const pdfData = await appointmentLatterModel.getAppointmentLetterForPDF(
          appointmentLetter.id
        );

        const completePdfData = {
          ...pdfData,
          ...companyConfig,
        };

        console.log(`[Job ${jobId}] PDF Data:`, {
          employeeName: completePdfData.employeeName,
          position: completePdfData.position,
          department: completePdfData.department,
        });

        const sanitizedName = employeeName
          .replace(/[^a-z0-9]/gi, "_")
          .toLowerCase();
        const fileName = `appointment_letter_${appointmentLetter.id}_${sanitizedName}.pdf`;
        const filePath = path.join(tempDir, fileName);

        await generateAppointmentLetterPDF(completePdfData, filePath);
        pdfPaths.push({ path: filePath, name: fileName });

        console.log(`[Job ${jobId}] ✓ Generated: ${fileName}`);

        const progress = 20 + Math.floor(((i + 1) / totalLetters) * 60);
        await job.progress(progress);
      } catch (error) {
        console.error(
          `[Job ${jobId}] Error processing letter ${appointmentLetter.id}:`,
          error
        );
        logger.error(`Error processing letter ${appointmentLetter.id}:`, error);
      }
    }

    if (pdfPaths.length === 0) {
      throw new Error("Failed to generate any appointment letter PDFs");
    }

    await job.progress(85);

    const zipFileName = `appointment_letters_bulk_${jobId}.zip`;
    const zipPath = path.join(
      process.cwd(),
      "uploads",
      "bulk-downloads",
      zipFileName
    );

    const zipDir = path.dirname(zipPath);
    if (!fs.existsSync(zipDir)) {
      fs.mkdirSync(zipDir, { recursive: true });
    }

    await createZip(pdfPaths, zipPath);
    await job.progress(95);

    fs.rmSync(tempDir, { recursive: true, force: true });

    await job.progress(100);

    console.log(`[Job ${jobId}]Completed! Generated ${pdfPaths.length} PDFs`);
    logger.info(
      `Job ${jobId} completed. Generated ${pdfPaths.length} appointment letters`
    );

    return {
      success: true,
      totalProcessed: pdfPaths.length,
      totalRequested: appointmentLetters.length,
      downloadUrl: `/api/appointment-letter/bulk-download/${jobId}`,
      fileName: zipFileName,
      zipPath: zipPath,
    };
  } catch (error) {
    console.error(`[Job ${jobId}]  Failed:`, error);
    logger.error(`Job ${jobId} failed:`, error);
    throw error;
  }
});

function createZip(files, outputPath) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputPath);
    const archive = archiver("zip", {
      zlib: { level: 9 },
    });

    output.on("close", () => {
      console.log(`ZIP created: ${archive.pointer()} bytes`);
      resolve();
    });

    archive.on("error", (err) => {
      reject(err);
    });

    archive.pipe(output);

    files.forEach((file) => {
      archive.file(file.path, { name: file.name });
    });

    archive.finalize();
  });
}

appointmentLetterQueue.on("completed", (job, result) => {
  console.log(`Job ${job.id} completed:`, result);
  logger.info(`Job completed:`, result);
});

appointmentLetterQueue.on("failed", (job, err) => {
  console.error(`Job ${job.id} failed:`, err.message);
  logger.error(`Job failed:`, err.message);
});

appointmentLetterQueue.on("progress", (job, progress) => {
  console.log(`Job ${job.id} Progress: ${progress}%`);
});

module.exports = appointmentLetterQueue;

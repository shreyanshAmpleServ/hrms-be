const Queue = require("bull");
const path = require("path");
const fs = require("fs");
const archiver = require("archiver");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const appraisalModel = require("../v1/models/AppraisalModel");
const { generateAppraisalPDF } = require("../utils/appraisalPDF.js");
const logger = require("../Comman/logger");

const appraisalQueue = new Queue("appraisal-bulk-download", {
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
        logger.error("Error fetching logo:", err.message);
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
        logger.error("Error fetching signature:", err.message);
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

const getEmployeeName = (appraisal) => {
  if (appraisal.appraisal_employee?.full_name) {
    return appraisal.appraisal_employee.full_name;
  }
  if (appraisal.appraisal_employee?.employee_code) {
    return appraisal.appraisal_employee.employee_code;
  }
  return "Unknown";
};

appraisalQueue.process(async (job) => {
  const { userId, filters, advancedFilters, jobId } = job.data;

  console.log(`[Job ${jobId}] Starting bulk appraisal download...`);

  try {
    await job.progress(10);

    const appraisals = await appraisalModel.getAllAppraisalsForBulkDownload(
      filters || {},
      advancedFilters || {}
    );

    console.log(
      `[Job ${jobId}] Found ${appraisals.length} appraisals to process`
    );

    if (appraisals.length === 0) {
      throw new Error("No appraisals found");
    }

    await job.progress(20);

    const tempDir = path.join(process.cwd(), "temp", jobId);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const companyConfig = await getCompanyConfig();
    console.log(`[Job ${jobId}] Company configuration loaded`);

    const pdfPaths = [];
    const totalAppraisals = appraisals.length;

    for (let i = 0; i < totalAppraisals; i++) {
      const appraisal = appraisals[i];

      try {
        const employeeName = getEmployeeName(appraisal);
        console.log(
          `[Job ${jobId}] Processing ${
            i + 1
          }/${totalAppraisals}: ${employeeName}`
        );

        const pdfData = await appraisalModel.getAppraisalForPDF(appraisal.id);

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
        const fileName = `appraisal_${appraisal.id}_${sanitizedName}.pdf`;
        const filePath = path.join(tempDir, fileName);

        await generateAppraisalPDF(completePdfData, filePath);
        pdfPaths.push({ path: filePath, name: fileName });

        console.log(`[Job ${jobId}] ✓ Generated: ${fileName}`);

        const progress = 20 + Math.floor(((i + 1) / totalAppraisals) * 60);
        await job.progress(progress);
      } catch (error) {
        console.error(
          `[Job ${jobId}] Error processing appraisal ${appraisal.id}:`,
          error
        );
        logger.error(`Error processing appraisal ${appraisal.id}:`, error);
      }
    }

    if (pdfPaths.length === 0) {
      throw new Error("Failed to generate any appraisal PDFs");
    }

    await job.progress(85);

    const zipFileName = `appraisals_bulk_${jobId}.zip`;
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

    console.log(`[Job ${jobId}] Completed! Generated ${pdfPaths.length} PDFs`);
    logger.info(
      `Job ${jobId} completed. Generated ${pdfPaths.length} appraisals`
    );

    return {
      success: true,
      totalProcessed: pdfPaths.length,
      totalRequested: appraisals.length,
      downloadUrl: `/api/appraisal/bulk-download/${jobId}`,
      fileName: zipFileName,
      zipPath: zipPath,
    };
  } catch (error) {
    console.error(`[Job ${jobId}] Failed:`, error);
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

appraisalQueue.on("completed", (job, result) => {
  console.log(`Job ${job.id} completed:`, result);
  logger.info(`Job completed:`, result);
});

appraisalQueue.on("failed", (job, err) => {
  console.error(`Job ${job.id} failed:`, err.message);
  logger.error(`Job failed:`, err.message);
});

appraisalQueue.on("progress", (job, progress) => {
  console.log(`Job ${job.id} Progress: ${progress}%`);
});

module.exports = appraisalQueue;

// const Queue = require("bull");
// const path = require("path");
// const fs = require("fs");
// const archiver = require("archiver");
// const { prisma } = require("../../utils/prismaProxy.js");
//
// const appointmentLatterModel = require("../v1/models/AppointmentLatterModel");
// const {
//   generateAppointmentLetterPDF,
// } = require("../utils/appointmentLetterPDF");
// const logger = require("../Comman/logger");

// const appointmentLetterQueue = new Queue("appointment-letter-bulk-download", {
//   redis: {
//     host: process.env.REDIS_HOST || "localhost",
//     port: process.env.REDIS_PORT || 6379,
//   },
// });

// const getCompanyConfig = async () => {
//   try {
//     const defaultConfig = await prisma.hrms_d_default_configurations.findFirst({
//       select: {
//         company_logo: true,
//         company_name: true,
//         company_signature: true,
//         street_address: true,
//         city: true,
//         state: true,
//         country: true,
//         phone_number: true,
//         website: true,
//       },
//     });

//     if (!defaultConfig) {
//       return {
//         companyLogo: "",
//         companySignature: "",
//         companyName: "Company Name",
//         companyAddress: "",
//         companyEmail: "info@company.com",
//         companyPhone: "Phone Number",
//         companySignatory: "HR Manager",
//       };
//     }

//     let companyLogoBase64 = "";
//     let companySignatureBase64 = "";

//     if (defaultConfig.company_logo) {
//       try {
//         const fetch = require("node-fetch");
//         const logoResponse = await fetch(defaultConfig.company_logo);
//         const logoBuffer = await logoResponse.buffer();
//         const logoBase64 = logoBuffer.toString("base64");
//         const logoMimeType =
//           logoResponse.headers.get("content-type") || "image/png";
//         companyLogoBase64 = `data:${logoMimeType};base64,${logoBase64}`;
//       } catch (err) {
//         logger.error("Error fetching logo:", err.message);
//         companyLogoBase64 = defaultConfig.company_logo;
//       }
//     }

//     if (defaultConfig.company_signature) {
//       try {
//         const fetch = require("node-fetch");
//         const signatureResponse = await fetch(defaultConfig.company_signature);
//         const signatureBuffer = await signatureResponse.buffer();
//         const signatureBase64 = signatureBuffer.toString("base64");
//         const signatureMimeType =
//           signatureResponse.headers.get("content-type") || "image/png";
//         companySignatureBase64 = `data:${signatureMimeType};base64,${signatureBase64}`;
//       } catch (err) {
//         logger.error("Error fetching signature:", err.message);
//         companySignatureBase64 = defaultConfig.company_signature;
//       }
//     }

//     const addressParts = [
//       defaultConfig.street_address,
//       defaultConfig.city,
//       defaultConfig.state,
//       defaultConfig.country,
//     ].filter(Boolean);
//     const fullAddress = addressParts.join(", ") || "Company Address";

//     return {
//       companyLogo: companyLogoBase64 || defaultConfig.company_logo || "",
//       companySignature:
//         companySignatureBase64 || defaultConfig.company_signature || "",
//       companyName: defaultConfig.company_name || "Company Name",
//       companyAddress: fullAddress,
//       companyEmail: defaultConfig.website || "info@company.com",
//       companyPhone: defaultConfig.phone_number || "Phone Number",
//       companySignatory: "HR Manager",
//     };
//   } catch (error) {
//     logger.error("Error fetching company config:", error);
//     return {
//       companyLogo: "",
//       companySignature: "",
//       companyName: "Company Name",
//       companyAddress: "",
//       companyEmail: "info@company.com",
//       companyPhone: "Phone Number",
//       companySignatory: "HR Manager",
//     };
//   }
// };

// const getEmployeeName = (appointmentLetter) => {
//   if (appointmentLetter.appointment_candidate?.full_name) {
//     return appointmentLetter.appointment_candidate.full_name;
//   }
//   if (appointmentLetter.appointment_candidate?.candidate_code) {
//     return appointmentLetter.appointment_candidate.candidate_code;
//   }
//   return "Unknown";
// };

// appointmentLetterQueue.process(async (job) => {
//   const { userId, filters, advancedFilters, jobId } = job.data;

//   console.log(`[Job ${jobId}] Starting bulk appointment letter download...`);

//   try {
//     await job.progress(10);

//     const appointmentLetters =
//       await appointmentLatterModel.getAllAppointmentLettersForBulkDownload(
//         filters || {},
//         advancedFilters || {}
//       );

//     console.log(
//       `[Job ${jobId}] Found ${appointmentLetters.length} appointment letters to process`
//     );

//     if (appointmentLetters.length === 0) {
//       throw new Error("No appointment letters found");
//     }

//     await job.progress(20);

//     const tempDir = path.join(process.cwd(), "temp", jobId);
//     if (!fs.existsSync(tempDir)) {
//       fs.mkdirSync(tempDir, { recursive: true });
//     }
//     const companyConfig = await getCompanyConfig();
//     console.log(`[Job ${jobId}] Company configuration loaded`);

//     const pdfPaths = [];
//     const totalLetters = appointmentLetters.length;

//     for (let i = 0; i < totalLetters; i++) {
//       const appointmentLetter = appointmentLetters[i];

//       try {
//         const employeeName = getEmployeeName(appointmentLetter);
//         console.log(
//           `[Job ${jobId}] Processing ${i + 1}/${totalLetters}: ${employeeName}`
//         );
//         const pdfData = await appointmentLatterModel.getAppointmentLetterForPDF(
//           appointmentLetter.id
//         );

//         const completePdfData = {
//           ...pdfData,
//           ...companyConfig,
//         };

//         console.log(`[Job ${jobId}] PDF Data:`, {
//           employeeName: completePdfData.employeeName,
//           position: completePdfData.position,
//           department: completePdfData.department,
//         });

//         const sanitizedName = employeeName
//           .replace(/[^a-z0-9]/gi, "_")
//           .toLowerCase();
//         const fileName = `appointment_letter_${appointmentLetter.id}_${sanitizedName}.pdf`;
//         const filePath = path.join(tempDir, fileName);

//         await generateAppointmentLetterPDF(completePdfData, filePath);
//         pdfPaths.push({ path: filePath, name: fileName });

//         console.log(`[Job ${jobId}] ✓ Generated: ${fileName}`);

//         const progress = 20 + Math.floor(((i + 1) / totalLetters) * 60);
//         await job.progress(progress);
//       } catch (error) {
//         console.error(
//           `[Job ${jobId}] Error processing letter ${appointmentLetter.id}:`,
//           error
//         );
//         logger.error(`Error processing letter ${appointmentLetter.id}:`, error);
//       }
//     }

//     if (pdfPaths.length === 0) {
//       throw new Error("Failed to generate any appointment letter PDFs");
//     }

//     await job.progress(85);

//     const zipFileName = `appointment_letters_bulk_${jobId}.zip`;
//     const zipPath = path.join(
//       process.cwd(),
//       "uploads",
//       "bulk-downloads",
//       zipFileName
//     );

//     const zipDir = path.dirname(zipPath);
//     if (!fs.existsSync(zipDir)) {
//       fs.mkdirSync(zipDir, { recursive: true });
//     }

//     await createZip(pdfPaths, zipPath);
//     await job.progress(95);

//     fs.rmSync(tempDir, { recursive: true, force: true });

//     await job.progress(100);

//     console.log(`[Job ${jobId}]Completed! Generated ${pdfPaths.length} PDFs`);
//     logger.info(
//       `Job ${jobId} completed. Generated ${pdfPaths.length} appointment letters`
//     );

//     return {
//       success: true,
//       totalProcessed: pdfPaths.length,
//       totalRequested: appointmentLetters.length,
//       downloadUrl: `/api/appointment-letter/bulk-download/${jobId}`,
//       fileName: zipFileName,
//       zipPath: zipPath,
//     };
//   } catch (error) {
//     console.error(`[Job ${jobId}]  Failed:`, error);
//     logger.error(`Job ${jobId} failed:`, error);
//     throw error;
//   }
// });

// function createZip(files, outputPath) {
//   return new Promise((resolve, reject) => {
//     const output = fs.createWriteStream(outputPath);
//     const archive = archiver("zip", {
//       zlib: { level: 9 },
//     });

//     output.on("close", () => {
//       console.log(`ZIP created: ${archive.pointer()} bytes`);
//       resolve();
//     });

//     archive.on("error", (err) => {
//       reject(err);
//     });

//     archive.pipe(output);

//     files.forEach((file) => {
//       archive.file(file.path, { name: file.name });
//     });

//     archive.finalize();
//   });
// }

// appointmentLetterQueue.on("completed", (job, result) => {
//   console.log(`Job ${job.id} completed:`, result);
//   logger.info(`Job completed:`, result);
// });

// appointmentLetterQueue.on("failed", (job, err) => {
//   console.error(`Job ${job.id} failed:`, err.message);
//   logger.error(`Job failed:`, err.message);
// });

// appointmentLetterQueue.on("progress", (job, progress) => {
//   console.log(`Job ${job.id} Progress: ${progress}%`);
// });

// module.exports = appointmentLetterQueue;

const Queue = require("bull");
const path = require("path");
const fs = require("fs");
const archiver = require("archiver");
const { prisma } = require("../utils/prismaProxy.js");

const appointmentLatterModel = require("../v1/models/AppointmentLatterModel.js");
const { generateAppraisalPDF } = require("../utils/appraisalPDF");

const appointmentLetterQueue = new Queue("appointment-letter-bulk-download", {
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: process.env.REDIS_PORT || 6379,
  },
});

const cancelledJobs = new Set();

appointmentLetterQueue.process(async (job) => {
  const { userId, filters, jobId } = job.data;

  console.log(`[Job ${jobId}] Starting bulk appointment letter download...`);

  try {
    if (cancelledJobs.has(job.id.toString())) {
      console.log(`[Job ${job.id}] Cancelled before starting`);
      cancelledJobs.delete(job.id.toString());
      throw new Error("Job was cancelled");
    }

    await job.progress(10);

    const appointmentLetters = await prisma.hrms_d_appointment_letter.findMany({
      where: filters || {},
      select: {
        id: true,
        designation_id: true,
        candidate_id: true,
        appointment_candidate: {
          select: {
            id: true,
            full_name: true,
          },
        },
      },
    });

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

    const pdfPaths = [];
    const totalLetters = appointmentLetters.length;

    for (let i = 0; i < totalLetters; i++) {
      if (cancelledJobs.has(job.id.toString())) {
        console.log(
          `[Job ${job.id}] Cancelled during processing at ${i}/${totalLetters}`
        );
        cancelledJobs.delete(job.id.toString());
        fs.rmSync(tempDir, { recursive: true, force: true });
        throw new Error("Job was cancelled by user");
      }

      const appointmentLetter = appointmentLetters[i];

      try {
        console.log(
          `[Job ${jobId}] Processing ${i + 1}/${totalLetters}: ${
            appointmentLetter.appointment_candidate?.full_name
          }`
        );

        const pdfData = await appointmentLatterModel.getAppointmentLetterForPDF(
          appointmentLetter.id
        );

        const sanitizedName = (
          appointmentLetter.appointment_candidate?.full_name || "Unknown"
        )
          .replace(/[^a-z0-9]/gi, "_")
          .toLowerCase();
        const fileName = `appointment_letter_${appointmentLetter.id}_${sanitizedName}.pdf`;
        const filePath = path.join(tempDir, fileName);

        await generateAppraisalPDF(pdfData, filePath);
        pdfPaths.push({ path: filePath, name: fileName });

        const progress = 20 + Math.floor(((i + 1) / totalLetters) * 60);
        await job.progress(progress);
      } catch (error) {
        console.error(
          `[Job ${jobId}] Error processing appointment letter ${appointmentLetter.id}:`,
          error
        );
      }
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

    console.log(`[Job ${jobId}] Completed successfully!`);

    return {
      success: true,
      totalProcessed: pdfPaths.length,
      totalRequested: appointmentLetters.length,
      downloadUrl: `/api/appointment-letter/bulk-download/${jobId}`,
      fileName: zipFileName,
      zipPath: zipPath,
    };
  } catch (error) {
    console.error(`[Job ${jobId}] Failed:`, error);
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
      console.log(`ZIP created: ${archive.pointer()} total bytes`);
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

appointmentLetterQueue.removeJob = async (jobId) => {
  try {
    const job = await appointmentLetterQueue.getJob(jobId);

    if (!job) {
      console.log(`[Job ${jobId}] Not found`);
      return false;
    }

    const state = await job.getState();
    console.log(`[Job ${jobId}] Current state: ${state}`);

    cancelledJobs.add(jobId.toString());
    console.log(`[Job ${jobId}] Added to cancellation list`);

    if (state === "completed") {
      console.log(`[Job ${jobId}] Already completed, cleaning up files only`);

      const tempDir = path.join(process.cwd(), "temp", jobId);
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
        console.log(`[Job ${jobId}] Temp directory cleaned`);
      }

      try {
        await job.remove();
      } catch (err) {
        console.log(`[Job ${jobId}] Already removed from queue`);
      }

      cancelledJobs.delete(jobId.toString());
      return true;
    }

    if (state === "failed") {
      console.log(`[Job ${jobId}] Already failed, cleaning up`);

      const tempDir = path.join(process.cwd(), "temp", jobId);
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }

      try {
        await job.remove();
      } catch (err) {
        console.log(`[Job ${jobId}] Already removed from queue`);
      }

      cancelledJobs.delete(jobId.toString());
      return true;
    }

    if (state === "active" || state === "waiting" || state === "delayed") {
      console.log(`[Job ${jobId}] Marked for cancellation (${state})`);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      try {
        await job.remove();
        console.log(`[Job ${jobId}] Removed successfully`);
      } catch (err) {
        console.log(`[Job ${jobId}] Removal attempted: ${err.message}`);
      }

      const tempDir = path.join(process.cwd(), "temp", jobId);
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
        console.log(`[Job ${jobId}] Temp directory cleaned`);
      }

      return true;
    }

    console.log(`[Job ${jobId}] Unknown state: ${state}`);
    cancelledJobs.delete(jobId.toString());
    return false;
  } catch (error) {
    console.error(`[Job ${jobId}] Error removing job:`, error.message);

    try {
      const tempDir = path.join(process.cwd(), "temp", jobId);
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
        console.log(`[Job ${jobId}] Temp directory cleaned despite error`);
      }
    } catch (cleanupError) {
      console.error(`[Job ${jobId}] Cleanup error:`, cleanupError.message);
    }

    throw error;
  }
};

appointmentLetterQueue.getJobDetails = async (jobId) => {
  try {
    const job = await appointmentLetterQueue.getJob(jobId);

    if (!job) {
      return null;
    }

    const state = await job.getState();
    const progress = job._progress || 0;

    return {
      id: job.id,
      state: state,
      progress: progress,
      attempts: job.attemptsMade,
      data: job.data,
      returnvalue: job.returnvalue,
      failedReason: job.failedReason,
      processedOn: job.processedOn,
      finishedOn: job.finishedOn,
      isCancelled: cancelledJobs.has(jobId.toString()),
    };
  } catch (error) {
    console.error(`Error getting job ${jobId}:`, error);
    throw error;
  }
};

appointmentLetterQueue.on("completed", (job, result) => {
  console.log(` Job ${job.id} completed:`, result);
  cancelledJobs.delete(job.id.toString());
});

appointmentLetterQueue.on("failed", (job, err) => {
  console.error(` Job ${job.id} failed:`, err.message);
  cancelledJobs.delete(job.id.toString());
});

appointmentLetterQueue.on("removed", (job) => {
  console.log(` Job ${job.id} was removed/cancelled`);
  cancelledJobs.delete(job.id.toString());
});

module.exports = appointmentLetterQueue;

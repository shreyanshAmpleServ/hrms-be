// const Queue = require("bull");
// const path = require("path");
// const fs = require("fs");
// const archiver = require("archiver");
// const { prisma } = require("../../utils/prismaProxy");
//
// const offerLatterModel = require("../v1/models/offerLatterModel.js");
// const { generateOfferLetterPDF } = require("../utils/offerLetterPDF");

// const offerLetterQueue = new Queue("offer-letter-bulk-download", {
//   redis: {
//     host: process.env.REDIS_HOST || "localhost",
//     port: process.env.REDIS_PORT || 6379,
//   },
// });

// // Process the queue
// offerLetterQueue.process(async (job) => {
//   const { userId, filters, jobId } = job.data;

//   console.log(`[Job ${jobId}] Starting bulk offer letter download...`);

//   try {
//     // Update progress
//     await job.progress(10);

//     // Get all offer letters based on filters
//     const offerLetters = await prisma.hrms_d_offer_letter.findMany({
//       where: filters || {},
//       select: {
//         id: true,
//         position: true,
//         offered_candidate: {
//           select: {
//             full_name: true,
//           },
//         },
//       },
//     });

//     console.log(
//       `[Job ${jobId}] Found ${offerLetters.length} offer letters to process`
//     );

//     if (offerLetters.length === 0) {
//       throw new Error("No offer letters found");
//     }

//     await job.progress(20);

//     // Create temp directory for PDFs
//     const tempDir = path.join(process.cwd(), "temp", jobId);
//     if (!fs.existsSync(tempDir)) {
//       fs.mkdirSync(tempDir, { recursive: true });
//     }

//     // Generate PDFs with progress tracking
//     const pdfPaths = [];
//     const totalLetters = offerLetters.length;

//     for (let i = 0; i < totalLetters; i++) {
//       const offerLetter = offerLetters[i];

//       try {
//         console.log(
//           `[Job ${jobId}] Processing ${i + 1}/${totalLetters}: ${
//             offerLetter.offered_candidate?.full_name
//           }`
//         );

//         // Get PDF data
//         const pdfData = await offerLatterModel.getOfferLetterForPDF(
//           offerLetter.id
//         );

//         // Generate filename
//         const sanitizedName = (
//           offerLetter.offered_candidate?.full_name || "Unknown"
//         )
//           .replace(/[^a-z0-9]/gi, "_")
//           .toLowerCase();
//         const fileName = `offer_letter_${offerLetter.id}_${sanitizedName}.pdf`;
//         const filePath = path.join(tempDir, fileName);

//         // Generate PDF
//         await generateOfferLetterPDF(pdfData, filePath);
//         pdfPaths.push({ path: filePath, name: fileName });

//         // Update progress (20% to 80% for PDF generation)
//         const progress = 20 + Math.floor(((i + 1) / totalLetters) * 60);
//         await job.progress(progress);
//       } catch (error) {
//         console.error(
//           `[Job ${jobId}] Error processing offer letter ${offerLetter.id}:`,
//           error
//         );
//         // Continue with next letter instead of failing entire job
//       }
//     }

//     await job.progress(85);

//     // Create ZIP file
//     const zipFileName = `offer_letters_bulk_${jobId}.zip`;
//     const zipPath = path.join(
//       process.cwd(),
//       "uploads",
//       "bulk-downloads",
//       zipFileName
//     );

//     // Ensure directory exists
//     const zipDir = path.dirname(zipPath);
//     if (!fs.existsSync(zipDir)) {
//       fs.mkdirSync(zipDir, { recursive: true });
//     }

//     await createZip(pdfPaths, zipPath);
//     await job.progress(95);

//     // Clean up temp directory
//     fs.rmSync(tempDir, { recursive: true, force: true });

//     await job.progress(100);

//     console.log(`[Job ${jobId}] Completed successfully!`);

//     return {
//       success: true,
//       totalProcessed: pdfPaths.length,
//       totalRequested: offerLetters.length,
//       downloadUrl: `/api/offer-letter/bulk-download/${jobId}`,
//       fileName: zipFileName,
//       zipPath: zipPath,
//     };
//   } catch (error) {
//     console.error(`[Job ${jobId}] Failed:`, error);
//     throw error;
//   }
// });

// // Helper function to create ZIP
// function createZip(files, outputPath) {
//   return new Promise((resolve, reject) => {
//     const output = fs.createWriteStream(outputPath);
//     const archive = archiver("zip", {
//       zlib: { level: 9 }, // Maximum compression
//     });

//     output.on("close", () => {
//       console.log(`ZIP created: ${archive.pointer()} total bytes`);
//       resolve();
//     });

//     archive.on("error", (err) => {
//       reject(err);
//     });

//     archive.pipe(output);

//     // Add all files to ZIP
//     files.forEach((file) => {
//       archive.file(file.path, { name: file.name });
//     });

//     archive.finalize();
//   });
// }

// // Event handlers
// offerLetterQueue.on("completed", (job, result) => {
//   console.log(`Job ${job.id} completed:`, result);
// });

// offerLetterQueue.on("failed", (job, err) => {
//   console.error(`Job ${job.id} failed:`, err.message);
// });

// module.exports = offerLetterQueue;
const Queue = require("bull");
const path = require("path");
const fs = require("fs");
const archiver = require("archiver");
const { prisma } = require("../../utils/prismaProxy");

const offerLatterModel = require("../v1/models/offerLatterModel.js");
const { generateOfferLetterPDF } = require("../utils/offerLetterPDF");

const offerLetterQueue = new Queue("offer-letter-bulk-download", {
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: process.env.REDIS_PORT || 6379,
  },
});

const cancelledJobs = new Set();

offerLetterQueue.process(async (job) => {
  const { userId, filters, jobId } = job.data;

  console.log(`[Job ${jobId}] Starting bulk offer letter download...`);

  try {
    if (cancelledJobs.has(job.id.toString())) {
      console.log(`[Job ${job.id}] Cancelled before starting`);
      cancelledJobs.delete(job.id.toString());
      throw new Error("Job was cancelled");
    }

    await job.progress(10);

    const offerLetters = await prisma.hrms_d_offer_letter.findMany({
      where: filters || {},
      select: {
        id: true,
        position: true,
        offered_candidate: {
          select: {
            full_name: true,
          },
        },
      },
    });

    console.log(
      `[Job ${jobId}] Found ${offerLetters.length} offer letters to process`
    );

    if (offerLetters.length === 0) {
      throw new Error("No offer letters found");
    }

    await job.progress(20);

    const tempDir = path.join(process.cwd(), "temp", jobId);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const pdfPaths = [];
    const totalLetters = offerLetters.length;

    for (let i = 0; i < totalLetters; i++) {
      if (cancelledJobs.has(job.id.toString())) {
        console.log(
          `[Job ${job.id}] Cancelled during processing at ${i}/${totalLetters}`
        );
        cancelledJobs.delete(job.id.toString());
        fs.rmSync(tempDir, { recursive: true, force: true });
        throw new Error("Job was cancelled by user");
      }

      const offerLetter = offerLetters[i];

      try {
        console.log(
          `[Job ${jobId}] Processing ${i + 1}/${totalLetters}: ${
            offerLetter.offered_candidate?.full_name
          }`
        );

        const pdfData = await offerLatterModel.getOfferLetterForPDF(
          offerLetter.id
        );

        const sanitizedName = (
          offerLetter.offered_candidate?.full_name || "Unknown"
        )
          .replace(/[^a-z0-9]/gi, "_")
          .toLowerCase();
        const fileName = `offer_letter_${offerLetter.id}_${sanitizedName}.pdf`;
        const filePath = path.join(tempDir, fileName);

        await generateOfferLetterPDF(pdfData, filePath);
        pdfPaths.push({ path: filePath, name: fileName });

        const progress = 20 + Math.floor(((i + 1) / totalLetters) * 60);
        await job.progress(progress);
      } catch (error) {
        console.error(
          `[Job ${jobId}] Error processing offer letter ${offerLetter.id}:`,
          error
        );
      }
    }

    await job.progress(85);

    const zipFileName = `offer_letters_bulk_${jobId}.zip`;
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
      totalRequested: offerLetters.length,
      downloadUrl: `/api/offer-letter/bulk-download/${jobId}`,
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

offerLetterQueue.removeJob = async (jobId) => {
  try {
    const job = await offerLetterQueue.getJob(jobId);

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
        console.log(`[Job ${jobId}]  Temp directory cleaned`);
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

offerLetterQueue.getJobDetails = async (jobId) => {
  try {
    const job = await offerLetterQueue.getJob(jobId);

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

offerLetterQueue.on("completed", (job, result) => {
  console.log(`Job ${job.id} completed:`, result);
  cancelledJobs.delete(job.id.toString());
});

offerLetterQueue.on("failed", (job, err) => {
  console.error(` Job ${job.id} failed:`, err.message);
  cancelledJobs.delete(job.id.toString());
});

offerLetterQueue.on("removed", (job) => {
  console.log(` Job ${job.id} was removed/cancelled`);
  cancelledJobs.delete(job.id.toString());
});

module.exports = offerLetterQueue;

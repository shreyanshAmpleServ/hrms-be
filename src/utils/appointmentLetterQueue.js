const Queue = require("bull");
const path = require("path");
const fs = require("fs");
const archiver = require("archiver");
const { getPrismaClient } = require("../config/db.js");

const appointmentLatterModel = require("../v1/models/AppointmentLatterModel.js");
const {
  generateAppointmentLetterPDF,
} = require("../utils/appointmentLetterPDF");

const appointmentLetterQueue = new Queue("appointment-letter-bulk-download", {
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: process.env.REDIS_PORT || 6379,
  },
});

const cancelledJobs = new Set();

appointmentLetterQueue.process(async (job) => {
  const { userId, filters, advancedFilters, jobId, tenantDb } = job.data;

  console.log(
    `[Job ${jobId}] Starting bulk appointment letter download for tenant: ${tenantDb}`
  );

  try {
    if (cancelledJobs.has(job.id.toString())) {
      console.log(`[Job ${job.id}] Cancelled before starting`);
      cancelledJobs.delete(job.id.toString());
      throw new Error("Job was cancelled");
    }

    if (!tenantDb) {
      throw new Error("No tenant database provided in job data");
    }

    const prisma = getPrismaClient(tenantDb);
    console.log(`[Job ${jobId}] Using database: ${tenantDb}`);

    await job.progress(10);

    const appointmentLetters =
      await appointmentLatterModel.getAllAppointmentLettersForBulkDownload(
        filters || {},
        advancedFilters || {},
        tenantDb
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
          appointmentLetter.id,
          tenantDb
        );

        const sanitizedName = (
          appointmentLetter.appointment_candidate?.full_name || "Unknown"
        )
          .replace(/[^a-z0-9]/gi, "_")
          .toLowerCase();
        const fileName = `appointment_letter_${appointmentLetter.id}_${sanitizedName}.pdf`;
        const filePath = path.join(tempDir, fileName);

        await generateAppointmentLetterPDF(pdfData, filePath);
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

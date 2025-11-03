// const Queue = require("bull");
// const path = require("path");
// const fs = require("fs");
// const archiver = require("archiver");
// const prisma = require("../config/prisma");
// const appointmentLatterModel = require("../models/AppointmentLatterModel");
// const {
//   generateAppointmentLetterPDF,
// } = require("../utils/appointmentLetterPDF");

const Queue = require("bull");
const path = require("path");
const fs = require("fs");
const archiver = require("archiver");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const appointmentLatterModel = require("../v1/models/AppointmentLatterModel");
const {
  generateAppointmentLetterPDF,
} = require("../utils/appointmentLetterPDF.js");
const appointmentLetterQueue = new Queue("appointment-letter-bulk-download", {
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: process.env.REDIS_PORT || 6379,
  },
});

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

    // Generate PDFs
    const pdfPaths = [];
    const totalLetters = appointmentLetters.length;

    for (let i = 0; i < totalLetters; i++) {
      const appointmentLetter = appointmentLetters[i];

      try {
        console.log(
          `[Job ${jobId}] Processing ${i + 1}/${totalLetters}: ${
            appointmentLetter.appointed_employee?.full_name
          }`
        );

        // Get PDF data
        const pdfData = await appointmentLatterModel.getAppointmentLetterForPDF(
          appointmentLetter.id
        );

        // Generate filename
        const sanitizedName = (
          appointmentLetter.appointed_employee?.full_name || "Unknown"
        )
          .replace(/[^a-z0-9]/gi, "_")
          .toLowerCase();
        const fileName = `appointment_letter_${appointmentLetter.id}_${sanitizedName}.pdf`;
        const filePath = path.join(tempDir, fileName);

        // Generate PDF
        await generateAppointmentLetterPDF(pdfData, filePath);
        pdfPaths.push({ path: filePath, name: fileName });

        // Update progress (20% to 80% for PDF generation)
        const progress = 20 + Math.floor(((i + 1) / totalLetters) * 60);
        await job.progress(progress);
      } catch (error) {
        console.error(
          `[Job ${jobId}] Error processing appointment letter ${appointmentLetter.id}:`,
          error
        );
        // Continue with next letter
      }
    }

    if (pdfPaths.length === 0) {
      throw new Error("Failed to generate any appointment letter PDFs");
    }

    await job.progress(85);

    // Create ZIP file
    const zipFileName = `appointment_letters_bulk_${jobId}.zip`;
    const zipPath = path.join(
      process.cwd(),
      "uploads",
      "bulk-downloads",
      zipFileName
    );

    // Ensure directory exists
    const zipDir = path.dirname(zipPath);
    if (!fs.existsSync(zipDir)) {
      fs.mkdirSync(zipDir, { recursive: true });
    }

    await createZip(pdfPaths, zipPath);
    await job.progress(95);

    // Clean up temp directory
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

// Helper function to create ZIP
function createZip(files, outputPath) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputPath);
    const archive = archiver("zip", {
      zlib: { level: 9 }, // Maximum compression
    });

    output.on("close", () => {
      console.log(`ZIP created: ${archive.pointer()} total bytes`);
      resolve();
    });

    archive.on("error", (err) => {
      reject(err);
    });

    archive.pipe(output);

    // Add all files to ZIP
    files.forEach((file) => {
      archive.file(file.path, { name: file.name });
    });

    archive.finalize();
  });
}

// Event handlers
appointmentLetterQueue.on("completed", (job, result) => {
  console.log(`Job ${job.id} completed:`, result);
});

appointmentLetterQueue.on("failed", (job, err) => {
  console.error(`Job ${job.id} failed:`, err.message);
});

module.exports = appointmentLetterQueue;

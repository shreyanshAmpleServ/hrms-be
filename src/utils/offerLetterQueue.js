const Queue = require("bull");
const path = require("path");
const fs = require("fs");
const archiver = require("archiver");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const offerLatterModel = require("../v1/models/offerLatterModel.js");
const { generateOfferLetterPDF } = require("../utils/offerLetterPDF");

// Create queue
const offerLetterQueue = new Queue("offer-letter-bulk-download", {
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: process.env.REDIS_PORT || 6379,
  },
});

// Process the queue
offerLetterQueue.process(async (job) => {
  const { userId, filters, jobId } = job.data;

  console.log(`[Job ${jobId}] Starting bulk offer letter download...`);

  try {
    // Update progress
    await job.progress(10);

    // Get all offer letters based on filters
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

    // Create temp directory for PDFs
    const tempDir = path.join(process.cwd(), "temp", jobId);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Generate PDFs with progress tracking
    const pdfPaths = [];
    const totalLetters = offerLetters.length;

    for (let i = 0; i < totalLetters; i++) {
      const offerLetter = offerLetters[i];

      try {
        console.log(
          `[Job ${jobId}] Processing ${i + 1}/${totalLetters}: ${
            offerLetter.offered_candidate?.full_name
          }`
        );

        // Get PDF data
        const pdfData = await offerLatterModel.getOfferLetterForPDF(
          offerLetter.id
        );

        // Generate filename
        const sanitizedName = (
          offerLetter.offered_candidate?.full_name || "Unknown"
        )
          .replace(/[^a-z0-9]/gi, "_")
          .toLowerCase();
        const fileName = `offer_letter_${offerLetter.id}_${sanitizedName}.pdf`;
        const filePath = path.join(tempDir, fileName);

        // Generate PDF
        await generateOfferLetterPDF(pdfData, filePath);
        pdfPaths.push({ path: filePath, name: fileName });

        // Update progress (20% to 80% for PDF generation)
        const progress = 20 + Math.floor(((i + 1) / totalLetters) * 60);
        await job.progress(progress);
      } catch (error) {
        console.error(
          `[Job ${jobId}] Error processing offer letter ${offerLetter.id}:`,
          error
        );
        // Continue with next letter instead of failing entire job
      }
    }

    await job.progress(85);

    // Create ZIP file
    const zipFileName = `offer_letters_bulk_${jobId}.zip`;
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
offerLetterQueue.on("completed", (job, result) => {
  console.log(`Job ${job.id} completed:`, result);
});

offerLetterQueue.on("failed", (job, err) => {
  console.error(`Job ${job.id} failed:`, err.message);
});

module.exports = offerLetterQueue;

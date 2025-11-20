const Queue = require("bull");
const path = require("path");
const fs = require("fs");
const archiver = require("archiver");
const { getPrismaClient } = require("../config/database"); // ✅ Import direct client
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
  const { userId, tenantDb, filters, advancedFilters, jobId } = job.data;

  console.log(
    `[Job ${jobId}] Starting bulk offer letter download for tenant: ${tenantDb}`
  );

  try {
    if (cancelledJobs.has(job.id.toString())) {
      console.log(`[Job ${job.id}] Cancelled before starting`);
      cancelledJobs.delete(job.id.toString());
      throw new Error("Job was cancelled");
    }

    // ✅ Get tenant-specific Prisma client
    if (!tenantDb) {
      throw new Error("No tenant database provided in job data");
    }

    const prisma = getPrismaClient(tenantDb);
    console.log(`[Job ${jobId}] Using database: ${tenantDb}`);

    await job.progress(10);

    // ✅ Build the where clause
    const where = { ...filters };

    if (Object.keys(advancedFilters || {}).length > 0) {
      where.offered_candidate = advancedFilters;
    }

    // ✅ Use tenant-specific Prisma client
    const offerLetters = await prisma.hrms_d_offer_letter.findMany({
      where: where,
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

        // ✅ Pass tenantDb to model function
        const pdfData = await offerLatterModel.getOfferLetterForPDF(
          offerLetter.id,
          tenantDb // Pass tenantDb
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

// ... rest of your queue management code ...

module.exports = offerLetterQueue;

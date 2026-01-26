const Queue = require("bull");
const path = require("path");
const fs = require("fs");
const archiver = require("archiver");
const { getPrismaClient } = require("../config/db.js");
const { withTenantContext } = require("../utils/prismaProxy.js");
const monthlyPayrollModel = require("../v1/models/monthlyPayrollModel.js");
const monthlyPayrollService = require("../v1/services/monthlyPayrollService.js");
const {
  markPayrollsAsPrinted,
} = require("../v1/models/monthlyPayrollModel.js");

const monthlyPayrollQueue = new Queue("monthly-payroll-bulk-download", {
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: process.env.REDIS_PORT || 6379,
  },
});

const cancelledJobs = new Set();

monthlyPayrollQueue.process(async (job) => {
  const { userId, filters, jobId, tenantDb } = job.data;

  console.log(
    `[Job ${jobId}] Starting bulk monthly payroll download for tenant: ${tenantDb}`,
  );

  return withTenantContext(tenantDb, async () => {
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

      const totalCount =
        await monthlyPayrollService.getMonthlyPayrollCountForBulkDownload(
          filters || {},
        );

      console.log(
        `[Job ${jobId}] Found ${totalCount} monthly payroll records to process`,
      );

      if (totalCount === 0) {
        throw new Error("No monthly payroll records found");
      }

      await job.progress(20);

      const tempDir = path.join(process.cwd(), "temp", jobId);
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      const PAGE_SIZE = 1000;
      let processedCount = 0;
      const pdfFiles = [];

      console.log(
        `[Job ${jobId}] Processing ${totalCount} records in batches of ${PAGE_SIZE}`,
      );
      for (let offset = 0; offset < totalCount; offset += PAGE_SIZE) {
        if (cancelledJobs.has(job.id.toString())) {
          console.log(
            `[Job ${job.id}] Cancelled during processing at ${processedCount}/${totalCount}`,
          );
          cancelledJobs.delete(job.id.toString());
          fs.rmSync(tempDir, { recursive: true, force: true });
          throw new Error("Job was cancelled by user");
        }

        console.log(
          `[Job ${jobId}] Processing batch: records ${offset + 1} to ${Math.min(offset + PAGE_SIZE, totalCount)}`,
        );

        const batchPayrolls =
          await monthlyPayrollService.getMonthlyPayrollsPaginatedForBulkDownload(
            filters || {},
            offset,
            PAGE_SIZE,
          );

        for (const payroll of batchPayrolls) {
          try {
            console.log(
              `[Job ${jobId}] Generating PDF for employee: ${payroll.hrms_monthly_payroll_employee?.full_name || "Unknown"} (ID: ${payroll.employee_id})`,
            );

            let pdfFilePath;
            try {
              pdfFilePath = await monthlyPayrollService.downloadPayslipPDF(
                payroll.employee_id,
                payroll.payroll_month,
                payroll.payroll_year,
              );
              console.log(`[Job ${jobId}] PDF generated at: ${pdfFilePath}`);
            } catch (pdfGenError) {
              console.error(
                `[Job ${jobId}] Error generating PDF for employee ${payroll.employee_id}:`,
                pdfGenError,
              );
              throw pdfGenError;
            }

            const employeeName = (
              payroll.hrms_monthly_payroll_employee?.full_name || "Unknown"
            )
              .replace(/[^a-zA-Z0-9]/g, "_")
              .substring(0, 50);
            const employeeCode =
              payroll.hrms_monthly_payroll_employee?.employee_code ||
              payroll.employee_id;
            const filename = `Payslip_${employeeCode}_${employeeName}_${payroll.payroll_month}_${payroll.payroll_year}.pdf`;
            const filePath = path.join(tempDir, filename);

            try {
              if (!fs.existsSync(pdfFilePath)) {
                throw new Error(`PDF file not found at: ${pdfFilePath}`);
              }

              const fileStats = fs.statSync(pdfFilePath);
              if (fileStats.size === 0) {
                throw new Error(`PDF file is empty: ${pdfFilePath}`);
              }

              console.log(
                `[Job ${jobId}] Copying PDF (${fileStats.size} bytes) from ${pdfFilePath} to ${filePath}`,
              );
              fs.copyFileSync(pdfFilePath, filePath);

              const copiedStats = fs.statSync(filePath);
              if (copiedStats.size === 0) {
                throw new Error(`Copied PDF file is empty: ${filePath}`);
              }

              console.log(
                `[Job ${jobId}] PDF copied successfully (${copiedStats.size} bytes)`,
              );
            } catch (copyError) {
              console.error(
                `[Job ${jobId}] Error copying PDF file:`,
                copyError,
              );
              throw new Error(`Failed to copy PDF file: ${copyError.message}`);
            }
            pdfFiles.push({
              filename,
              employeeName:
                payroll.hrms_monthly_payroll_employee?.full_name || "Unknown",
              employeeCode: employeeCode,
              payrollMonth: payroll.payroll_month,
              payrollYear: payroll.payroll_year,
              path: filePath,
            });

            processedCount++;

            const progress = Math.round((processedCount / totalCount) * 100);
            await job.progress(progress, {
              processedCount,
              totalCount,
              currentEmployee:
                payroll.hrms_monthly_payroll_employee?.full_name || "Unknown",
              status: "Generating PDFs",
            });
          } catch (pdfError) {
            console.error(
              `[Job ${jobId}] Error generating PDF for employee ${payroll.employee_id}:`,
              pdfError,
            );
            processedCount++;
          }
        }
      }

      await job.progress(85);

      const zipFileName = `monthly_payroll_bulk_${jobId}.zip`;
      const zipPath = path.join(
        process.cwd(),
        "uploads",
        "bulk-downloads",
        zipFileName,
      );

      const zipDir = path.dirname(zipPath);
      if (!fs.existsSync(zipDir)) {
        fs.mkdirSync(zipDir, { recursive: true });
      }

      const filesForZip = pdfFiles.map((pdfFile) => ({
        path: pdfFile.path,
        name: pdfFile.filename,
      }));

      await createZip(filesForZip, zipPath);
      await job.progress(95);

      try {
        console.log(`[Job ${jobId}] Marking payrolls as printed...`);
        console.log(
          `[Job ${jobId}] Filters:`,
          JSON.stringify(filters, null, 2),
        );
        console.log(`[Job ${jobId}] UserId:`, userId);
        console.log(`[Job ${jobId}] TenantDb:`, tenantDb);

        const markedCount = await markPayrollsAsPrinted(
          filters,
          userId,
          tenantDb,
        );

        console.log(
          `[Job ${jobId}] Marked ${markedCount} payroll records as printed`,
        );

        if (markedCount === 0) {
          console.log(
            `[Job ${jobId}] WARNING: No records were marked as printed. This might indicate an issue.`,
          );
        }
      } catch (markError) {
        console.error(
          `[Job ${jobId}] Error marking payrolls as printed:`,
          markError,
        );
        console.error(`[Job ${jobId}] Error details:`, markError.message);
      }

      fs.rmSync(tempDir, { recursive: true, force: true });

      await job.progress(100);

      console.log(
        `[Job ${jobId}] Completed successfully! Processed ${processedCount} records`,
      );

      return {
        success: true,
        totalProcessed: processedCount,
        totalRequested: totalCount,
        downloadUrl: `/api/monthly-payroll/bulk-download/${jobId}`,
        fileName: zipFileName,
        zipPath: zipPath,
      };
    } catch (error) {
      console.error(`[Job ${jobId}] Failed:`, error);
      throw error;
    }
  });
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

monthlyPayrollQueue.removeJob = async (jobId) => {
  try {
    const job = await monthlyPayrollQueue.getJob(jobId);

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

monthlyPayrollQueue.getJobDetails = async (jobId) => {
  try {
    const job = await monthlyPayrollQueue.getJob(jobId);

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

monthlyPayrollQueue.on("completed", (job, result) => {
  console.log(` Job ${job.id} completed:`, result);
  cancelledJobs.delete(job.id.toString());
});

monthlyPayrollQueue.on("failed", (job, err) => {
  console.error(` Job ${job.id} failed:`, err.message);
  cancelledJobs.delete(job.id.toString());
});

monthlyPayrollQueue.on("removed", (job) => {
  console.log(` Job ${job.id} was removed/cancelled`);
  cancelledJobs.delete(job.id.toString());
});

module.exports = monthlyPayrollQueue;

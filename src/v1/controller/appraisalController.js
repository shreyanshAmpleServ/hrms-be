const appraisalService = require("../services/appraisalService");
const { generateAppraisalPDF } = require("../../utils/appraisalPDF.js");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const appraisalQueue = require("../../utils/appraisalQueue.js");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const CustomError = require("../../utils/CustomError");
const moment = require("moment");

const createAppraisalEntry = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      createdby: req.user.id,
      log_inst: req.user.log_inst,
    };
    const reqData = await appraisalService.createAppraisalEntry(data);
    res.status(201).success("Appraisal created successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const findAppraisalEntryById = async (req, res, next) => {
  try {
    const reqData = await appraisalService.findAppraisalEntryById(
      req.params.id
    );
    if (!reqData) throw new CustomError("Appraisal not found", 404);
    res.status(200).success(null, reqData);
  } catch (error) {
    next(error);
  }
};

const updateAppraisalEntry = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      updatedby: req.user.id,
      log_inst: req.user.log_inst,
    };
    const reqData = await appraisalService.updateAppraisalEntry(
      req.params.id,
      data
    );
    res.status(200).success("Appraisal updated successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const deleteAppraisalEntry = async (req, res, next) => {
  try {
    await appraisalService.deleteAppraisalEntry(req.params.id);
    res.status(200).success("Appraisal deleted successfully", null);
  } catch (error) {
    next(error);
  }
};

const getAllAppraisalEntry = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate } = req.query;
    const data = await appraisalService.getAllAppraisalEntry(
      search,
      Number(page),
      Number(size),
      startDate && moment(startDate),
      endDate && moment(endDate)
    );
    res.status(200).success(null, data);
  } catch (error) {
    next(error);
  }
};

const downloadAppraisalPDF = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log(`Downloading appraisal PDF for ID: ${id}`);

    const appraisalData = await appraisalService.getAppraisalForPDF(id);

    const timestamp = Date.now();
    const fileName = `appraisal_${id}_${timestamp}.pdf`;
    const uploadDir = path.join(process.cwd(), "uploads", "appraisals");

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, fileName);

    await generateAppraisalPDF(appraisalData, filePath);

    console.log(`[info] Appraisal PDF generated: ${filePath}`);

    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error("Error sending file:", err);
        return next(err);
      }

      setTimeout(() => {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`Cleaned up: ${filePath}`);
        }
      }, 5000);
    });
  } catch (error) {
    next(error);
  }
};

const bulkDownloadAppraisals = async (req, res, next) => {
  try {
    const {
      employee_id_from,
      employee_id_to,
      department_id_from,
      department_id_to,
      startDate,
      endDate,
      status,
    } = req.query;

    const filters = {};
    const advancedFilters = {};

    if (employee_id_from && employee_id_to) {
      const minId = Number(employee_id_from);
      const maxId = Number(employee_id_to);
      filters.employee_id = {
        gte: Math.min(minId, maxId),
        lte: Math.max(minId, maxId),
      };
      console.log(
        `Employee Range: ${Math.min(minId, maxId)} to ${Math.max(minId, maxId)}`
      );
    } else if (employee_id_from) {
      filters.employee_id = { gte: Number(employee_id_from) };
    } else if (employee_id_to) {
      filters.employee_id = { lte: Number(employee_id_to) };
    }

    if (status) {
      filters.status = status;
    }

    if (startDate && endDate) {
      filters.review_date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    if (department_id_from && department_id_to) {
      const minDept = Number(department_id_from);
      const maxDept = Number(department_id_to);
      advancedFilters.department_id = {
        gte: Math.min(minDept, maxDept),
        lte: Math.max(minDept, maxDept),
      };
      console.log(
        `Department Range: ${Math.min(minDept, maxDept)} to ${Math.max(
          minDept,
          maxDept
        )}`
      );
    } else if (department_id_from) {
      advancedFilters.department_id = { gte: Number(department_id_from) };
    } else if (department_id_to) {
      advancedFilters.department_id = { lte: Number(department_id_to) };
    }

    console.log("Validating appraisals exist...");

    const validationWhere = { ...filters };
    if (Object.keys(advancedFilters).length > 0) {
      const employees = await prisma.hrms_d_employee.findMany({
        where: advancedFilters,
        select: { id: true },
      });
      const employeeIds = employees.map((e) => e.id);
      validationWhere.employee_id = { in: employeeIds };
    }

    const appraisalCount = await prisma.hrms_d_appraisal.count({
      where: validationWhere,
    });

    if (appraisalCount === 0) {
      throw new CustomError(
        "No appraisals found matching the provided filters",
        404
      );
    }

    console.log(`Found ${appraisalCount} appraisal(s) matching filters`);

    const jobId = uuidv4();

    const job = await appraisalQueue.add({
      userId: req.user.id,
      filters: filters,
      advancedFilters: advancedFilters,
      jobId: jobId,
    });

    console.log(`Bulk appraisal download job created: ${job.id}`);

    res
      .status(202)
      .success("Bulk download started. Use job ID to check progress.", {
        jobId: job.id,
        statusUrl: `/api/appraisal/bulk-download/status/${job.id}`,
        totalAppraisals: appraisalCount,
        appliedFilters: {
          employees:
            employee_id_from || employee_id_to
              ? `${employee_id_from || "Any"} to ${employee_id_to || "Any"}`
              : "All",
          departments:
            department_id_from || department_id_to
              ? `${department_id_from || "Any"} to ${department_id_to || "Any"}`
              : "All",
          status: status || "All",
          dateRange:
            startDate && endDate ? `${startDate} to ${endDate}` : "All",
        },
      });
  } catch (error) {
    next(error);
  }
};

const checkBulkDownloadStatus = async (req, res, next) => {
  try {
    const jobId = req.params.jobId;

    const job = await appraisalQueue.getJob(jobId);

    if (!job) {
      throw new CustomError("Job not found", 404);
    }

    const state = await job.getState();
    const progress = job.progress();
    const result = job.returnvalue;

    res.status(200).success(null, {
      jobId: job.id,
      status: state,
      progress: progress,
      result: result,
    });
  } catch (error) {
    next(error);
  }
};

const downloadBulkAppraisals = async (req, res, next) => {
  try {
    const jobId = req.params.jobId;

    const job = await appraisalQueue.getJob(jobId);

    if (!job) {
      throw new CustomError("Job not found", 404);
    }

    const state = await job.getState();

    if (state !== "completed") {
      throw new CustomError(
        `Job is ${state}. Please wait for completion.`,
        400
      );
    }

    const result = job.returnvalue;

    if (!result || !result.zipPath) {
      throw new CustomError("Download file not found", 404);
    }

    if (!fs.existsSync(result.zipPath)) {
      throw new CustomError("File has been deleted or expired", 410);
    }

    res.download(result.zipPath, result.fileName, (err) => {
      if (err) {
        console.error("Error sending file:", err);
        next(err);
      }

      setTimeout(() => {
        if (fs.existsSync(result.zipPath)) {
          fs.unlinkSync(result.zipPath);
          console.log(`Cleaned up: ${result.zipPath}`);
        }
      }, 3600000);
    });
  } catch (error) {
    next(error);
  }
};

const stopBulkDownloadJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: "Job ID is required",
      });
    }

    console.log(`Attempting to stop job: ${jobId}`);

    const jobDetails = await appraisalQueue.getJobDetails(jobId);

    if (!jobDetails) {
      return res.status(404).json({
        success: false,
        message: `Job ${jobId} not found`,
        jobId: jobId,
      });
    }

    console.log(`Job ${jobId} state: ${jobDetails.state}`);

    try {
      const result = await appraisalQueue.removeJob(jobId);

      if (result) {
        return res.status(200).json({
          success: true,
          message: `Job ${jobId} has been stopped (was in ${jobDetails.state} state)`,
          jobId: jobId,
          previousState: jobDetails.state,
        });
      } else {
        return res.status(400).json({
          success: false,
          message: `Could not stop job ${jobId}`,
          jobId: jobId,
          state: jobDetails.state,
        });
      }
    } catch (removeError) {
      console.log(`Job ${jobId} removal had issues, but cleanup attempted`);
      return res.status(200).json({
        success: true,
        message: `Job ${jobId} cleanup completed (was in ${jobDetails.state} state)`,
        jobId: jobId,
        note: "Job may have already finished",
      });
    }
  } catch (error) {
    console.error("Error stopping job:", error);
    res.status(500).json({
      success: false,
      message: "Error stopping job",
      error: error.message,
    });
  }
};

module.exports = {
  createAppraisalEntry,
  findAppraisalEntryById,
  updateAppraisalEntry,
  deleteAppraisalEntry,
  getAllAppraisalEntry,
  downloadAppraisalPDF,
  bulkDownloadAppraisals,
  checkBulkDownloadStatus,
  downloadBulkAppraisals,
  stopBulkDownloadJob,
};

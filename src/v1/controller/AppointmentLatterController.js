const AppointmentLatterService = require("../services/AppointmentLatterService.js");
const CustomError = require("../../utils/CustomError");
const moment = require("moment");
const fs = require("fs");
const appointmentLetterQueue = require("../../utils/appointmentLetterQueue.js");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const {
  generateAppointmentLetterPDF,
} = require("../../utils/appointmentLetterPDF.js");

const createAppointmentLatter = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      createdby: req.user.employee_id,
      log_inst: req.user.log_inst,
    };
    const reqData = await AppointmentLatterService.createAppointmentLatter(
      data
    );
    res.status(201).success("Appointment latter created successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const findAppointmentLatterById = async (req, res, next) => {
  try {
    const reqData = await AppointmentLatterService.findAppointmentLatterById(
      req.params.id
    );
    if (!reqData) throw new CustomError("Appointment latter not found", 404);
    res.status(200).success(null, reqData);
  } catch (error) {
    next(error);
  }
};

const updateAppointmentLatter = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      updatedby: req.user.employee_id,
      log_inst: req.user.log_inst,
    };
    const reqData = await AppointmentLatterService.updateAppointmentLatter(
      req.params.id,
      data
    );
    res.status(200).success("Appointment latter updated successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const deleteAppointmentLatter = async (req, res, next) => {
  try {
    await AppointmentLatterService.deleteAppointmentLatter(req.params.id);
    res.status(200).success("Appointment latter deleted successfully", null);
  } catch (error) {
    next(error);
  }
};

const getAllAppointmentLatter = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate, candidate_id } = req.query;
    const data = await AppointmentLatterService.getAllAppointmentLatter(
      search,
      Number(page),
      Number(size),
      startDate && moment(startDate),
      endDate && moment(endDate),
      candidate_id ? parseInt(candidate_id) : null
    );
    res.status(200).success(null, data);
  } catch (error) {
    next(error);
  }
};
const downloadAppointmentLetterPDF = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log(`Downloading appointment letter PDF for ID: ${id}`);

    const appointmentLetterData =
      await AppointmentLatterService.getAppointmentLetterForPDF(id);

    const timestamp = Date.now();
    const fileName = `appointment_letter_${id}_${timestamp}.pdf`;
    const uploadDir = path.join(
      process.cwd(),
      "uploads",
      "appointment-letters"
    );

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, fileName);

    await generateAppointmentLetterPDF(appointmentLetterData, filePath);

    console.log(`[info] Appointment letter PDF generated: ${filePath}`);

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

const bulkDownloadAppointmentLetters = async (req, res, next) => {
  try {
    const {
      candidate_id_from,
      candidate_id_to,
      department_id_from,
      department_id_to,
      designation_id_from,
      designation_id_to,
      startDate,
      endDate,
      status,
    } = req.query;

    const filters = {};
    const advancedFilters = {};

    if (candidate_id_from && candidate_id_to) {
      const minId = Number(candidate_id_from);
      const maxId = Number(candidate_id_to);

      filters.candidate_id = {
        gte: Math.min(minId, maxId),
        lte: Math.max(minId, maxId),
      };

      console.log(
        `Candidate Range: ${Math.min(minId, maxId)} to ${Math.max(
          minId,
          maxId
        )}`
      );
    } else if (candidate_id_from) {
      filters.candidate_id = { gte: Number(candidate_id_from) };
    } else if (candidate_id_to) {
      filters.candidate_id = { lte: Number(candidate_id_to) };
    }

    if (status) {
      filters.status = status;
    }

    if (startDate && endDate) {
      filters.appointment_date = {
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

    if (designation_id_from && designation_id_to) {
      const minDesig = Number(designation_id_from);
      const maxDesig = Number(designation_id_to);

      advancedFilters.designation_id = {
        gte: Math.min(minDesig, maxDesig),
        lte: Math.max(minDesig, maxDesig),
      };

      console.log(
        `Designation Range: ${Math.min(minDesig, maxDesig)} to ${Math.max(
          minDesig,
          maxDesig
        )}`
      );
    } else if (designation_id_from) {
      advancedFilters.designation_id = { gte: Number(designation_id_from) };
    } else if (designation_id_to) {
      advancedFilters.designation_id = { lte: Number(designation_id_to) };
    }

    console.log("Validating employees exist...");

    const validationWhere = {
      ...filters,
    };

    if (Object.keys(advancedFilters).length > 0) {
      validationWhere.appointed_employee = advancedFilters;
    }

    const appointmentCount = await prisma.hrms_d_appointment_letter.count({
      where: validationWhere,
    });

    if (appointmentCount === 0) {
      throw new CustomError(
        "No employees found matching the provided filters",
        404
      );
    }

    console.log(
      `Found ${appointmentCount} appointment letter(s) matching filters`
    );

    const jobId = uuidv4();

    const job = await appointmentLetterQueue.add({
      userId: req.user.id,
      filters: filters,
      advancedFilters: advancedFilters,
      jobId: jobId,
    });

    console.log(`Bulk appointment letter download job created: ${job.id}`);

    res
      .status(202)
      .success("Bulk download started. Use job ID to check progress.", {
        jobId: job.id,
        statusUrl: `/api/appointment-letter/bulk-download/status/${job.id}`,
        totalAppointmentLetters: appointmentCount,
        appliedFilters: {
          employees:
            candidate_id_from || candidate_id_to
              ? `${candidate_id_from || "Any"} to ${candidate_id_to || "Any"}`
              : "All",
          departments:
            department_id_from || department_id_to
              ? `${department_id_from || "Any"} to ${department_id_to || "Any"}`
              : "All",
          designations:
            designation_id_from || designation_id_to
              ? `${designation_id_from || "Any"} to ${
                  designation_id_to || "Any"
                }`
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

    const job = await appointmentLetterQueue.getJob(jobId);

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

const downloadBulkAppointmentLetters = async (req, res, next) => {
  try {
    const jobId = req.params.jobId;

    const job = await appointmentLetterQueue.getJob(jobId);

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

    // Send file
    res.download(result.zipPath, result.fileName, (err) => {
      if (err) {
        console.error("Error sending file:", err);
        next(err);
      }

      // Delete file after 1 hour
      setTimeout(() => {
        if (fs.existsSync(result.zipPath)) {
          fs.unlinkSync(result.zipPath);
          console.log(`Cleaned up: ${result.zipPath}`);
        }
      }, 3600000); // 1 hour
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAppointmentLatter,
  findAppointmentLatterById,
  updateAppointmentLatter,
  deleteAppointmentLatter,
  getAllAppointmentLatter,
  downloadAppointmentLetterPDF,
  bulkDownloadAppointmentLetters,
  checkBulkDownloadStatus,
  downloadBulkAppointmentLetters,
};

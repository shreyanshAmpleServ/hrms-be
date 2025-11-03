const offerLatterService = require("../services/offerLatterService");
const CustomError = require("../../utils/CustomError");
const moment = require("moment");
const { generateOfferLetterPDF } = require("../../utils/offerLetterPDF");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const offerLetterQueue = require("../../utils/offerLetterQueue");

const createOfferLetter = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      createdby: req.user.employee_id,
      log_inst: req.user.log_inst,
    };
    const reqData = await offerLatterService.createOfferLetter(data);
    res.status(201).success("Offer letter created successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const findOfferLetterById = async (req, res, next) => {
  try {
    const reqData = await offerLatterService.findOfferLetterById(req.params.id);
    if (!reqData) throw new CustomError("Offer letter not found", 404);
    res.status(200).success(null, reqData);
  } catch (error) {
    next(error);
  }
};

const updateOfferLetter = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      updatedby: req.user.employee_id,
      log_inst: req.user.log_inst,
    };
    const reqData = await offerLatterService.updateOfferLetter(
      req.params.id,
      data
    );
    res.status(200).success("Offer letter updated successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const deleteOfferLetter = async (req, res, next) => {
  try {
    await offerLatterService.deleteOfferLetter(req.params.id);
    res.status(200).success("Offer letter deleted successfully", null);
  } catch (error) {
    next(error);
  }
};

const getAllOfferLetter = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate, candidate_id } = req.query;
    const data = await offerLatterService.getAllOfferLetter(
      search,
      Number(page),
      Number(size),
      startDate && moment(startDate),
      endDate && moment(endDate),
      candidate_id
    );
    res.status(200).success(null, data);
  } catch (error) {
    next(error);
  }
};

const updateOfferLetterStatus = async (req, res, next) => {
  try {
    console.log("Approver ID from token:", req.user.employee_id);
    const status = req.body.status;
    const data = {
      status,
      updatedby: req.user.employee_id,
      updatedate: new Date(),
    };

    const reqData = await offerLatterService.updateOfferLetterStatus(
      req.params.id,
      data
    );
    res
      .status(200)
      .success("Offer letter status updated successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const downloadOfferLetterPDF = async (req, res, next) => {
  try {
    const offerId = req.params.id;

    if (!offerId) {
      throw new CustomError("Offer letter ID is required", 400);
    }

    console.log("Downloading offer letter PDF for ID:", offerId);

    const offerData = await offerLatterService.getOfferLetterForPDF(offerId);

    const fileName = `offer_letter_${offerId}_${Date.now()}.pdf`;
    const filePath = path.join(
      process.cwd(),
      "uploads",
      "offer-letters",
      fileName
    );

    await generateOfferLetterPDF(offerData, filePath);

    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error("Error sending file:", err);
        next(err);
      }

      setTimeout(() => {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }, 5000);
    });
  } catch (error) {
    next(error);
  }
};

const bulkDownloadOfferLetters = async (req, res, next) => {
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
      console.log(`Candidate From: ${candidate_id_from}`);
    } else if (candidate_id_to) {
      filters.candidate_id = { lte: Number(candidate_id_to) };
      console.log(`Candidate To: ${candidate_id_to}`);
    }

    if (status) {
      filters.status = status;
    }

    if (startDate && endDate) {
      filters.offer_date = {
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
      console.log(`Department From: ${department_id_from}`);
    } else if (department_id_to) {
      advancedFilters.department_id = { lte: Number(department_id_to) };
      console.log(`Department To: ${department_id_to}`);
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
      console.log(`Designation From: ${designation_id_from}`);
    } else if (designation_id_to) {
      advancedFilters.designation_id = { lte: Number(designation_id_to) };
      console.log(`Designation To: ${designation_id_to}`);
    }

    const jobId = uuidv4();

    const job = await offerLetterQueue.add({
      userId: req.user.id,
      filters: filters,
      advancedFilters: advancedFilters,
      jobId: jobId,
    });

    console.log(`Bulk download job created: ${job.id}`);
    console.log(`Filters:`, JSON.stringify(filters, null, 2));
    console.log(`Advanced Filters:`, JSON.stringify(advancedFilters, null, 2));

    res
      .status(202)
      .success("Bulk download started. Use job ID to check progress.", {
        jobId: job.id,
        statusUrl: `/api/offer-letter/bulk-download/status/${job.id}`,
        appliedFilters: {
          candidates:
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

    const job = await offerLetterQueue.getJob(jobId);

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

const downloadBulkOfferLetters = async (req, res, next) => {
  try {
    const jobId = req.params.jobId;

    const job = await offerLetterQueue.getJob(jobId);

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

module.exports = {
  createOfferLetter,
  findOfferLetterById,
  updateOfferLetter,
  deleteOfferLetter,
  getAllOfferLetter,
  updateOfferLetterStatus,
  downloadOfferLetterPDF,
  bulkDownloadOfferLetters,
  checkBulkDownloadStatus,
  downloadBulkOfferLetters,
};

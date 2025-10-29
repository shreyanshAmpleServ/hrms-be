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
      createdby: req.user.id,
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
      updatedby: req.user.id,
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
    const { candidate_id, startDate, endDate, status } = req.query;

    const filters = {};
    if (candidate_id) filters.candidate_id = Number(candidate_id);
    if (status) filters.status = status;
    if (startDate && endDate) {
      filters.offer_date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const jobId = uuidv4();

    const job = await offerLetterQueue.add({
      userId: req.user.id,
      filters: filters,
      jobId: jobId,
    });

    console.log(`Bulk download job created: ${job.id}`);

    res
      .status(202)
      .success("Bulk download started. Use job ID to check progress.", {
        jobId: job.id,
        statusUrl: `/api/offer-letter/bulk-download/status/${job.id}`,
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

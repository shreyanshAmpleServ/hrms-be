const ResumeUploadService = require("../services/ResumeUploadService");
const CustomError = require("../../utils/CustomError");
const moment = require("moment");
const { getPrisma } = require("../../config/prismaContext.js");
const {
  uploadToBackblaze,
  deleteFromBackblaze,
} = require("../../utils/uploadBackblaze");

const createResumeUpload = async (req, res, next) => {
  try {
    if (!req.file) throw new CustomError("No file uploaded", 400);

    const imageUrl = await uploadToBackblaze(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      "Resume"
    );

    const data = {
      ...req.body,
      resume_path: imageUrl,
      createdby: req.user.id,
      log_inst: req.user.log_inst,
    };

    const reqData = await ResumeUploadService.createResumeUpload(data);
    res.status(201).success("Resume created successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const findResumeUploadById = async (req, res, next) => {
  try {
    const reqData = await ResumeUploadService.findResumeUploadById(
      req.params.id
    );
    if (!reqData) throw new CustomError("Resume not found", 404);
    res.status(200).success(null, reqData);
  } catch (error) {
    next(error);
  }
};

const updateResumeUpload = async (req, res, next) => {
  try {
    const existingData = await ResumeUploadService.findResumeUploadById(
      req.params.id
    );
    if (!existingData) throw new CustomError("Resume not found", 404);

    let imageUrl = existingData.resume_path;

    const safeDeleteFromBackblaze = async (fileUrl) => {
      if (!fileUrl) return;

      try {
        console.log(`Attempting to delete resume file: ${fileUrl}`);
        await deleteFromBackblaze(fileUrl);
        console.log(`Successfully deleted resume file: ${fileUrl}`);
      } catch (error) {
        console.log(`Failed to delete old resume file:`, error.message);
        console.log(`File URL: ${fileUrl}`);
        console.log(`Error details:`, error);
      }
    };

    if (
      req.file &&
      req.file.buffer &&
      req.file.originalname &&
      req.file.mimetype
    ) {
      try {
        imageUrl = await uploadToBackblaze(
          req.file.buffer,
          req.file.originalname,
          req.file.mimetype,
          "Resume"
        );
        console.log(`New resume file uploaded: ${imageUrl}`);

        if (existingData.resume_path && existingData.resume_path !== imageUrl) {
          await safeDeleteFromBackblaze(existingData.resume_path);
        }
      } catch (error) {
        console.log("Failed to upload new resume file:", error.message);
        throw new Error("Failed to upload new resume file");
      }
    }

    const data = {
      ...req.body,
      resume_path: imageUrl,
      updatedby: req.user.id,
      log_inst: req.user.log_inst,
    };

    const reqData = await ResumeUploadService.updateResumeUpload(
      req.params.id,
      data
    );
    console.log("reqData", reqData);
    res.status(200).success("Resume updated successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const deleteResumeUpload = async (req, res, next) => {
  try {
    const existingData = await ResumeUploadService.findResumeUploadById(
      req.params.id
    );

    await ResumeUploadService.deleteResumeUpload(req.params.id);

    if (existingData && existingData.resume_path) {
      try {
        await deleteFromBackblaze(existingData.resume_path);
        console.log(`Deleted resume file: ${existingData.resume_path}`);
      } catch (error) {
        console.log(
          `Failed to delete resume file from storage: ${error.message}`
        );
      }
    }

    res.status(200).success("Resume deleted successfully", null);
  } catch (error) {
    next(error);
  }
};

const getAllResumeUpload = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate, candidate_id } = req.query;
    const data = await ResumeUploadService.getAllResumeUpload(
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

module.exports = {
  createResumeUpload,
  findResumeUploadById,
  updateResumeUpload,
  deleteResumeUpload,
  getAllResumeUpload,
};

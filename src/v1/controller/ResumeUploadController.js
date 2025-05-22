const ResumeUploadService = require("../services/ResumeUploadService");
const CustomError = require("../../utils/CustomError");
const {
  uploadToBackblaze,
  deleteFromBackblaze,
} = require("../../utils/uploadBackblaze");

const createResumeUpload = async (req, res, next) => {
  try {
    let imageUrl = null;
    if (req.file) {
      imageUrl = await uploadToBackblaze(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        "Resume"
      );
    }
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
    const existingData = await ResumeUploadService.findResumeUploadById(req.params.id);
    if (!existingData) throw new CustomError("Resume not found", 404);
    let imageUrl = existingData.resume_path;  

    // Upload the file to Backblaze
  if (req.file && req.file.buffer && req.file.originalname && req.file.mimetype) {
      imageUrl = await uploadToBackblaze(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        "Resume"
      );
    }
    const data = {
      ...req.body,
      resume_path: req.file ? imageUrl : existingData.resume_path,
      updatedby: req.user.id,
      log_inst: req.user.log_inst,
    };
    const reqData = await ResumeUploadService.updateResumeUpload(
      req.params.id,
      data
    );
    console.log("reqData", reqData);
    res.status(200).success("Resume updated successfully", reqData);
    if (req.file) {
      if (existingData.image) {
        await deleteFromBackblaze(existingData.image); // Delete the old logo
      }
    }
  } catch (error) {
    next(error);
  }
};

const deleteResumeUpload = async (req, res, next) => {
  try {
    const existingData = await ResumeUploadService.findResumeUploadById(req.params.id);

    await ResumeUploadService.deleteResumeUpload(req.params.id);
    res.status(200).success("Resume deleted successfully", null);
    if (existingData.image) {
      await deleteFromBackblaze(existingData.image); // Delete the old logo
    }
  } catch (error) {
    next(error);
  }
};

const getAllResumeUpload = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate } = req.query;
    const data = await ResumeUploadService.getAllResumeUpload(
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

module.exports = {
  createResumeUpload,
  findResumeUploadById,
  updateResumeUpload,
  deleteResumeUpload,
  getAllResumeUpload,
};

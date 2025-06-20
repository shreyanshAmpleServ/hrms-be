const trainingSessionService = require("../services/trainingSessionService.js");
const CustomError = require("../../utils/CustomError.js");
const moment = require("moment");
const fs = require("fs");
const fsPromises = require("fs").promises;
const { uploadToBackblaze } = require("../../utils/uploadBackblaze.js");
const { log } = require("console");

// Create
const createTrainingSession = async (req, res, next) => {
  try {
    if (!req.file) throw new CustomError("No file uploaded", 400);

    const fileBuffer = await fs.promises.readFile(req.file.path);
    const fileUrl = await uploadToBackblaze(
      fileBuffer,
      req.file.originalname,
      req.file.mimetype,
      "training_material_path"
    );

    const trainingData = {
      ...req.body,
      training_material_path: fileUrl,
      createdby: req.user.id,
    };

    const result = await trainingSessionService.createTrainingSession(
      trainingData
    );
    res.status(201).success("Training Session Created Successfully", result);
  } catch (error) {
    next(new CustomError(error.message, 400));
  }
};

// Get by ID
const findTrainingSessionById = async (req, res, next) => {
  try {
    const data = await trainingSessionService.getTrainingSessionById(
      req.params.id
    );
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(new CustomError(error.message, 400));
  }
};

// Update
const updateTrainingSession = async (req, res, next) => {
  try {
    const existingTrainingSession =
      await trainingSessionService.getTrainingSessionById(req.params.id);

    if (!existingTrainingSession) {
      throw new CustomError("Training session not found", 404);
    }

    let fileUrl = existingTrainingSession.training_material_path;

    if (req.file) {
      const fileBuffer = await fs.promises.readFile(req.file.path);

      fileUrl = await uploadToBackblaze(
        fileBuffer,
        req.file.originalname,
        req.file.mimetype,
        "training_material_path"
      );
    }

    const trainingData = {
      ...req.body,
      training_material_path: fileUrl,
      updatedby: req.user.id,
    };

    const result = await trainingSessionService.updateTrainingSession(
      req.params.id,
      trainingData
    );
    res.status(200).success("Training Session updated Successfully", result);
  } catch (error) {
    next(new CustomError(error.message, 400));
  }
};

// Delete
const deleteTrainingSession = async (req, res, next) => {
  try {
    await trainingSessionService.deleteTrainingSession(req.params.id);
    res
      .status(200)
      .json({ success: true, message: "Training session deleted" });
  } catch (error) {
    next(new CustomError(error.message, 400));
  }
};

// Get all
const getAllTrainingSession = async (req, res, next) => {
  try {
    const { search, page, size, startDate, endDate } = req.query;
    const data = await trainingSessionService.getAllTrainingSession(
      search,
      Number(page),
      Number(size),
      startDate && moment(startDate),
      endDate && moment(endDate)
    );
    res.status(200).json({ success: true, ...data });
  } catch (error) {
    next(new CustomError(error.message, 400));
  }
};

const updateTrainingSessionStatus = async (req, res, next) => {
  try {
    console.log("Approver ID from token:", req.user.employee_id);
    const status = req.body.status;
    const data = {
      status,
      updatedby: req.user.employee_id,
      updatedate: new Date(),
    };

    const reqData = await trainingSessionService.updateTrainingSessionStatus(
      req.params.id,
      data
    );
    res.status(200).success("Leave status updated successfully", reqData);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTrainingSession,
  findTrainingSessionById,
  updateTrainingSession,
  deleteTrainingSession,
  getAllTrainingSession,
  updateTrainingSessionStatus,
};

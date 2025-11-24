const trainingSessionService = require("../services/trainingSessionService.js");
const CustomError = require("../../utils/CustomError.js");
const moment = require("moment");
const { uploadToBackblaze } = require("../../utils/uploadBackblaze.js");

const createTrainingSession = async (req, res, next) => {
  try {
    let fileUrl = null;

    if (req.file) {
      try {
        const fileBuffer = req.file.buffer;

        fileUrl = await uploadToBackblaze(
          fileBuffer,
          req.file.originalname,
          req.file.mimetype,
          "training_material_path"
        );

        console.log(" File uploaded to Backblaze:", fileUrl);
      } catch (uploadError) {
        console.error("❌ File upload error:", uploadError);
        throw new CustomError(
          `File upload failed: ${uploadError.message}`,
          500
        );
      }
    }

    const trainingData = {
      ...req.body,
      training_material_path: fileUrl,
      createdby: req.user?.userId || req.user?.id || 1,
      log_inst: req.user?.log_inst || 1,
    };

    const result = await trainingSessionService.createTrainingSession(
      trainingData
    );

    res.status(201).success("Training Session Created Successfully", result);
  } catch (error) {
    console.error(" Create Training Session Error:", error);
    next(error);
  }
};

const findTrainingSessionById = async (req, res, next) => {
  try {
    const data = await trainingSessionService.findTrainingSessionById(
      req.params.id
    );
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const updateTrainingSession = async (req, res, next) => {
  try {
    const existingTrainingSession =
      await trainingSessionService.getTrainingSessionById(req.params.id);

    if (!existingTrainingSession) {
      throw new CustomError("Training session not found", 404);
    }

    let fileUrl = existingTrainingSession.training_material_path;

    if (req.file) {
      try {
        const fileBuffer = req.file.buffer;

        fileUrl = await uploadToBackblaze(
          fileBuffer,
          req.file.originalname,
          req.file.mimetype,
          "training_material_path"
        );

        console.log(" File uploaded to Backblaze:", fileUrl);
      } catch (uploadError) {
        console.error(" File upload error:", uploadError);
        throw new CustomError(
          `File upload failed: ${uploadError.message}`,
          500
        );
      }
    }

    const trainingData = {
      ...req.body,
      training_material_path: fileUrl,
      updatedby: req.user?.userId || req.user?.id || 1,
    };

    const result = await trainingSessionService.updateTrainingSession(
      req.params.id,
      trainingData
    );

    res.status(200).success("Training Session Updated Successfully", result);
  } catch (error) {
    console.error(" Update Training Session Error:", error);
    next(error);
  }
};

const deleteTrainingSession = async (req, res, next) => {
  try {
    await trainingSessionService.deleteTrainingSession(req.params.id);
    res.status(200).json({
      success: true,
      message: "Training session deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

const getAllTrainingSession = async (req, res, next) => {
  try {
    const { search, page, size, startDate, endDate } = req.query;

    const data = await trainingSessionService.getAllTrainingSession(
      search,
      Number(page) || 1,
      Number(size) || 10,
      startDate ? moment(startDate).toDate() : undefined,
      endDate ? moment(endDate).toDate() : undefined
    );

    res.status(200).json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
};

const updateTrainingSessionStatus = async (req, res, next) => {
  try {
    console.log("👤 Approver ID from token:", req.user?.employee_id);

    const { status } = req.body;

    if (!status) {
      throw new CustomError("Status is required", 400);
    }

    const data = {
      status,
      updatedby: req.user?.employee_id || req.user?.userId || req.user?.id || 1,
    };

    const result = await trainingSessionService.updateTrainingSessionStatus(
      req.params.id,
      data
    );

    res
      .status(200)
      .success("Training session status updated successfully", result);
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

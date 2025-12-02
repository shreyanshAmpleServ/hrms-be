const warningLetterService = require("../services/warningLetterService.js");
const CustomError = require("../../utils/CustomError");
const moment = require("moment");
const {
  uploadToBackblaze,
  deleteFromBackblaze,
} = require("../../utils/uploadBackblaze.js");

const createWarningLetter = async (req, res, next) => {
  try {
    console.log("Incoming request body:", req.body);

    let fileUrl = "";

    if (req.file) {
      fileUrl = await uploadToBackblaze(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        "warning_letters",
        false
      );
    }

    const warningLetterData = {
      ...req.body,
      attachment_path: fileUrl,
      createdby: req.user.id,
    };

    const letter = await warningLetterService.createWarningLetter(
      warningLetterData
    );

    res.status(201).json({
      success: true,
      data: letter,
      message: "Warning letter created successfully",
      status: 201,
    });
  } catch (error) {
    next(error);
  }
};

const findWarningLetter = async (req, res, next) => {
  try {
    const reqData = await warningLetterService.findWarningLetterById(
      req.params.id
    );
    if (!reqData) throw new CustomError("Warning letter not found", 404);
    res.status(200).success(null, reqData);
  } catch (error) {
    next(error);
  }
};

const updateWarningLetter = async (req, res, next) => {
  try {
    const existingLetter = await warningLetterService.findWarningLetterById(
      req.params.id
    );
    if (!existingLetter) throw new CustomError("Warning letter not found", 404);

    let fileUrl = existingLetter.attachment_path || "";

    if (req.file) {
      try {
        fileUrl = await uploadToBackblaze(
          req.file.buffer,
          req.file.originalname,
          req.file.mimetype,
          "warning_letters",
          false
        );
        console.log(`New file uploaded: ${fileUrl}`);

        if (
          existingLetter.attachment_path &&
          existingLetter.attachment_path !== fileUrl
        ) {
          try {
            await deleteFromBackblaze(existingLetter.attachment_path);
            console.log(`Deleted old file: ${existingLetter.attachment_path}`);
          } catch (error) {
            console.warn(`Failed to delete old file:`, error.message);
          }
        }
      } catch (error) {
        console.error("Failed to upload new file:", error.message);
        throw new CustomError("Failed to upload file", 500);
      }
    }

    const warningLetterData = {
      ...req.body,
      attachment_path: fileUrl,
      updatedby: req.user.id,
    };

    const letter = await warningLetterService.updateWarningLetter(
      req.params.id,
      warningLetterData
    );

    res.status(200).json({
      success: true,
      data: letter,
      message: "Warning letter updated successfully",
      status: 200,
    });
  } catch (error) {
    next(error);
  }
};

const deleteWarningLetter = async (req, res, next) => {
  try {
    const existingLetter = await warningLetterService.findWarningLetterById(
      req.params.id
    );

    await warningLetterService.deleteWarningLetter(req.params.id);

    if (existingLetter && existingLetter.attachment_path) {
      try {
        await deleteFromBackblaze(existingLetter.attachment_path);
        console.log(`Deleted file: ${existingLetter.attachment_path}`);
      } catch (error) {
        console.log(`Failed to delete file from storage: ${error.message}`);
      }
    }

    res.status(200).success("Warning letter deleted successfully", null);
  } catch (error) {
    next(error);
  }
};

const getAllWarningLetters = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate } = req.query;
    const data = await warningLetterService.getAllWarningLetter(
      search,
      Number(page),
      Number(size),
      startDate || null,
      endDate || null
    );
    res.status(200).success(null, data);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createWarningLetter,
  findWarningLetter,
  updateWarningLetter,
  deleteWarningLetter,
  getAllWarningLetters,
};

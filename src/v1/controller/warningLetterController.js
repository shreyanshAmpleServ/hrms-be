const warningLetterService = require("../services/warningLetterService.js");
const CustomError = require("../../utils/CustomError");
const moment = require("moment");
const {
  uploadToBackblaze,
  deleteFromBackblaze,
} = require("../../utils/uploadBackblaze.js");

const fs = require("fs").promises;

const createWarningLetter = async (req, res, next) => {
  try {
    console.log("Incoming request body:", req.body);

    if (!req.file) throw new CustomError("No file uploaded", 400);

    // Read file from disk into a buffer
    const fileBuffer = await fs.readFile(req.file.path);

    const fileUrl = await uploadToBackblaze(
      fileBuffer,
      req.file.originalname,
      req.file.mimetype,
      "warning_letters"
    );

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

    let fileUrl = existingLetter.attachment_path;

    if (req.file) {
      const fileBuffer = await fs.readFile(req.file.path);

      fileUrl = await uploadToBackblaze(
        fileBuffer,
        req.file.originalname,
        req.file.mimetype,
        "warning_letters"
      );
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

    if (existingLetter.attachment_path && req.file) {
      await deleteFromBackblaze(existingLetter.attachment_path);
    }
  } catch (error) {
    next(error);
  }
};

const deleteWarningLetter = async (req, res, next) => {
  try {
    await warningLetterService.deleteWarningLetter(req.params.id);
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
      startDate && moment(startDate),
      endDate && moment(endDate)
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

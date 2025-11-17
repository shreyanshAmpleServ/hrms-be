const latterTypeService = require("../services/latterTypeService");
const CustomError = require("../../utils/CustomError");
const moment = require("moment");
const { getPrisma } = require("../../config/prismaContext.js");
const { uploadToBackblaze } = require("../../utils/uploadBackblaze");
const fs = require("fs").promises;

const createLatterType = async (req, res, next) => {
  try {
    console.log("Incoming request body:", req.body);

    if (!req.file) throw new CustomError("No file uploaded", 400);

    // Read file from disk into a buffer
    const fileBuffer = await fs.readFile(req.file.path);

    const fileUrl = await uploadToBackblaze(
      fileBuffer,
      req.file.originalname,
      req.file.mimetype,
      "template_path"
    );

    const latterTypeData = {
      ...req.body,
      template_path: fileUrl,
      createdby: req.user.id,
    };

    const latter = await latterTypeService.createLatterType(latterTypeData);

    res.status(201).json({
      success: true,
      data: latter,
      message: "Latter type created successfully",
      status: 201,
    });
  } catch (error) {
    next(error);
  }
};

const findLatterTypeById = async (req, res, next) => {
  try {
    const data = await latterTypeService.findLatterTypeById(req.params.id);
    if (!data) throw new CustomError("Latter type not found", 404);

    res.status(200).success(null, data);
  } catch (error) {
    next(error);
  }
};

const updateLatterType = async (req, res, next) => {
  try {
    const existingLatterType = await latterTypeService.findLatterTypeById(
      req.params.id
    );
    if (!existingLatterType) {
      throw new CustomError("Latter type not found", 404);
    }
    let fileUrl = existingLatterType.template_path;

    if (req.file) {
      const fileBuffer = await fs.readFile(req.file.path);

      fileUrl = await uploadToBackblaze(
        fileBuffer,
        req.file.originalname,
        req.file.mimetype,
        "template_path"
      );
    }

    const latterTypeData = {
      ...req.body,
      template_path: fileUrl,
      updatedby: req.user.id,
    };

    const latter = await latterTypeService.updateLatterType(
      req.params.id,
      latterTypeData
    );

    res.status(200).json({
      success: true,
      data: latter,
      message: "Latter type updated successfully",
      status: 200,
    });
  } catch (error) {
    next(error);
  }
};

const deleteLatterType = async (req, res, next) => {
  try {
    await latterTypeService.deleteLatterType(req.params.id);
    res.status(200).success("Latter type deleted successfully", null);
  } catch (error) {
    next(error);
  }
};

const getAllLatterType = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate, is_active } = req.query;
    const data = await latterTypeService.getAllLatterType(
      Number(page),
      Number(size),
      search,
      moment(startDate),
      moment(endDate),
      is_active
    );
    res.status(200).success(null, data);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createLatterType,
  findLatterTypeById,
  updateLatterType,
  deleteLatterType,
  getAllLatterType,
};

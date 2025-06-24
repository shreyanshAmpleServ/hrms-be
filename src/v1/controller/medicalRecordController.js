const medicalRecordService = require("../services/medicalRecordService.js");
const CustomError = require("../../utils/CustomError");
const moment = require("moment");
const fs = require("fs");
const {
  uploadToBackblaze,
  deleteFromBackblaze,
} = require("../../utils/uploadBackblaze.js");

const createMedicalRecord = async (req, res, next) => {
  try {
    let imageUrl = null;
    if (req.file) {
      const fileBuffer = fs.readFileSync(req.file.path);
      imageUrl = await uploadToBackblaze(
        fileBuffer,
        req.file.originalname,
        req.file.mimetype,
        "document_attachment",
        "prescription_path"
      );
      fs.unlinkSync(req.file.path);
    }

    const data = {
      ...req.body,
      createdby: req.user.id,
      document_attachment: imageUrl,
      prescription_path: imageUrl,
      log_inst: req.user.log_inst,
    };

    const reqData = await medicalRecordService.createMedicalRecord(data);
    res.status(201).success("Medical Record created successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const findMedicalRecord = async (req, res, next) => {
  try {
    const reqData = await medicalRecordService.findMedicalRecord(req.params.id);
    if (!reqData) throw new CustomError("Medical record  not found", 404);
    res.status(200).success(null, reqData);
  } catch (error) {
    next(error);
  }
};

const updateMedicalRecord = async (req, res, next) => {
  try {
    let imageUrl = null;
    if (req.file) {
      const fileBuffer = fs.readFileSync(req.file.path);
      imageUrl = await uploadToBackblaze(
        fileBuffer,
        req.file.originalname,
        req.file.mimetype,
        "document_attachment",
        "prescription_path"
      );
      fs.unlinkSync(req.file.path);
      if (existingData.document_attachment) {
        await deleteFromBackblaze(existingData.document_attachment);
      }
      if (existingData.prescription_path) {
        await deleteFromBackblaze(existingData.prescription_path);
      }
    }
    const data = {
      ...req.body,
      document_attachment: imageUrl,
      prescription_path: imageUrl,
      updatedby: req.user.id,
      log_inst: req.user.log_inst,
    };
    const reqData = await medicalRecordService.updateMedicalRecord(
      req.params.id,
      data
    );
    res.status(200).success("Medical Record updated successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const deleteMedicalRecord = async (req, res, next) => {
  try {
    const reqData = await medicalRecordService.deleteMedicalRecord(
      req.params.id
    );
    res.status(200).success("Medical Record deleted successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const getAllMedicalRecord = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate } = req.query;
    const data = await medicalRecordService.getAllMedicalRecord(
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
  createMedicalRecord,
  updateMedicalRecord,
  deleteMedicalRecord,
  findMedicalRecord,
  getAllMedicalRecord,
};

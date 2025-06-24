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
    let documentUrl = null;
    let prescriptionUrl = null;

    if (req.files?.document_path) {
      const file = req.files.document_path[0];
      const buffer = fs.readFileSync(file.path);
      documentUrl = await uploadToBackblaze(
        buffer,
        file.originalname,
        file.mimetype,
        "document_path"
      );
      fs.unlinkSync(file.path);
    }

    if (req.files?.prescription_path) {
      const file = req.files.prescription_path[0];
      const buffer = fs.readFileSync(file.path);
      prescriptionUrl = await uploadToBackblaze(
        buffer,
        file.originalname,
        file.mimetype,
        "prescription_path"
      );
      fs.unlinkSync(file.path);
    }

    const data = {
      ...req.body,
      createdby: req.user.id,
      document_path: documentUrl,
      prescription_path: prescriptionUrl,
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
    // Fetch existing data to handle deletion of old files
    const existingData = await medicalRecordService.findMedicalRecord(
      req.params.id
    );
    if (!existingData) throw new CustomError("Medical record not found", 404);

    let documentUrl = existingData.document_path;
    let prescriptionUrl = existingData.prescription_path;

    // Handle updated document_path file
    if (req.files?.document_path) {
      const file = req.files.document_path[0];
      const buffer = fs.readFileSync(file.path);
      documentUrl = await uploadToBackblaze(
        buffer,
        file.originalname,
        file.mimetype,
        "document_path"
      );
      fs.unlinkSync(file.path);

      // Delete old document if it existed
      if (existingData.document_path) {
        await deleteFromBackblaze(existingData.document_path);
      }
    }

    // Handle updated prescription_path file
    if (req.files?.prescription_path) {
      const file = req.files.prescription_path[0];
      const buffer = fs.readFileSync(file.path);
      prescriptionUrl = await uploadToBackblaze(
        buffer,
        file.originalname,
        file.mimetype,
        "prescription_path"
      );
      fs.unlinkSync(file.path);

      // Delete old prescription if it existed
      if (existingData.prescription_path) {
        await deleteFromBackblaze(existingData.prescription_path);
      }
    }

    // Prepare update payload
    const data = {
      ...req.body,
      document_path: documentUrl,
      prescription_path: prescriptionUrl,
      updatedby: req.user.id,
      log_inst: req.user.log_inst,
    };

    const updated = await medicalRecordService.updateMedicalRecord(
      req.params.id,
      data
    );

    res.status(200).success("Medical Record updated successfully", updated);
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

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
    console.log("file", req.files.buffer);
    if (req.files?.document_path) {
      const file = req.files.document_path[0];
      const buffer = file.buffer;
      documentUrl = await uploadToBackblaze(
        buffer,
        file.originalname,
        file.mimetype,
        "document_path"
      );
      // fs.unlinkSync(file.path);
    }

    if (req.files?.prescription_path) {
      const file = req.files.prescription_path[0];
      const buffer = file.buffer;
      prescriptionUrl = await uploadToBackblaze(
        buffer,
        file.originalname,
        file.mimetype,
        "prescription_path"
      );
    }
    console.log("doc url", documentUrl, prescriptionUrl);
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
    const existingData = await medicalRecordService.findMedicalRecord(
      req.params.id
    );
    if (!existingData) throw new CustomError("Medical record not found", 404);

    let documentUrl = existingData.document_path;
    let prescriptionUrl = existingData.prescription_path;

    if (req.files?.document_path) {
      const file = req.files.document_path[0];
      const buffer = file.buffer;
      documentUrl = await uploadToBackblaze(
        buffer,
        file.originalname,
        file.mimetype,
        "document_path"
      );
      // fs.unlinkSync(file.path);

      if (existingData.document_path) {
        await deleteFromBackblaze(existingData.document_path);
      }
    }

    if (req.files?.prescription_path) {
      const file = req.files.prescription_path[0];
      const buffer = file.buffer;
      prescriptionUrl = await uploadToBackblaze(
        buffer,
        file.originalname,
        file.mimetype,
        "prescription_path"
      );
      // fs.unlinkSync(file.path);

      if (existingData.prescription_path) {
        await deleteFromBackblaze(existingData.prescription_path);
      }
    }

    const data = {
      ...req.body,
      employee_id: Number(req.body.employee_id),
      document_path: documentUrl,
      prescription_path: prescriptionUrl,
      updatedby: Number(req.user.employee_id),
      log_inst: req.user.log_inst || Number(req.user.employee_id),
    };
    console.log("data ; ", req.params);
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

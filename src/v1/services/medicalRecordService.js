const medicalRecordModel = require("../models/medicalRecordModel");

const createMedicalRecord = async (data) => {
  return await medicalRecordModel.createMedicalRecord(data);
};

const findMedicalRecord = async (data) => {
  return await medicalRecordModel.findMedicalRecord(data);
};

const updateMedicalRecord = async (data) => {
  return await medicalRecordModel.updateMedicalRecord(data);
};

const deleteMedicalRecord = async (data) => {
  return await medicalRecordModel.deleteMedicalRecord(data);
};

const getAllMedicalRecord = async (search, page, size, startDate, endDate) => {
  return await medicalRecordModel.getAllMedicalRecord(
    search,
    page,
    size,
    startDate,
    endDate
  );
};

module.exports = {
  createMedicalRecord,
  findMedicalRecord,
  updateMedicalRecord,
  deleteMedicalRecord,
  getAllMedicalRecord,
};

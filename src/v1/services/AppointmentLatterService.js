const AppointmentLatterModel = require("../models/AppointmentLatterModel");

const createAppointmentLatter = async (data) => {
  return await AppointmentLatterModel.createAppointmentLatter(data);
};

const findAppointmentLatterById = async (id) => {
  return await AppointmentLatterModel.findAppointmentLatterById(id);
};

const updateAppointmentLatter = async (id, data) => {
  return await AppointmentLatterModel.updateAppointmentLatter(id, data);
};

const deleteAppointmentLatter = async (id) => {
  return await AppointmentLatterModel.deleteAppointmentLatter(id);
};

const getAllAppointmentLatter = async (
  search,
  page,
  size,
  startDate,
  endDate,
  candidate_id
) => {
  return await AppointmentLatterModel.getAllAppointmentLatter(
    search,
    page,
    size,
    startDate,
    endDate,
    candidate_id
  );
};

const getAppointmentLetterForPDF = async (id) => {
  return await AppointmentLatterModel.getAppointmentLetterForPDF(id);
};

const getAllAppointmentLettersForBulkDownload = async (filters = {}) => {
  return await AppointmentLatterModel.getAllAppointmentLettersForBulkDownload(
    filters
  );
};

module.exports = {
  createAppointmentLatter,
  findAppointmentLatterById,
  updateAppointmentLatter,
  deleteAppointmentLatter,
  getAllAppointmentLatter,
  getAppointmentLetterForPDF,
  getAllAppointmentLettersForBulkDownload,
};

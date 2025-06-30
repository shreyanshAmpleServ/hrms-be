const workEventTypeModel = require("../models/eventTypeModel");

const createWorkEventType = async (data) => {
  return await workEventTypeModel.createWorkEventType(data);
};

const findWorkEventTypeById = async (id) => {
  return await workEventTypeModel.findWorkEventTypeById(id);
};

const updateWorkEventType = async (id, data) => {
  return await workEventTypeModel.updateWorkEventType(id, data);
};

const deleteWorkEventType = async (id) => {
  return await workEventTypeModel.deleteWorkEventType(id);
};

const getAllWorkEventType = async (
  page,
  size,
  search,
  startDate,
  endDate,
  is_active
) => {
  return await workEventTypeModel.getAllWorkEventType(
    page,
    size,
    search,
    startDate,
    endDate,
    is_active
  );
};

module.exports = {
  createWorkEventType,
  findWorkEventTypeById,
  updateWorkEventType,
  deleteWorkEventType,
  getAllWorkEventType,
};

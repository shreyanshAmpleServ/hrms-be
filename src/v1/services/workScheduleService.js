const workScheduleModel = require("../models/workScheduleModel");

const createWorkSchedule = async (data) => {
  return await workScheduleModel.createWorkSchedule(data);
};

const findWorkScheduleById = async (id) => {
  return await workScheduleModel.findWorkScheduleById(id);
};

const updateWorkSchedule = async (id, data) => {
  return await workScheduleModel.updateWorkSchedule(id, data);
};

const deleteWorkSchedule = async (id) => {
  return await workScheduleModel.deleteWorkSchedule(id);
};

const getAllWorkSchedule = async (
  page,
  size,
  search,
  startDate,
  endDate,
  is_active
) => {
  return await workScheduleModel.getAllWorkSchedule(
    page,
    size,
    search,
    startDate,
    endDate,
    is_active
  );
};

module.exports = {
  createWorkSchedule,
  findWorkScheduleById,
  updateWorkSchedule,
  deleteWorkSchedule,
  getAllWorkSchedule,
};

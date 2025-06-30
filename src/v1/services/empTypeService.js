const empTypeModel = require("../models/empTypeModel");

const createEmpType = async (data) => {
  return await empTypeModel.createEmpType(data);
};

const findEmpTypeById = async (id) => {
  return await empTypeModel.findEmpTypeById(id);
};

const updateEmpType = async (id, data) => {
  return await empTypeModel.updateEmpType(id, data);
};

const deleteEmpType = async (id) => {
  return await empTypeModel.deleteEmpType(id);
};

const getAllEmpType = async (
  page,
  size,
  search,
  startDate,
  endDate,
  is_active
) => {
  return await empTypeModel.getAllEmpType(
    page,
    size,
    search,
    startDate,
    endDate,
    is_active
  );
};

module.exports = {
  createEmpType,
  findEmpTypeById,
  updateEmpType,
  deleteEmpType,
  getAllEmpType,
};

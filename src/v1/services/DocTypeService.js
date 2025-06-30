const DocTypeModel = require("../models/DocTypeModel");

const createDocType = async (data) => {
  return await DocTypeModel.createDocType(data);
};

const findDocTypeById = async (id) => {
  return await DocTypeModel.findDocTypeById(id);
};

const updateDocType = async (id, data) => {
  return await DocTypeModel.updateDocType(id, data);
};

const deleteDocType = async (id) => {
  return await DocTypeModel.deleteDocType(id);
};

const getAllDocType = async (
  page,
  size,
  search,
  startDate,
  endDate,
  is_active
) => {
  return await DocTypeModel.getAllDocType(
    page,
    size,
    search,
    startDate,
    endDate,
    is_active
  );
};

module.exports = {
  createDocType,
  findDocTypeById,
  updateDocType,
  deleteDocType,
  getAllDocType,
};

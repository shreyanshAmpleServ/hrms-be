const DocTypeModel = require("../models/DocTypeModel");

const createDocType = async (data, tenantDb) => {
  return await DocTypeModel.createDocType(data, tenantDb);
};

const findDocTypeById = async (id, tenantDb) => {
  return await DocTypeModel.findDocTypeById(id, tenantDb);
};

const updateDocType = async (id, data, tenantDb) => {
  return await DocTypeModel.updateDocType(id, data, tenantDb);
};

const deleteDocType = async (id, tenantDb) => {
  return await DocTypeModel.deleteDocType(id, tenantDb);
};

const getAllDocType = async (
  page,
  size,
  search,
  startDate,
  endDate,
  is_active,
  tenantDb
) => {
  return await DocTypeModel.getAllDocType(
    page,
    size,
    search,
    startDate,
    endDate,
    is_active,
    tenantDb
  );
};

module.exports = {
  createDocType,
  findDocTypeById,
  updateDocType,
  deleteDocType,
  getAllDocType,
};

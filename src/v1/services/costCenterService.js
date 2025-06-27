const costCenterModel = require("../models/costCenterModel.js");

const createCostCenter = async (data) => {
  return await costCenterModel.createCostCenter(data);
};

const findCostCenterById = async (id) => {
  return await costCenterModel.findCostCenterById(id);
};

const updateCostCenter = async (id, data) => {
  const result = await costCenterModel.updateCostCenter(id, data);
  return result;
};

const deleteCostCenter = async (id) => {
  await costCenterModel.deleteCostCenter(id);
};

const getAllCostCenter = async (
  search,
  page,
  size,
  startDate,
  endDate,
  is_active
) => {
  return await costCenterModel.getAllCostCenter(
    search,
    page,
    size,
    startDate,
    endDate,
    is_active
  );
};

module.exports = {
  createCostCenter,
  findCostCenterById,
  updateCostCenter,
  deleteCostCenter,
  getAllCostCenter,
};

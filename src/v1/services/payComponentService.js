const payComponentModel = require("../models/payComponentModel");

const createPayComponent = async (data) => {
  return await payComponentModel.createPayComponent(data);
};

const findPayComponentById = async (id) => {
  return await payComponentModel.findPayComponentById(id);
};

const updatePayComponent = async (id, data) => {
  return await payComponentModel.updatePayComponent(id, data);
};

const deletePayComponent = async (id) => {
  return await payComponentModel.deletePayComponent(id);
};

const getAllPayComponent = async (
  page,
  size,
  search,
  startDate,
  endDate,
  is_active,
  is_advance
) => {
  return await payComponentModel.getAllPayComponent(
    page,
    size,
    search,
    startDate,
    endDate,
    is_active,
    is_advance
  );
};

const getPayComponentOptions = async (isAdvance, isOvertimeRelated) => {
  return await payComponentModel.getPayComponentOptions(
    isAdvance,
    isOvertimeRelated
  );
};
module.exports = {
  createPayComponent,
  findPayComponentById,
  updatePayComponent,
  deletePayComponent,
  getAllPayComponent,
  getPayComponentOptions,
};

const payComponentModel = require("../models/payComponentModel");
const { getPrisma } = require("../../config/prismaContext.js");

const createPayComponent = async (data, createdBy) => {
  const payComponentData = {
    ...data,
    createdby: createdBy,
    log_inst: data.log_inst || 1,
  };

  return await payComponentModel.createPayComponent(payComponentData);
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

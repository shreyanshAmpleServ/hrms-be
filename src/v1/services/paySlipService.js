const paySlipModel = require("../models/paySlipModel");
const { getPrisma } = require("../../config/prismaContext.js");

const createPaySlip = async (data) => {
  return await paySlipModel.createPaySlip(data);
};

const findPaySlipById = async (id) => {
  return await paySlipModel.findPaySlipById(id);
};

const updatePaySlip = async (id, data) => {
  return await paySlipModel.updatePaySlip(id, data);
};

const deletePaySlip = async (id) => {
  return await paySlipModel.deletePaySlip(id);
};

// const getAllPaySlip = async (search, page, size, startDate, endDate, employee_id, month) => {
//     return await paySlipModel.getAllPaySlip(search, page, size, startDate, endDate, employee_id, month);
// };

const getAllPaySlip = async (
  search,
  page,
  size,
  startDate,
  endDate,
  employee_id,
  month,
  year
) => {
  return await paySlipModel.getAllPaySlip(
    search,
    page,
    size,
    startDate,
    endDate,
    employee_id,
    month,
    year
  );
};

module.exports = {
  createPaySlip,
  findPaySlipById,
  updatePaySlip,
  deletePaySlip,
  getAllPaySlip,
};

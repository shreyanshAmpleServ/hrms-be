const advancePaymentModel = require("../models/advancePaymentModel.js");
const { getPrisma } = require("../../config/prismaContext.js");

const createAdvancePayment = async (data) => {
  return await advancePaymentModel.createAdvancePayment(data);
};

const findAdvancePaymentById = async (id) => {
  return await advancePaymentModel.findAdvancePaymentById(id);
};

const updateAdvancePayment = async (id, data) => {
  return await advancePaymentModel.updateAdvancePayment(id, data);
};

const deleteAdvancePayment = async (id) => {
  return await advancePaymentModel.deleteAdvancePayment(id);
};

const getAllAdvancePayments = async (
  search,
  page,
  size,
  startDate,
  endDate
) => {
  return await advancePaymentModel.getAllAdvancePayments(
    search,
    page,
    size,
    startDate,
    endDate
  );
};

const updateAdvancePaymentStatus = async (id, data) => {
  return await advancePaymentModel.updateAdvancePaymentStatus(id, data);
};

module.exports = {
  createAdvancePayment,
  findAdvancePaymentById,
  updateAdvancePayment,
  deleteAdvancePayment,
  getAllAdvancePayments,
  updateAdvancePaymentStatus,
};

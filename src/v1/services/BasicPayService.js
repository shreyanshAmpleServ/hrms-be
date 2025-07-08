const BasicPayModel = require("../models/BasicPayModel");

const createBasicPay = async (data) => {
  return await BasicPayModel.createBasicPay(data);
};

const findBasicPayById = async (id) => {
  return await BasicPayModel.findBasicPayById(id);
};

// const findDealsByStatus = async (status) => {
//   return await BasicPayModel.findDealsByStatus(status);
// };

const updateBasicPay = async (id, data) => {
  return await BasicPayModel.updateBasicPay(id, data);
};

const deleteBasicPay = async (id) => {
  return await BasicPayModel.deleteBasicPay(id);
};

const getAllBasicPay = async (
  page,
  size,
  search,
  startDate,
  endDate,
  status,
  employee_id
) => {
  return await BasicPayModel.getAllBasicPay(
    page,
    size,
    search,
    startDate,
    endDate,
    status,
    employee_id
  );
};

module.exports = {
  createBasicPay,
  findBasicPayById,
  updateBasicPay,
  getAllBasicPay,
  deleteBasicPay,
};

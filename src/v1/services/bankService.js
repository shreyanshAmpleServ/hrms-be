const bankModel = require("../models/BankModel");

const createBank = async (data) => {
  return await bankModel.createBank(data);
};

const findBankById = async (id) => {
  return await bankModel.findBankById(id);
};

const updateBank = async (id, data) => {
  return await bankModel.updateBank(id, data);
};

const deleteBank = async (id) => {
  return await bankModel.deleteBank(id);
};

const getAllBank = async (search, page, size, is_active) => {
  return await bankModel.getAllBank(search, page, size, is_active);
};

module.exports = {
  createBank,
  findBankById,
  updateBank,
  deleteBank,
  getAllBank,
};

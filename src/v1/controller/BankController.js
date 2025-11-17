const bankService = require("../services/bankService");
const CustomError = require("../../utils/CustomError");
const { getPrisma } = require("../../config/prismaContext.js");

const createBank = async (req, res, next) => {
  try {
    const bank = await bankService.createBank(req.body);
    res.status(201).success("bank created successfully", bank);
  } catch (error) {
    next(error);
  }
};

const findBankById = async (req, res, next) => {
  try {
    const bank = await bankService.findBankById(req.params.id);
    if (!bank) throw new CustomError("bank not found", 404);
    res.status(200).success(null, bank);
  } catch (error) {
    next(error);
  }
};

const updateBank = async (req, res, next) => {
  try {
    const bank = await bankService.updateBank(req.params.id, req.body);
    res.status(200).success("bank updated successfully", bank);
  } catch (error) {
    next(error);
  }
};

const deleteBank = async (req, res, next) => {
  try {
    await bankService.deleteBank(req.params.id);
    res.status(200).success("bank deleted successfully", null);
  } catch (error) {
    next(error);
  }
};

const getAllBank = async (req, res, next) => {
  try {
    const { search, page, size, is_active } = req.query;
    const categories = await bankService.getAllBank(
      search,
      Number(page),
      Number(size),
      is_active
    );
    res.status(200).success(null, categories);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBank,
  findBankById,
  updateBank,
  deleteBank,
  getAllBank,
};

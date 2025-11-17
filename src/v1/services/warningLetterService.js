const warningLetterModel = require("../models/warningLetterModel.js");
const { getPrisma } = require("../../config/prismaContext.js");

const createWarningLetter = async (data) => {
  return await warningLetterModel.createWarningLetter(data);
};

const findWarningLetterById = async (id) => {
  return await warningLetterModel.findWarningLetterById(id);
};

const updateWarningLetter = async (id, data) => {
  return await warningLetterModel.updateWarningLetter(id, data);
};

const deleteWarningLetter = async (id) => {
  return await warningLetterModel.deleteWarningLetter(id);
};

const getAllWarningLetter = async (search, page, size, startDate, endDate) => {
  return await warningLetterModel.getAllWarningLetter(
    search,
    page,
    size,
    startDate,
    endDate
  );
};

module.exports = {
  createWarningLetter,
  findWarningLetterById,
  updateWarningLetter,
  deleteWarningLetter,
  getAllWarningLetter,
};

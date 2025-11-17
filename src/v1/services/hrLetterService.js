const hrLetterModel = require("../models/hrLetterModel.js");
const { getPrisma } = require("../../config/prismaContext.js");

const createhrLetter = async (data) => {
  return await hrLetterModel.createhrLetter(data);
};

const gethrLetterById = async (id) => {
  return await hrLetterModel.gethrLetterById(id);
};

const updatehrLetter = async (id, data) => {
  return await hrLetterModel.updatehrLetter(id, data);
};

const deletehrLetter = async (id) => {
  return await hrLetterModel.deletehrLetter(id);
};

const updatehrLetterStatus = async (id, data) => {
  return await hrLetterModel.updatehrLetterStatus(id, data);
};

const getAllhrLetter = async (
  search,
  page,
  size,
  startDate,
  endDate,
  is_active
) => {
  return await hrLetterModel.getAllhrLetter(
    search,
    page,
    size,
    startDate,
    endDate,
    is_active
  );
};

module.exports = {
  createhrLetter,
  gethrLetterById,
  updatehrLetter,
  deletehrLetter,
  updatehrLetterStatus,
  getAllhrLetter,
};

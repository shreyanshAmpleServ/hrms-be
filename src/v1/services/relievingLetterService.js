const relievingLetterModel = require("../models/relievingLetterModel.js");

const createRelievingLetter = async (data) => {
  return await relievingLetterModel.createRelievingLetter(data);
};

const findRelievingLetterById = async (id) => {
  return await relievingLetterModel.findRelievingLetterById(id);
};

const updateRelievingLetter = async (id, data) => {
  return await relievingLetterModel.updateRelievingLetter(id, data);
};

const deleteRelievingLetter = async (id) => {
  return await relievingLetterModel.deleteRelievingLetter(id);
};

const getAllRelievingLetters = async (
  search,
  page,
  size,
  startDate,
  endDate
) => {
  return await relievingLetterModel.getAllRelievingLetters(
    search,
    page,
    size,
    startDate,
    endDate
  );
};

module.exports = {
  createRelievingLetter,
  findRelievingLetterById,
  updateRelievingLetter,
  deleteRelievingLetter,
  getAllRelievingLetters,
};

const recognitionAwardModel = require("../models/recognitionAwardModel.js");

const createRecognitionAward = async (data) => {
  return await recognitionAwardModel.createRecognitionAward(data);
};

const findRecognitionAwardById = async (id) => {
  return await recognitionAwardModel.findRecognitionAwardById(id);
};

const updateRecognitionAward = async (id, data) => {
  return await recognitionAwardModel.updateRecognitionAward(id, data);
};

const deleteRecognitionAward = async (id) => {
  return await recognitionAwardModel.deleteRecognitionAward(id);
};

const getAllRecognitionAward = async (
  search,
  page,
  size,
  startDate,
  endDate
) => {
  return await recognitionAwardModel.getAllRecognitionAwards(
    search,
    page,
    size,
    startDate,
    endDate
  );
};

module.exports = {
  createRecognitionAward,
  findRecognitionAwardById,
  updateRecognitionAward,
  deleteRecognitionAward,
  getAllRecognitionAward,
};

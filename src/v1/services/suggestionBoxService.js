const suggestionBoxModel = require("../models/suggestionBoxModel.js");
const { getPrisma } = require("../../config/prismaContext.js");

const createSuggestionBox = async (data) => {
  return await suggestionBoxModel.createSuggestionBox(data);
};

const findSuggestionBoxById = async (id) => {
  return await suggestionBoxModel.findSuggestionBoxById(id);
};

const updateSuggestionBox = async (id, data) => {
  return await suggestionBoxModel.updateSuggestionBox(id, data);
};

const deleteSuggestionBox = async (id) => {
  return await suggestionBoxModel.deleteSuggestionBox(id);
};

const getAllSuggestionBox = async (search, page, size, startDate, endDate) => {
  return await suggestionBoxModel.getAllSuggestionBox(
    search,
    page,
    size,
    startDate,
    endDate
  );
};

module.exports = {
  createSuggestionBox,
  findSuggestionBoxById,
  updateSuggestionBox,
  deleteSuggestionBox,
  getAllSuggestionBox,
};

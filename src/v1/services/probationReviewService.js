const probationReviewModel = require("../models/probationReviewModel.js");

const createProbationReview = async (data) => {
  return await probationReviewModel.createProbationReview(data);
};

const findProbationReviewById = async (id) => {
  return await probationReviewModel.findProbationReviewById(id);
};

const updateProbationReview = async (id, data) => {
  return await probationReviewModel.updateProbationReview(id, data);
};

const deleteProbationReview = async (id) => {
  return await probationReviewModel.deleteProbationReview(id);
};

const getAllProbationReview = async (
  search,
  page,
  size,
  startDate,
  endDate
) => {
  return await probationReviewModel.getAllProbationReview(
    search,
    page,
    size,
    startDate,
    endDate
  );
};

module.exports = {
  createProbationReview,
  findProbationReviewById,
  updateProbationReview,
  deleteProbationReview,
  getAllProbationReview,
};

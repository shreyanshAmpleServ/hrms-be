const reviewTempModel = require('../models/reviewTempModel');

const createReviewTemp = async (data) => {
  return await reviewTempModel.createReviewTemp(data);
};

const findReviewTempById = async (id) => {
  return await reviewTempModel.findReviewTempById(id);
};

const updateReviewTemp = async (id, data) => {
  return await reviewTempModel.updateReviewTemp(id, data);
};

const deleteReviewTemp = async (id) => {
  return await reviewTempModel.deleteReviewTemp(id);
};

const getAllReviewTemp = async (page, size, search,  startDate,endDate) => {
  return await reviewTempModel.getAllReviewTemp(page, size, search,  startDate,endDate);
};

module.exports = {
  createReviewTemp,
  findReviewTempById,
  updateReviewTemp,
  deleteReviewTemp,
  getAllReviewTemp,
};
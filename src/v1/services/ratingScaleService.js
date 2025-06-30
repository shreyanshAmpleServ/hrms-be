const ratingScaleModel = require("../models/ratingScaleModel");

const createRatingScale = async (data) => {
  return await ratingScaleModel.createRatingScale(data);
};

const findRatingScaleById = async (id) => {
  return await ratingScaleModel.findRatingScaleById(id);
};

const updateRatingScale = async (id, data) => {
  return await ratingScaleModel.updateRatingScale(id, data);
};

const deleteRatingScale = async (id) => {
  return await ratingScaleModel.deleteRatingScale(id);
};

const getAllRatingScale = async (
  page,
  size,
  search,
  startDate,
  endDate,
  is_active
) => {
  return await ratingScaleModel.getAllRatingScale(
    page,
    size,
    search,
    startDate,
    endDate,
    is_active
  );
};

module.exports = {
  createRatingScale,
  findRatingScaleById,
  updateRatingScale,
  deleteRatingScale,
  getAllRatingScale,
};

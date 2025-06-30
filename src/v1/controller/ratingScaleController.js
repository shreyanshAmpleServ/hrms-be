const ratingScaleService = require("../services/ratingScaleService");
const CustomError = require("../../utils/CustomError");
const moment = require("moment");

const createRatingScale = async (req, res, next) => {
  try {
    let reqData = { ...req.body };
    const data = await ratingScaleService.createRatingScale(reqData);
    res.status(201).success("Rating scale created successfully", data);
  } catch (error) {
    next(error);
  }
};

const findRatingScaleById = async (req, res, next) => {
  try {
    const data = await ratingScaleService.findRatingScaleById(req.params.id);
    if (!data) throw new CustomError("Rating scale not found", 404);

    res.status(200).success(null, data);
  } catch (error) {
    next(error);
  }
};

const updateRatingScale = async (req, res, next) => {
  try {
    let reqData = { ...req.body };

    const data = await ratingScaleService.updateRatingScale(
      req.params.id,
      reqData
    );
    res.status(200).success("Rating scale updated successfully", data);
  } catch (error) {
    next(error);
  }
};

const deleteRatingScale = async (req, res, next) => {
  try {
    await ratingScaleService.deleteRatingScale(req.params.id);
    res.status(200).success("Rating scale deleted successfully", null);
  } catch (error) {
    next(error);
  }
};

const getAllRatingScale = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate, is_active } = req.query;
    const data = await ratingScaleService.getAllRatingScale(
      Number(page),
      Number(size),
      search,
      moment(startDate),
      moment(endDate),
      is_active
    );
    res.status(200).success(null, data);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRatingScale,
  findRatingScaleById,
  updateRatingScale,
  deleteRatingScale,
  getAllRatingScale,
};

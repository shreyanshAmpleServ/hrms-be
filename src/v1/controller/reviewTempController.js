const reviewTempService = require("../services/reviewTempService");
const CustomError = require("../../utils/CustomError");
const moment = require("moment");
const { getPrisma } = require("../../config/prismaContext.js");

const createReviewTemp = async (req, res, next) => {
  try {
    let reqData = { ...req.body };
    const data = await reviewTempService.createReviewTemp(reqData);
    res.status(201).success("Review template created successfully", data);
  } catch (error) {
    next(error);
  }
};

const findReviewTempById = async (req, res, next) => {
  try {
    const data = await reviewTempService.findReviewTempById(req.params.id);
    if (!data) throw new CustomError("Review template not found", 404);

    res.status(200).success(null, data);
  } catch (error) {
    next(error);
  }
};

const updateReviewTemp = async (req, res, next) => {
  try {
    let reqData = { ...req.body };

    const data = await reviewTempService.updateReviewTemp(
      req.params.id,
      reqData
    );
    res.status(200).success("Review template updated successfully", data);
  } catch (error) {
    next(error);
  }
};

const deleteReviewTemp = async (req, res, next) => {
  try {
    await reviewTempService.deleteReviewTemp(req.params.id);
    res.status(200).success("Review template deleted successfully", null);
  } catch (error) {
    next(error);
  }
};

const getAllReviewTemp = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate, is_active } = req.query;
    const data = await reviewTempService.getAllReviewTemp(
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
  createReviewTemp,
  findReviewTempById,
  updateReviewTemp,
  deleteReviewTemp,
  getAllReviewTemp,
};

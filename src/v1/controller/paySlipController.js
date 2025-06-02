const paySlipService = require("../services/paySlipService");
const CustomError = require("../../utils/CustomError");
const moment = require("moment");
const {
  uploadToBackblaze,
  deleteFromBackblaze,
} = require("../../utils/uploadBackblaze");

const createPaySlip = async (req, res, next) => {
  try {
    let imageUrl = null;
    if (req.file) {
      imageUrl = await uploadToBackblaze(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        "paySlip"
      );
    }
    const data = {
      ...req.body,
      createdby: req.user.id,
      pdf_path: imageUrl,
      log_inst: req.user.log_inst,
    };
    const reqData = await paySlipService.createPaySlip(data);
    res.status(201).success("Payslip created successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const findPaySlipById = async (req, res, next) => {
  try {
    const reqData = await paySlipService.findPaySlipById(req.params.id);
    if (!reqData) throw new CustomError("Payslip not found", 404);
    res.status(200).success(null, reqData);
  } catch (error) {
    next(error);
  }
};

const updatePaySlip = async (req, res, next) => {
  try {
    const existingData = await paySlipService.findPaySlipById(req.params.id);
    if (!existingData) throw new CustomError("Resume not found", 404);
    let imageUrl = existingData.resume_path;

    if (req.file) {
      imageUrl = await uploadToBackblaze(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        "paySlip"
      );
    }
    const data = {
      ...req.body,
      pdf_path: req.file ? imageUrl : existingData.pdf_path,
      updatedby: req.user.id,
      log_inst: req.user.log_inst,
    };
    const reqData = await paySlipService.updatePaySlip(req.params.id, data);
    res.status(200).success("Payslip updated successfully", reqData);
    if (req.file) {
      if (existingData.image) {
        await deleteFromBackblaze(existingData.image); // Delete the old logo
      }
    }
  } catch (error) {
    next(error);
  }
};

const deletePaySlip = async (req, res, next) => {
  try {
    const existingData = await paySlipService.findPaySlipById(req.params.id);
    await paySlipService.deletePaySlip(req.params.id);
    res.status(200).success("Payslip deleted successfully", null);
    if (existingData.image) {
      await deleteFromBackblaze(existingData.image); // Delete the old logo
    }
  } catch (error) {
    next(error);
  }
};

const getAllPaySlip = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate } = req.query;
    const data = await paySlipService.getAllPaySlip(
      search,
      Number(page),
      Number(size),
      startDate && moment(startDate),
      endDate && moment(endDate)
    );
    res.status(200).success(null, data);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPaySlip,
  findPaySlipById,
  updatePaySlip,
  deletePaySlip,
  getAllPaySlip,
};

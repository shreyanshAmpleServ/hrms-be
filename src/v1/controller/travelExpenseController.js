const travelExpenseService = require("../services/travelExpenseService.js");
const CustomError = require("../../utils/CustomError");
const moment = require("moment");
const { uploadToBackblaze } = require("../../utils/uploadBackblaze.js");
const fs = require("fs");
const createTravelExpense = async (req, res, next) => {
  try {
    console.log("Incoming request body:", req.body);
    if (!req.file) throw new CustomError("No file uploaded", 400);

    const fileBuffer = await fs.promises.readFile(req.file.path);
    const fileUrl = await uploadToBackblaze(
      fileBuffer,
      req.file.originalname,
      req.file.mimetype,
      "attachment_path"
    );

    const travelData = {
      ...req.body,
      attachment_path: fileUrl,
      createdby: req.user.employee_id,
    };

    const reqData = await travelExpenseService.createTravelExpense(travelData);
    res.status(201).success("Travel expense created successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const findTravelExpense = async (req, res, next) => {
  try {
    const reqData = await travelExpenseService.findTravelExpenseById(
      req.params.id
    );
    if (!reqData) throw new CustomError("Travel expense not found", 404);
    res.status(200).success(null, reqData);
  } catch (error) {
    next(error);
  }
};

const updateTravelExpense = async (req, res, next) => {
  try {
    const existingTravelExpense =
      await travelExpenseService.findTravelExpenseById(req.params.id);
    if (!existingTravelExpense) {
      throw new CustomError("Travel expense not found", 404);
    }

    let fileUrl = existingTravelExpense.attachment_path;
    if (req.file) {
      const fileBuffer = await fs.promises.readFile(req.file.path);
      fileUrl = await uploadToBackblaze(
        fileBuffer,
        req.file.originalname,
        req.file.mimetype,
        "attachment_path"
      );
    }
    const travelData = {
      ...req.body,
      updatedby: req.user.id,
    };
    const result = await travelExpenseService.updateTravelExpense(
      req.params.id,
      travelData
    );
    res.status(200).success("Travel expense updated successfully", result);
  } catch (error) {
    next(error);
  }
};

const deleteTravelExpense = async (req, res, next) => {
  try {
    await travelExpenseService.deleteTravelExpense(req.params.id);
    res.status(200).success("Travel expense deleted successfully", null);
  } catch (error) {
    next(error);
  }
};

const getAllTravelExpenses = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate } = req.query;
    const data = await travelExpenseService.getAllTravelExpense(
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

const updateTravelExpenseStatus = async (req, res, next) => {
  try {
    console.log("Approver ID from token:", req.user.id);

    const status = req.body.status;
    const rejection_reason = req.body.rejection_reason || "";
    console.log("User : ", req.user);
    const data = {
      status,
      rejection_reason,
      updatedby: req.user.employee_id,
      approver_id: req.user.employee_id,
      updatedate: new Date(),
    };

    const reqData = await travelExpenseService.updateTravelExpenseStatus(
      req.params.id,
      data
    );
    res.status(200).success("Leave status updated successfully", reqData);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTravelExpense,
  findTravelExpense,
  updateTravelExpense,
  deleteTravelExpense,
  getAllTravelExpenses,
  updateTravelExpenseStatus,
};

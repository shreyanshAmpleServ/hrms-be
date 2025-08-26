const BasicPayService = require("../services/BasicPayService");
const CustomError = require("../../utils/CustomError");
const moment = require("moment");
const XLSX = require("xlsx");

const createBasicPay = async (req, res, next) => {
  try {
    let reqData = {
      ...req.body,
      createdby: req.user.id,
      log_inst: req.user.log_inst,
      payLineData: JSON.parse(req.body?.payLineData),
    };

    const deal = await BasicPayService.createBasicPay(reqData);
    res.status(201).success("Basic pay created successfully", deal);
  } catch (error) {
    next(error);
  }
};

const findBasicPayById = async (req, res, next) => {
  try {
    const deal = await BasicPayService.findBasicPayById(req.params.id);
    if (!deal) throw new CustomError("Basic pay not found", 404);
    res.status(200).success(null, deal);
  } catch (error) {
    next(error);
  }
};

const updateBasicPay = async (req, res, next) => {
  try {
    const existingData = await BasicPayService.findBasicPayById(req.params.id);
    if (!existingData) throw new CustomError("Basic pay not found", 404);

    let reqData = {
      ...req.body,
      updatedby: req.user.id,
      payLineData: req.body?.payLineData
        ? JSON.parse(req.body?.payLineData)
        : null,
    };

    const deal = await BasicPayService.updateBasicPay(req.params.id, reqData);
    res.status(200).success("Basic pay updated successfully", deal);
  } catch (error) {
    next(error);
  }
};

const deleteBasicPay = async (req, res, next) => {
  try {
    const existingData = await BasicPayService.findBasicPayById(req.params.id);
    if (!existingData) throw new CustomError("Basic pay not found", 404);
    await BasicPayService.deleteBasicPay(req.params.id);
    res.status(200).success("Basic pay deleted successfully", null);
  } catch (error) {
    next(error);
  }
};

const getAllBasicPay = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate, status, employee_id } =
      req.query;
    const deals = await BasicPayService.getAllBasicPay(
      Number(page),
      Number(size),
      search,
      moment(startDate),
      moment(endDate),
      status,
      employee_id
    );
    res.status(200).success(null, deals);
  } catch (error) {
    next(error);
  }
};

// const importFromExcel = async (req, res, next) => {
//   try {
//     if (!req.file) throw new CustomError("No file uploaded", 400);
//     console.log("---- Incoming File ----");
//     console.log(req.file); // 👈 check uploaded file details
//     console.log("---- Incoming Body ----");
//     console.log(req.body); // 👈 check if extra fields are sent

//     const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
//     const sheetName = workbook.SheetNames[0];
//     const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
//     console.log("Sheet Names:", workbook.SheetNames);
//     console.log("Raw JSON Data:", sheetData);
//     const reqData = sheetData.map((row) => ({
//       ...row,
//       createdby: req.user.id,
//       log_inst: req.user.log_inst,
//     }));
//     const result = await BasicPayService.importFromExcel(reqData);
//     res
//       .status(201)
//       .success(
//         `${result.count} employee pay assignments imported successfully`,
//         result.data
//       );
//   } catch (error) {
//     next(error);
//   }
// };

const importFromExcel = async (req, res, next) => {
  try {
    if (!req.file) throw new CustomError("No file uploaded", 400);
    console.log(req.file);
    console.log(req.body);

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    console.log("Sheet Names:", workbook.SheetNames);
    console.log("Raw JSON Data:", sheetData);
    const reqData = sheetData.map((row) => ({
      ...row,
      createdby: req.user.id,
      log_inst: req.user.log_inst,
    }));
    const result = await BasicPayService.importFromExcel(reqData);
    res
      .status(201)
      .success(
        `${result.count} employee pay assignments imported successfully`,
        result.data
      );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBasicPay,
  findBasicPayById,
  updateBasicPay,
  deleteBasicPay,
  getAllBasicPay,
  importFromExcel,
};

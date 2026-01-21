const payComponentService = require("../services/payComponentService");
const payComponentModel = require("../models/payComponentModel");
const CustomError = require("../../utils/CustomError");
const moment = require("moment");
const path = require("path");
const fs = require("fs");

const createPayComponent = async (req, res, next) => {
  try {
    const createdBy = req.user.employee_id;
    let departmentData = { ...req.body };
    const department = await payComponentService.createPayComponent(
      departmentData,
      createdBy,
    );
    res.status(201).success("Pay component created successfully", department);
  } catch (error) {
    next(error);
  }
};

const findPayComponentById = async (req, res, next) => {
  try {
    const department = await payComponentService.findPayComponentById(
      req.params.id,
    );
    if (!department) throw new CustomError("Pay component not found", 404);

    res.status(200).success(null, department);
  } catch (error) {
    next(error);
  }
};

// update all pay component
const updatePayComponent = async (req, res, next) => {
  try {
    let departmentData = { ...req.body };
    const department = await payComponentService.updatePayComponent(
      req.params.id,
      departmentData,
    );
    res.status(200).success("Pay component updated successfully", department);
  } catch (error) {
    next(error);
  }
};

const updatePayOneTimeForColumnComponent = async (req, res, next) => {
  try {
    const result =
      await payComponentService.updatePayOneTimeForColumnComponent();
    res.status(200).json({
      success: true,
      message: "All pay components updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const deletePayComponent = async (req, res, next) => {
  try {
    await payComponentService.deletePayComponent(req.params.id);
    res.status(200).success("Pay component deleted successfully", null);
  } catch (error) {
    next(error);
  }
};

const getAllPayComponent = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate, is_active, is_advance } =
      req.query;
    const departments = await payComponentService.getAllPayComponent(
      Number(page),
      Number(size),
      search,
      startDate && moment(startDate),
      endDate && moment(endDate),
      is_active,
      is_advance,
    );
    res.status(200).success(null, departments);
  } catch (error) {
    next(error);
  }
};

const getPayComponentOptions = async (req, res, next) => {
  try {
    const {
      is_advance: isAdvance,
      is_overtime_related: isOvertimeRelated,
      is_loan,
    } = req.query;
    const payComponent = await payComponentService.getPayComponentOptions(
      isAdvance,
      isOvertimeRelated,
      is_loan,
    );
    res.status(200).success(null, payComponent);
  } catch (error) {
    next(error);
  }
};

const generateP09Report = async (req, res, next) => {
  try {
    const { fromDate, toDate } = req.query;

    if (!fromDate || !toDate) {
      throw new CustomError("FromDate and ToDate are required", 400);
    }

    const reportData = await payComponentModel.getP09ReportData(
      fromDate,
      toDate,
    );

    const companySettings = await payComponentModel.getCompanySettings();

    const fileName = `P09_Report_${fromDate}_to_${toDate}_${Date.now()}.pdf`;
    const filePath = path.join(__dirname, "../../../temp", fileName);

    await payComponentModel.generateP09ReportPDF(
      reportData,
      companySettings,
      filePath,
      fromDate,
      toDate,
    );

    const pdfBuffer = fs.readFileSync(filePath);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader("Content-Length", pdfBuffer.length);

    res.send(pdfBuffer);

    setTimeout(() => {
      try {
        fs.unlinkSync(filePath);
      } catch (error) {
        console.error("Error cleaning up temporary file:", error);
      }
    }, 5000);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPayComponent,
  findPayComponentById,
  updatePayComponent,
  deletePayComponent,
  getAllPayComponent,
  getPayComponentOptions,
  updatePayOneTimeForColumnComponent,
  generateP09Report,
};

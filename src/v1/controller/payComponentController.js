const payComponentService = require("../services/payComponentService");
const CustomError = require("../../utils/CustomError");
const moment = require("moment");

const createPayComponent = async (req, res, next) => {
  try {
    let departmentData = { ...req.body };
    const department = await payComponentService.createPayComponent(
      departmentData
    );
    res.status(201).success("Pay component created successfully", department);
  } catch (error) {
    next(error);
  }
};

const findPayComponentById = async (req, res, next) => {
  try {
    const department = await payComponentService.findPayComponentById(
      req.params.id
    );
    if (!department) throw new CustomError("Pay component not found", 404);

    res.status(200).success(null, department);
  } catch (error) {
    next(error);
  }
};

const updatePayComponent = async (req, res, next) => {
  try {
    // const attachmentPath = req.file ? req.file.path : null;
    let departmentData = { ...req.body };
    // if (attachmentPath) departmentData.attachment = generateFullUrl(req, attachmentPath);

    // departmentData = sanitizedepartmentData(departmentData);

    const department = await payComponentService.updatePayComponent(
      req.params.id,
      departmentData
    );
    res.status(200).success("Pay component updated successfully", department);
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
      is_advance
    );
    res.status(200).success(null, departments);
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
};

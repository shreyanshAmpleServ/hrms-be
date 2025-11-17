const payComponentService = require("../services/payComponentService");
const CustomError = require("../../utils/CustomError");
const moment = require("moment");
const { getPrisma } = require("../../config/prismaContext.js");

const createPayComponent = async (req, res, next) => {
  try {
    const createdBy = req.user.employee_id;
    let departmentData = { ...req.body };
    const department = await payComponentService.createPayComponent(
      departmentData,
      createdBy
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

// update all pay component
const updatePayComponent = async (req, res, next) => {
  try {
    let departmentData = { ...req.body };
    const department = await payComponentService.updatePayComponent(
      req.params.id,
      departmentData
    );
    res.status(200).success("Pay component updated successfully", department);
  } catch (error) {
    next(error);
  }
};

// update all pay component -New made for emergengency(Test by shivang)
// const updatePayComponent = async (req, res, next) => {
//   try {
//     const result = await payComponentService.updatePayComponent();
//     res.status(200).json({
//       success: true,
//       message: "All pay components updated successfully",
//       data: result,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

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

const getPayComponentOptions = async (req, res, next) => {
  try {
    const { is_advance: isAdvance, is_overtime_related: isOvertimeRelated } =
      req.query;
    const payComponent = await payComponentService.getPayComponentOptions(
      isAdvance,
      isOvertimeRelated
    );
    res.status(200).success(null, payComponent);
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
};

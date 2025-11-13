const departmentService = require("../services/departmentService");
const CustomError = require("../../utils/CustomError");
const { generateFullUrl } = require("../../utils/helper");
const moment = require("moment");
// const sanitizedepartmentData = (data) => {
//     return {
//         title: data.title ? String(data.title).trim() : null,
//         department: data.department ? String(data.department).trim() : null,
//         attachment: data.attachment ? String(data.attachment).trim() : null,

//         // Metadata
//         createdBy: data.createdBy || 1,
//         log_inst: data.log_inst || 1,
//     };
// };

const createDepartment = async (req, res, next) => {
  try {
    console.log("daata : ", req.body);
    let departmentData = { ...req.body };
    const department = await departmentService.createDepartment(departmentData);
    res.status(201).success("Department created successfully", department);
  } catch (error) {
    next(error);
  }
};

const findDepartmentById = async (req, res, next) => {
  try {
    const department = await departmentService.findDepartmentById(
      req.params.id
    );
    if (!department) throw new CustomError("Department not found", 404);

    res.status(200).success(null, department);
  } catch (error) {
    next(error);
  }
};

const updateDepartment = async (req, res, next) => {
  try {
    // const attachmentPath = req.file ? req.file.path : null;
    let departmentData = { ...req.body };
    // if (attachmentPath) departmentData.attachment = generateFullUrl(req, attachmentPath);

    // departmentData = sanitizedepartmentData(departmentData);

    const department = await departmentService.updateDepartment(
      req.params.id,
      departmentData
    );
    res.status(200).success("Department updated successfully", department);
  } catch (error) {
    next(error);
  }
};

const deleteDepartment = async (req, res, next) => {
  try {
    await departmentService.deleteDepartment(req.params.id);
    res.status(200).success("Department deleted successfully", null);
  } catch (error) {
    next(error);
  }
};

// const deleteDepartment = async (req, res, next) => {
//   try {
//     const ids = req.body.ids;
//     await departmentService.deleteDepartment(ids);
//     res.status(200).success("Department(s) deleted successfully", null);
//   } catch (error) {
//     next(error);
//   }
// };

const getAllDepartments = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate, is_active } = req.query;
    const departments = await departmentService.getAllDepartments(
      Number(page),
      Number(size),
      search,
      moment(startDate),
      moment(endDate),
      is_active
    );
    res.status(200).success(null, departments);
  } catch (error) {
    next(error);
  }
};

const getDepartmentOptions = async (req, res, next) => {
  try {
    const { is_active } = req.query;
    const department = await departmentService.getDepartmentOptions(is_active);
    res.status(200).success(null, department);
  } catch (error) {
    next(error);
  }
};
module.exports = {
  createDepartment,
  findDepartmentById,
  updateDepartment,
  deleteDepartment,
  getAllDepartments,
  getDepartmentOptions,
};

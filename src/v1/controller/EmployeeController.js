const EmployeeService = require('../services/EmployeeService');
const CustomError = require('../../utils/CustomError');
const moment = require("moment");
const { generateFullUrl } = require('../../utils/helper');

const createEmployee = async (req, res, next) => {
  try {
    const profielPath = req.file ? req.file.path : null; // Construct path
    let imageUrl = ""
    if (profielPath) {
      imageUrl = generateFullUrl(req,profielPath);
    }
    let employeeData = { 
      ...req.body, 
       createdby: req.user.id,
       log_inst: req.user.log_inst,
       empAddressData:JSON.parse(req.body?.empAddressData) ,
       profile_pic: imageUrl};

        
    const deal = await EmployeeService.createEmployee(employeeData);
    res.status(201).success('Employee created successfully', deal);
  } catch (error) {
    next(error);
  }
};

const findEmployeeById = async (req, res, next) => {
  try {
    const deal = await EmployeeService.findEmployeeById(req.params.id);
    if (!deal) throw new CustomError('Employee not found', 404);
    res.status(200).success(null, deal);
  } catch (error) {
    next(error);
  }
};

const updateEmployee = async (req, res, next) => {
  try {
    const profielPath = req.file ? req.file.path : null; // Construct path
    let imageUrl = ""
    if (profielPath) {
      imageUrl = generateFullUrl(req,profielPath);
    }
    let employeeData = { ...req.body,updatedby:req.user.id ,empAddressData:JSON.parse(req.body?.empAddressData) , profile_pic: imageUrl};

        
    const deal = await EmployeeService.updateEmployee(req.params.id, employeeData);
    res.status(200).success('Employee updated successfully', deal);
  } catch (error) {
    next(error);
  }
};

const deleteEmployee = async (req, res, next) => {
  try {
    await EmployeeService.deleteEmployee(req.params.id);
    res.status(200).success('Employee deleted successfully', null);
  } catch (error) {
    next(error);
  }
};

const getAllEmployee = async (req, res, next) => {
  try {
    const { page , size , search ,startDate,endDate ,status  } = req.query;
    const deals = await EmployeeService.getAllEmployee(Number(page), Number(size) ,search ,moment(startDate),moment(endDate), status);
    res.status(200).success(null, deals);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createEmployee,
  findEmployeeById,
  updateEmployee,
  deleteEmployee,
  getAllEmployee,
};
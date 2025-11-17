const casesService = require('../services/casesService');
const CustomError = require('../../utils/CustomError');
const moment = require("moment");
const { getPrisma } = require("../../config/prismaContext.js");

const sanitizeCaseData = (data) => {
  return {
        ...data,
        product_id: Number(data?.product_id) || null,
        case_reason: Number(data?.case_reason) || null,
        contact_id: Number(data?.contact_id) || null,
        deal_id: Number(data?.deal_id) || null,
        case_owner_id: data.case_owner_id ? Number(data.case_owner_id) : null,
        account_id: Number(data?.account_id) || null,
        reported_by: Number(data?.reported_by) || null,
        is_active: data.is_active || "Y",
        log_inst: data.log_inst || 1,
        description: data.description ? String(data.description).trim() : "",
  };
};

const createCases = async (req, res, next) => {
  try {
    let caseData = { ...req.body };
    caseData = sanitizeCaseData( caseData); // Sanitize the cases data and handle company icon

    const cases = await casesService.createCases({...caseData,createdby:Number(req.user.id)});
    res.status(201).success('cases created successfully', cases);
  } catch (error) {
    next(error);
  }
};

const findCasesById = async (req, res, next) => {
  try {
    const cases = await casesService.findCasesById(req.params.id);
    if (!cases) throw new CustomError('cases not found', 404);
    res.status(200).success(null, cases);
  } catch (error) {
    next(error);
  }
};

const updateCases = async (req, res, next) => {
  try {
    // Handle company icon upload if provided
    const companyIconPath = req.file ? req.file.path : null; // Construct the file path if the icon is uploaded

    let caseData = { ...req.body };
    caseData = sanitizeCaseData( caseData); // Sanitize the cases data and handle company icon



    const cases = await casesService.updateCases(req.params.id, {...caseData,updatedby:req.user.id});
    res.status(200).success('cases updated successfully', cases);
  } catch (error) {
    next(error);
  }
};

const deleteCase = async (req, res, next) => {
  try {
    await casesService.deleteCase(req.params.id);
    res.status(200).success('cases deleted successfully', null);
  } catch (error) {
    next(error);
  }
};

const getAllCases = async (req, res, next) => {
  try {
    const { page , size , search ,startDate,endDate } = req.query;
    const casess = await casesService.getAllCases(search ,Number(page), Number(size),moment(startDate),moment(endDate));
    res.status(200).success(null, casess);
  } catch (error) {
    next(error);
  }
};
const getAllCaseReasons = async (req, res, next) => {
  try {
    const casess = await casesService.getAllCaseReasons();
    res.status(200).success(null, casess);
  } catch (error) {
    next(error);
  }
};
const generateCaseNumber = async (req, res, next) => {
  try {
    const casess = await casesService.generateCaseNumber();
    res.status(200).success(null, casess);
  } catch (error) {
    next(error);
  }
};


module.exports = {
  createCases,
  findCasesById,
  updateCases,
  deleteCase,
  getAllCases,
  getAllCaseReasons,
  generateCaseNumber
};

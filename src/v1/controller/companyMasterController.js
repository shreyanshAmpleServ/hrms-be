const companyService = require("../services/CompanyMasterService");
const CustomError = require("../../utils/CustomError");
const { generateFullUrl } = require("../../utils/helper");
const moment = require("moment");

// const sanitizecompanyData = (data) => {
//     return {
//         title: data.title ? String(data.title).trim() : null,
//         company: data.company ? String(data.company).trim() : null,
//         attachment: data.attachment ? String(data.attachment).trim() : null,

//         // Metadata
//         createdBy: data.createdBy || 1,
//         log_inst: data.log_inst || 1,
//     };
// };

const createCompany = async (req, res, next) => {
  try {
    console.log("daata : ", req.body);
    let companyData = { ...req.body };
    const company = await companyService.createCompany(companyData);
    res.status(201).success("Company created successfully", company);
  } catch (error) {
    next(error);
  }
};

const getCompanyById = async (req, res, next) => {
  try {
    const company = await companyService.findCompanyById(req.params.id);
    if (!company) throw new CustomError("Company not found", 404);

    res.status(200).success(null, company);
  } catch (error) {
    next(error);
  }
};

const updateCompany = async (req, res, next) => {
  try {
    // const attachmentPath = req.file ? req.file.path : null;
    let companyData = { ...req.body };
    // if (attachmentPath) companyData.attachment = generateFullUrl(req, attachmentPath);

    // companyData = sanitizecompanyData(companyData);

    const company = await companyService.updateCompany(
      req.params.id,
      companyData
    );
    res.status(200).success("Company updated successfully", company);
  } catch (error) {
    next(error);
  }
};

const deleteCompany = async (req, res, next) => {
  try {
    await companyService.deleteCompany(req.params.id);
    res.status(200).success("Company deleted successfully", null);
  } catch (error) {
    next(error);
  }
};

const getAllCompanies = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate, is_active } = req.query;
    const companies = await companyService.getAllCompanies(
      Number(page),
      Number(size),
      search,
      startDate && moment(startDate),
      endDate && moment(endDate),
      is_active
    );
    res.status(200).success(null, companies);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCompany,
  getCompanyById,
  updateCompany,
  deleteCompany,
  getAllCompanies,
};

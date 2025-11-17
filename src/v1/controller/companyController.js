const companyService = require('../services/companyService');
const CustomError = require('../../utils/CustomError');
const { generateFullUrl } = require('../../utils/helper');
const moment = require("moment");
const { getPrisma } = require("../../config/prismaContext.js");
const { uploadToBackblaze, deleteFromBackblaze } = require('../../utils/uploadBackblaze');
const { findCompanyById } = require('../models/companyModel');

const sanitizeCompanyData = (data) => {
  return {
    // Unique identifier (auto-generated, not part of the payload)
    // id: undefined,

    // Company details
    name: data.name ? String(data.name).trim() : null,
    registrationNumber: data.registrationNumber ? String(data.registrationNumber).trim() : null,
    email: data.email ? String(data.email).toLowerCase().trim() : null,
    phone: data.phone ? String(data.phone).trim() : null,
    website: data.website ? String(data.website).trim() : null,
    logo: data.logo ? String(data.logo).trim() : null,
    address: data.address ? String(data.address).trim() : null,

    // Business details
    industryType: data.industryType ? String(data.industryType).trim() : null,
    annualRevenue: data.annualRevenue ? parseFloat(data.annualRevenue) : null,
    employeeCount: data.employeeCount ? parseInt(data.employeeCount, 10) : null,
    businessType: data.businessType ? String(data.businessType).trim() : null,

    // Primary contact details
    primaryContactName: data.primaryContactName ? String(data.primaryContactName).trim() : null,
    primaryContactRole: data.primaryContactRole ? String(data.primaryContactRole).trim() : null,
    primaryContactEmail: data.primaryContactEmail ? String(data.primaryContactEmail).toLowerCase().trim() : null,
    primaryContactPhone: data.primaryContactPhone ? String(data.primaryContactPhone).trim() : null,

    // Secondary contact details
    secondaryContactName: data.secondaryContactName ? String(data.secondaryContactName).trim() : null,
    secondaryContactRole: data.secondaryContactRole ? String(data.secondaryContactRole).trim() : null,
    secondaryContactEmail: data.secondaryContactEmail ? String(data.secondaryContactEmail).toLowerCase().trim() : null,
    secondaryContactPhone: data.secondaryContactPhone ? String(data.secondaryContactPhone).trim() : null,

    // Metadata (handled by the database, not part of the payload)
    // log_inst: 1,
    // is_active: "Y",
    // createdDate: new Date(),
    // updatedDate: new Date(),
    // createdBy: 1,
  };
};

const createCompany = async (req, res, next) => {
  try {
    let logoUrl = null;
    if (req.file) {
      logoUrl = await uploadToBackblaze(req.file.buffer, req.file.originalname, req.file.mimetype , "company");
    }
    let companyData = { ...req.body, logo: logoUrl}; 
    companyData= sanitizeCompanyData(companyData)
    const company = await companyService.createCompany(companyData);
    res.status(201).success('Company created successfully', company);
  } catch (error) {
    console.log("error :",error)
    next(error);
  }
};

const getCompanyById = async (req, res, next) => {
  try {
    const company = await companyService.findCompanyById(req.params.id);
    if (!company) throw new CustomError('Company not found', 404);
   
    res.status(200).success(null, company);
  } catch (error) {
    next(error);
  }
};

const getCompanyByEmail = async (req, res, next) => {
  try {
    const company = await companyService.findCompanyByEmail(req.query.email);
    if (!company) throw new CustomError('Company not found', 404);
    res.status(200).success(null, company);
  } catch (error) {
    next(error);
  }
};

const updateCompany = async (req, res, next) => {
  try {
    const existingCompany = await findCompanyById(req.params.id);
    let companyData = { ...req.body };
    companyData.logo = req.body.logo; 
    if (req.file) {
      companyData.logo = await uploadToBackblaze(req.file.buffer, req.file.originalname, req.file.mimetype,"company");
    } 
    companyData= sanitizeCompanyData(companyData)
    const company = await companyService.updateCompany(req.params.id, companyData);
    res.status(200).success('Company updated successfully', company);

    if (req.file) {
      if (existingCompany.logo) {
        await deleteFromBackblaze(existingCompany.logo); // Delete the old logo
      }}
  } catch (error) {
    next(error);
  }
};

const deleteCompany = async (req, res, next) => {
  try{
    const existingCompany = await findCompanyById(req.params.id);
    await companyService.deleteCompany(req.params.id);
    res.status(200).success('Company deleted successfully', null);
    if (existingCompany.logo) {
      await deleteFromBackblaze(existingCompany.logo); // Delete the old logo
    }
  }catch (error) {
    next(error);
  }
};

const getAllCompanies = async (req, res, next) => {
  try {
    const { page , size , search ,startDate,endDate   } = req.query;
    const companies = await companyService.getAllCompanies(Number(page), Number(size) ,search ,moment(startDate),moment(endDate));
    res.status(200).success(null, companies);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCompany,
  getCompanyById,
  getCompanyByEmail,
  updateCompany,
  deleteCompany,
  getAllCompanies,
};

const companyModel = require('../models/companyModel');

const createCompany = async (data) => {
  return await companyModel.createCompany(data);
};

const findCompanyById = async (id) => {
  return await companyModel.findCompanyById(id);
};

const findCompanyByEmail = async (email) => {
  return await companyModel.findCompanyByEmail(email);
};

const updateCompany = async (id, data) => {
  return await companyModel.updateCompany(id, data);
};

const deleteCompany = async (id) => {
  return await companyModel.deleteCompany(id);
};

const getAllCompanies = async (page , size , search ,startDate,endDate ) => {
  return await companyModel.getAllCompanies(page , size , search ,startDate,endDate );
};

module.exports = {
  createCompany,
  findCompanyById,
  findCompanyByEmail,
  updateCompany,
  deleteCompany,
  getAllCompanies,
};

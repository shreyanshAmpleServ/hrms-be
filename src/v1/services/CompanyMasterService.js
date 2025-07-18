const companyModal = require("../models/CompanyMasterModel");

const createCompany = async (data) => {
  return await companyModal.createCompany(data);
};

const findCompanyById = async (id) => {
  return await companyModal.findCompanyById(id);
};

const updateCompany = async (id, data) => {
  return await companyModal.updateCompany(id, data);
};

const deleteCompany = async (id) => {
  return await companyModal.deleteCompany(id);
};

const getAllCompanies = async (
  page,
  size,
  search,
  startDate,
  endDate,
  is_active
) => {
  return await companyModal.getAllCompanies(
    page,
    size,
    search,
    startDate,
    endDate,
    is_active
  );
};

module.exports = {
  createCompany,
  findCompanyById,
  updateCompany,
  deleteCompany,
  getAllCompanies,
};

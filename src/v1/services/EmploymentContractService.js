const EmploymentContractModel = require("../models/employmentContractModel");
const { generateContractPDF } = require("../../utils/contractUtils");
const fs = require("fs");
const path = require("path");
const CustomError = require("../../utils/CustomError");
const { getPrisma } = require("../../config/prismaContext.js");

const createEmploymentContract = async (data) => {
  return await EmploymentContractModel.createEmploymentContract(data);
};

const findEmploymentContractById = async (id) => {
  return await EmploymentContractModel.findEmploymentContractById(id);
};

const updateEmploymentContract = async (id, data) => {
  return await EmploymentContractModel.updateEmploymentContract(id, data);
};

const deleteEmploymentContract = async (id) => {
  return await EmploymentContractModel.deleteEmploymentContract(id);
};

const getAllEmploymentContract = async (
  search,
  page,
  size,
  startDate,
  endDate,
  candidate_id
) => {
  return await EmploymentContractModel.getAllEmploymentContract(
    search,
    page,
    size,
    startDate,
    endDate,
    candidate_id
  );
};

const downloadContractPDF = async (data) => {
  if (!data) {
    throw new CustomError("Contract not found", 404);
  }

  const fileName = `Employement_Contract.pdf`;
  const filePath = path.join(__dirname, `../../pdfs/${fileName}`);

  if (!fs.existsSync(path.dirname(filePath))) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
  }

  await generateContractPDF(data, filePath);

  return filePath;
};

module.exports = {
  createEmploymentContract,
  findEmploymentContractById,
  updateEmploymentContract,
  deleteEmploymentContract,
  getAllEmploymentContract,
  downloadContractPDF,
};

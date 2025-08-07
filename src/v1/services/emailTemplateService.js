const { PrismaClient } = require("@prisma/client");
const emailTemplateModel = require("../services/emailTemplateModel.js");

const createEmailTemplate = async (data) => {
  return await emailTemplateModel.createEmailTemplate(data);
};

const getEmailTemplateById = async (id) => {
  return await emailTemplateModel.getEmailTemplateById(id);
};

const updateEmailTemplate = async (id, data) => {
  return await emailTemplateModel.updateEmailTemplate(id, data);
};

const deleteEmailTemplate = async (id) => {
  return await emailTemplateModel.deleteEmailTemplate(id);
};

const getAllEmailTemplate = async (search, page, size, startDate, endDate) => {
  return await emailTemplateModel.getAllEmailTemplate(
    search,
    page,
    size,
    startDate,
    endDate
  );
};

module.exports = {
  createEmailTemplate,
  getEmailTemplateById,
  updateEmailTemplate,
  deleteEmailTemplate,
  getAllEmailTemplate,
};

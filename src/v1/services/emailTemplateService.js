const { prisma } = require("../../utils/prismaProxy.js");
const emailTemplateModel = require("../models/emailTemplateModel.js");

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

const getAllEmailTemplate = async (
  search,
  page,
  size,
  startDate,
  endDate,
  type,
  channel
) => {
  return await emailTemplateModel.getAllEmailTemplate(
    search,
    page,
    size,
    startDate,
    endDate,
    type,
    channel
  );
};

module.exports = {
  createEmailTemplate,
  getEmailTemplateById,
  updateEmailTemplate,
  deleteEmailTemplate,
  getAllEmailTemplate,
};

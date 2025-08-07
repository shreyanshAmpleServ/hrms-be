const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const prisma = new PrismaClient();

// Serialize email template data
const serializeEmailTemplateData = (data) => ({
  name: data.name,
  subject: data.subject,
  body: data.body || "",
  createdby: data.createdby ? Number(data.createdby) : 1,
  updatedby: data.updatedby ? Number(data.updatedby) : null,
  updatedate: data.updatedate ? new Date(data.updatedate) : null,
});

// Create a new email template
const createEmailTemplate = async (data) => {
  try {
    const result = await prisma.hrms_d_templates.create({
      data: {
        ...serializeEmailTemplateData(data),
        createdate: new Date(),
      },
    });
    return result;
  } catch (error) {
    throw new CustomError(
      `Error creating email template: ${error.message}`,
      500
    );
  }
};

// Find email template by ID
const getEmailTemplateById = async (id) => {
  try {
    const result = await prisma.hrms_d_templates.findUnique({
      where: { id: Number(id) },
    });
    if (!result) {
      throw new CustomError("Email template not found", 404);
    }
    return result;
  } catch (error) {
    throw new CustomError(
      `Error finding email template by ID: ${error.message}`,
      503
    );
  }
};

// Update email template
const updateEmailTemplate = async (id, data) => {
  try {
    const result = await prisma.hrms_d_templates.update({
      where: { id: Number(id) },
      data: {
        ...serializeEmailTemplateData(data),
        updatedate: new Date(),
      },
    });
    return result;
  } catch (error) {
    throw new CustomError(
      `Error updating email template: ${error.message}`,
      500
    );
  }
};

// Delete email template
const deleteEmailTemplate = async (id) => {
  try {
    await prisma.hrms_d_templates.delete({
      where: { id: Number(id) },
    });
  } catch (error) {
    throw new CustomError(
      `Error deleting email template: ${error.message}`,
      500
    );
  }
};

// Get all email templates with pagination and search
const getAllEmailTemplate = async (search, page, size, startDate, endDate) => {
  try {
    page = !page || page == 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size || 0;

    const filters = {};
    if (search) {
      filters.OR = [
        { name: { contains: search.toLowerCase() } },
        { subject: { contains: search.toLowerCase() } },
        { body: { contains: search.toLowerCase() } },
      ];
    }
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        filters.createdate = { gte: start, lte: end };
      }
    }

    const datas = await prisma.hrms_d_templates.findMany({
      where: filters,
      skip,
      take: size,
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
    });
    const totalCount = await prisma.hrms_d_templates.count({
      where: filters,
    });

    return {
      data: datas,
      currentPage: page,
      size,
      totalPages: Math.ceil(totalCount / size),
      totalCount,
    };
  } catch (error) {
    throw new CustomError("Error retrieving email templates", 503);
  }
};

module.exports = {
  createEmailTemplate,
  getEmailTemplateById,
  updateEmailTemplate,
  deleteEmailTemplate,
  getAllEmailTemplate,
};

const CustomError = require("../../utils/CustomError");
const { getPrisma } = require("../../config/prismaContext.js");

// Serialize email template data
const serializeEmailTemplateData = (data) => ({
  name: data.name,
  key: data.key,
  channel: data.channel || "Other",
  type: data.type || "Other",
  subject: data.subject,
  body: data.body || "",
  createdby: data.createdby ? Number(data.createdby) : 1,
  updatedby: data.updatedby ? Number(data.updatedby) : null,
  updatedate: data.updatedate ? new Date(data.updatedate) : null,
});

const validateEmailTemplateData = async (data) => {
  const prisma = getPrisma();
  const errors = [];

  if (!data.body || data.body.trim() === "") {
    errors.push("Body is mandatory and cannot be empty");
  }

  if (!data.name || data.name.trim() === "") {
    errors.push("Name is mandatory and cannot be empty");
  }
  if (data.channel && data.channel.trim() === "") {
    errors.push("Channel cannot be empty if provided");
  }

  if (data.type && data.type.trim() === "") {
    errors.push("Type cannot be empty if provided");
  }
  if (data.name) {
    const existingName = await prisma.hrms_d_templates.findFirst({
      where: {
        name: data.name.trim(),
      },
    });
    if (existingName) {
      if (existingName.id !== Number(data.id)) {
        errors.push("Template name already exists");
      }
    }
  }

  if (data.key) {
    const existingKey = await prisma.hrms_d_templates.findFirst({
      where: {
        key: data.key.trim(),
      },
    });

    if (!existingKey) {
      errors.push("Template key already exists");
    }
    if (existingKey.id !== Number(data.id)) {
      errors.push("Template key already exists");
    }
  }

  if (errors.length > 0) {
    throw new CustomError(errors.join(", "), 400);
  }
};

const createEmailTemplate = async (data) => {
  const prisma = getPrisma();
  try {
      const prisma = getPrisma();
    await validateEmailTemplateData(data);

    const result = await prisma.hrms_d_templates.create({
      data: {
        ...serializeEmailTemplateData(data),
        createdate: new Date(),
      },
    });
    return result;
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    throw new CustomError(
      `Error creating email template: ${error.message}`,
      500
    );
  }
};

// Find email template by ID
const getEmailTemplateById = async (id) => {
  const prisma = getPrisma();
  try {
      const prisma = getPrisma();
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

const updateEmailTemplate = async (id, data) => {
  const prisma = getPrisma();
  try {
      const prisma = getPrisma();
    await validateEmailTemplateData({ ...data, id });

    const { key, ...restData } = data;

    const result = await prisma.hrms_d_templates.update({
      where: { id: Number(id) },
      data: {
        ...serializeEmailTemplateData(restData),
        updatedby: data.updatedby || 1,
        updatedate: new Date(),
      },
    });

    return result;
  } catch (error) {
    console.log(error);
    throw new CustomError(
      `Error updating email template: ${error.message}`,
      500
    );
  }
};

// Delete email template
const deleteEmailTemplate = async (id) => {
  const prisma = getPrisma();
  try {
      const prisma = getPrisma();
    await prisma.hrms_d_templates.delete({
      where: { id: Number(id) },
    });
  } catch (error) {
    if (error.code === "P2003") {
      throw new CustomError(
        "This record is connected to other data. Please remove that first.",
        400
      );
    } else {
      throw new CustomError(error.meta.constraint, 500);
    }
  }
};

// const getAllEmailTemplate = async (search, page, size, startDate, endDate) => {
//   try {
//     page = !page || page == 0 ? 1 : page;
//     size = size || 10;
//     const skip = (page - 1) * size || 0;

//     const filters = {};
//     if (search) {
//       filters.OR = [
//         { name: { contains: search.toLowerCase() } },
//         { subject: { contains: search.toLowerCase() } },
//         { body: { contains: search.toLowerCase() } },
//       ];
//     }
//     if (startDate && endDate) {
//       const start = new Date(startDate);
//       const end = new Date(endDate);
//       if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
//         filters.createdate = { gte: start, lte: end };
//       }
//     }

//     const datas = await prisma.hrms_d_templates.findMany({
//       where: filters,
//       skip,
//       take: size,
//       orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
//     });
//     const totalCount = await prisma.hrms_d_templates.count({
//       where: filters,
//     });

//     return {
//       data: datas,
//       currentPage: page,
//       size,
//       totalPages: Math.ceil(totalCount / size),
//       totalCount,
//     };
//   } catch (error) {
//     throw new CustomError("Error retrieving email templates", 503);
//   }
// };

const getAllEmailTemplate = async (search, page, size, startDate, endDate) => {
  const prisma = getPrisma();
  try {
      const prisma = getPrisma();
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

    // Extract variables from each template
    const extractVariables = (text) => {
      if (!text) return [];
      const regex = /\{\{([^}]+)\}\}/g;
      const matches = [];
      let match;
      while ((match = regex.exec(text)) !== null) {
        matches.push(match[1].trim());
      }
      return [...new Set(matches)];
    };

    const templatesWithVariables = datas.map((template) => {
      const subjectVariables = extractVariables(template.subject);
      const bodyVariables = extractVariables(template.body);
      const allVariables = [
        ...new Set([...subjectVariables, ...bodyVariables]),
      ];

      return {
        ...template,
        variables: allVariables,
      };
    });

    const totalCount = await prisma.hrms_d_templates.count({
      where: filters,
    });

    return {
      data: templatesWithVariables,
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

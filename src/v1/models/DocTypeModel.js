const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const prisma = new PrismaClient();

const createDocType = async (data) => {
  try {
    const finalData = await prisma.hrms_m_document_type.create({
      data: {
        doc_type: data.doc_type || "",
        createdby: data.createdby || 1,
        log_inst: data.log_inst || 1,
        createdate: new Date(),
        updatedate: new Date(),
        is_active: data.is_active || "Y",

        updatedby: 1,
      },
    });
    return finalData;
  } catch (error) {
    console.log("Create document type ", error);
    throw new CustomError(
      `Error creating document type: ${error.message}`,
      500
    );
  }
};

const findDocTypeById = async (id) => {
  try {
    const data = await prisma.hrms_m_document_type.findUnique({
      where: { id: parseInt(id) },
    });
    if (!data) {
      throw new CustomError("document type not found", 404);
    }
    return data;
  } catch (error) {
    console.log("document type By Id  ", error);
    throw new CustomError(
      `Error finding document type by ID: ${error.message}`,
      503
    );
  }
};

const updateDocType = async (id, data) => {
  try {
    const updatedData = await prisma.hrms_m_document_type.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        updatedate: new Date(),
      },
    });
    return updatedData;
  } catch (error) {
    throw new CustomError(
      `Error updating document type: ${error.message}`,
      500
    );
  }
};

const deleteDocType = async (id) => {
  try {
    await prisma.hrms_m_document_type.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    throw new CustomError(
      `Error deleting document type: ${error.message}`,
      500
    );
  }
};

// Get all document type
const getAllDocType = async (
  page,
  size,
  search,
  startDate,
  endDate,
  is_active
) => {
  try {
    page = page || page == 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size || 0;

    const filters = {};
    // Handle search
    if (search) {
      filters.OR = [
        {
          doc_type: { contains: search.toLowerCase() },
        },
      ];
    }
    if (typeof is_active === "boolean") {
      filters.is_active = is_active ? "Y" : "N";
    } else if (typeof is_active === "string") {
      if (is_active.toLowerCase() === "true") filters.is_active = "Y";
      else if (is_active.toLowerCase() === "false") filters.is_active = "N";
    }

    const data = await prisma.hrms_m_document_type.findMany({
      where: filters,
      skip: skip,
      take: size,
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
    });

    const totalCount = await prisma.hrms_m_document_type.count({
      where: filters,
    });
    return {
      data: data,
      currentPage: page,
      size,
      totalPages: Math.ceil(totalCount / size),
      totalCount: totalCount,
    };
  } catch (error) {
    console.log(error);
    throw new CustomError("Error retrieving document type", 503);
  }
};

module.exports = {
  createDocType,
  findDocTypeById,
  updateDocType,
  deleteDocType,
  getAllDocType,
};

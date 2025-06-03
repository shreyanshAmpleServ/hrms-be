const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const prisma = new PrismaClient();

// Serialize document upload data

const serializeDocumentData = (data) => ({
  employee_id: data.employee_id ? Number(data.employee_id) : null,
  document_type: data.document_type || "",
  document_path: data.document_path || "",
  uploaded_on: data.uploaded_on ? new Date(data.uploaded_on) : null,
  document_number: data.document_number || "",
  issued_date: data.issued_date ? new Date(data.issued_date) : null,
  expiry_date: data.expiry_date ? new Date(data.expiry_date) : null,
  is_mandatory:
    data.is_mandatory === "Y" || data.is_mandatory === "N"
      ? data.is_mandatory
      : "Y",
  document_owner_type: data.document_owner_type || "employee",
  document_owner_id: data.document_owner_id
    ? Number(data.document_owner_id)
    : null,
});

// Create a new document upload
const createDocumentUpload = async (data) => {
  try {
    const reqData = await prisma.hrms_d_document_upload.create({
      data: {
        ...serializeDocumentData(data),
        createdby: data.createdby || 1,
        createdate: new Date(),
        log_inst: data.log_inst || 1,
      },
      include: {
        document_upload_employee: {
          select: {
            id: true,
            employee_code: true,
            full_name: true,
          },
        },
      },
    });
    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error creating document upload: ${error.message}`,
      500
    );
  }
};

// Find document upload by ID
const getDocumentById = async (id) => {
  try {
    const reqData = await prisma.hrms_d_document_upload.findUnique({
      where: { id: parseInt(id) },
    });
    if (!reqData) {
      throw new CustomError("Document upload not found", 404);
    }
    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error finding document upload by ID: ${error.message}`,
      503
    );
  }
};

// Update document upload
const updateDocumentUpload = async (id, data) => {
  try {
    const updatedDocument = await prisma.hrms_d_document_upload.update({
      where: { id: parseInt(id) },
      include: {
        document_upload_employee: {
          select: {
            id: true,
            employee_code: true,
            full_name: true,
          },
        },
      },
      data: {
        ...serializeDocumentData(data),
        updatedby: data.updatedby || 1,
        updatedate: new Date(),
      },
    });
    return updatedDocument;
  } catch (error) {
    throw new CustomError(
      `Error updating document upload: ${error.message}`,
      500
    );
  }
};

// Delete document upload
const deleteDocumentUpload = async (id) => {
  try {
    await prisma.hrms_d_document_upload.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    throw new CustomError(
      `Error deleting document upload: ${error.message}`,
      500
    );
  }
};

// Get all document uploads with pagination and search
const getAllDocumentUpload = async (search, page, size, startDate, endDate) => {
  try {
    page = !page || page == 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size || 0;

    const filters = {};
    if (search) {
      filters.OR = [
        {
          document_upload_employee: {
            full_name: {
              contains: search.toLowerCase(),
            },
          },
        },
        { document_type: { contains: search.toLowerCase() } },
        {
          document_number: {
            contains: search.toLowerCase(),
          },
        },
        {
          document_owner_type: {
            contains: search.toLowerCase(),
          },
        },
      ];
    }
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        filters.createdate = { gte: start, lte: end };
      }
    }

    const datas = await prisma.hrms_d_document_upload.findMany({
      where: filters,
      skip,
      take: size,
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
      include: {
        document_upload_employee: {
          select: {
            id: true,
            employee_code: true,
            full_name: true,
          },
        },
      },
    });
    const totalCount = await prisma.hrms_d_document_upload.count({
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
    throw new CustomError("Error retrieving document uploads", 503);
  }
};

module.exports = {
  createDocumentUpload,
  getDocumentById,
  updateDocumentUpload,
  deleteDocumentUpload,
  getAllDocumentUpload,
};

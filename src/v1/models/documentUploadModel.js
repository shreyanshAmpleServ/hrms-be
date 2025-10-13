const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const prisma = new PrismaClient();

const generateDocumentCode = async () => {
  try {
    const prefix = "DOC-";
    const paddingLength = 5;

    // Get the latest document with the highest code
    const latestDocument = await prisma.hrms_d_document_upload.findFirst({
      where: {
        code: {
          startsWith: prefix,
        },
      },
      orderBy: {
        code: "desc",
      },
      select: {
        code: true,
      },
    });

    let nextNumber = 1;

    if (latestDocument && latestDocument.code) {
      // Extract the numeric part from the code
      const numericPart = latestDocument.code.replace(prefix, "");
      const lastNumber = parseInt(numericPart, 10);

      if (!isNaN(lastNumber)) {
        nextNumber = lastNumber + 1;
      }
    }

    let isUnique = false;
    let newCode = "";

    while (!isUnique) {
      newCode = prefix + String(nextNumber).padStart(paddingLength, "0");

      const existingDocument = await prisma.hrms_d_document_upload.findFirst({
        where: {
          code: newCode,
        },
      });

      if (!existingDocument) {
        isUnique = true;
      } else {
        nextNumber++;
      }
    }

    return newCode;
  } catch (error) {
    throw new CustomError(
      `Error generating document code: ${error.message}`,
      500
    );
  }
};

// Serialize document upload data
const serializeDocumentData = (data) => ({
  name: data.name,
  employee_id: data.employee_id ? Number(data.employee_id) : null,
  code: data.code,
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
  alert_before_expiry: data.alert_before_expiry
    ? Number(data.alert_before_expiry)
    : null,
  document_owner_id: data.document_owner_id
    ? Number(data.document_owner_id)
    : null,
});

// Create a new document upload
const createDocumentUpload = async (data) => {
  try {
    if (!data.code) {
      data.code = await generateDocumentCode();
    } else {
      const existingDocument = await prisma.hrms_d_document_upload.findFirst({
        where: {
          code: data.code,
        },
      });

      if (existingDocument) {
        throw new CustomError(
          `Document code '${data.code}' already exists`,
          400
        );
      }
    }

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
        updatedby: data.updatedby || null,
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
    if (error.code === "P2003") {
      throw new CustomError(
        "This record cannot be deleted because it has associated data other records. Please remove the dependent data first.",
        400
      );
    } else {
      throw new CustomError(error.meta.constraint, 500);
    }
  }
};

// Get all document uploads
const getAllDocumentUpload = async (
  search,
  page,
  size,
  startDate,
  endDate,
  employeeId
) => {
  try {
    page =
      !page || isNaN(parseInt(page)) || parseInt(page) <= 0
        ? 1
        : parseInt(page);
    size =
      !size || isNaN(parseInt(size)) || parseInt(size) <= 0
        ? 10
        : parseInt(size);
    const skip = (page - 1) * size;

    const filters = {};
    const andConditions = [];

    if (search) {
      andConditions.push({
        OR: [
          {
            document_upload_employee: {
              full_name: {
                contains: search.toLowerCase(),
              },
            },
          },
          {
            document_type: {
              contains: search.toLowerCase(),
            },
          },
        ],
      });
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        andConditions.push({
          createdate: {
            gte: start,
            lte: end,
          },
        });
      }
    }

    if (andConditions.length > 0) {
      filters.AND = andConditions;
    }

    if (employeeId) {
      filters.document_owner_id = parseInt(employeeId);
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
    console.error("Error in getAllDocumentUpload:", error);
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

const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const prisma = new PrismaClient();

// Serialize warning letter data
const serializeWarningLetterData = (data) => ({
  letter_type: data.letter_type || "",
  reason: data.reason || "",
  issued_date: data.issued_date ? new Date(data.issued_date) : new Date(),
  severity_level: data.severity_level || "",
  remarks: data.remarks || "",
  attachment_path: data.attachment_path || "",
  createdby: data.createdby || 1,
  createdate: new Date(),
  log_inst: data.log_inst || 1,
});

// Create a new warning letter
const createWarningLetter = async (data) => {
  try {
    const reqData = await prisma.hrms_d_warning_letters.create({
      data: {
        ...serializeWarningLetterData(data),

        warning_letters_employee: {
          connect: { id: Number(data.employee_id) },
        },
        warning_letters_issuedBy: {
          connect: { id: Number(data.issued_by) },
        },
      },
      include: {
        warning_letters_employee: {
          select: {
            id: true,
            employee_code: true,
            full_name: true,
          },
        },
        warning_letters_issuedBy: {
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
      `Error creating warning letter: ${error.message}`,
      500
    );
  }
};

// Find warning letter by ID
const findWarningLetterById = async (id) => {
  try {
    const reqData = await prisma.hrms_d_warning_letters.findUnique({
      where: { id: parseInt(id) },
    });
    if (!reqData) {
      throw new CustomError("Warning letter not found", 404);
    }
    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error finding warning letter by ID: ${error.message}`,
      503
    );
  }
};

// Update warning letter
const updateWarningLetter = async (id, data) => {
  try {
    const updatedEntry = await prisma.hrms_d_warning_letters.update({
      where: { id: parseInt(id) },
      data: {
        letter_type: data.letter_type || "",
        reason: data.reason || "",
        issued_date: data.issued_date ? new Date(data.issued_date) : new Date(),
        severity_level: data.severity_level || "",
        remarks: data.remarks || "",
        attachment_path: data.attachment_path || "",
        updatedby: data.updatedby || 1,
        updatedate: new Date(),

        // Update employee relation
        warning_letters_employee: {
          connect: { id: Number(data.employee_id) },
        },

        // Update issued_by relation
        warning_letters_issuedBy: {
          connect: { id: Number(data.issued_by) },
        },
      },
      include: {
        warning_letters_employee: {
          select: {
            id: true,
            employee_code: true,
            full_name: true,
          },
        },
        warning_letters_issuedBy: {
          select: {
            id: true,
            employee_code: true,
            full_name: true,
          },
        },
      },
    });

    return updatedEntry;
  } catch (error) {
    throw new CustomError(
      `Error updating warning letter: ${error.message}`,
      500
    );
  }
};

// Delete warning letter
const deleteWarningLetter = async (id) => {
  try {
    await prisma.hrms_d_warning_letters.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    throw new CustomError(
      `Error deleting warning letter: ${error.message}`,
      500
    );
  }
};

// Get all warning letters with pagination and search
const getAllWarningLetter = async (search, page, size, startDate, endDate) => {
  try {
    page = !page || page == 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size || 0;

    const filters = {};
    if (search) {
      filters.OR = [
        {
          warning_letters_employee: {
            full_name: { contains: search.toLowerCase() },
          },
          warning_letters_issuedBy: {
            full_name: { contains: search.toLowerCase() },
          },
        },
        { letter_type: { contains: search.toLowerCase() } },
        { reason: { contains: search.toLowerCase() } },
        { severity_level: { contains: search.toLowerCase() } },
        { remarks: { contains: search.toLowerCase() } },
      ];
    }
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        filters.issued_date = { gte: start, lte: end };
      }
    }

    const datas = await prisma.hrms_d_warning_letters.findMany({
      where: filters,
      skip,
      take: size,
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
      include: {
        warning_letters_employee: {
          select: {
            id: true,
            employee_code: true,
            full_name: true,
          },
        },
        warning_letters_issuedBy: {
          select: {
            id: true,
            employee_code: true,
            full_name: true,
          },
        },
      },
    });
    const totalCount = await prisma.hrms_d_warning_letters.count({
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
    throw new CustomError("Error retrieving warning letters", 503);
  }
};

module.exports = {
  createWarningLetter,
  findWarningLetterById,
  updateWarningLetter,
  deleteWarningLetter,
  getAllWarningLetter,
};

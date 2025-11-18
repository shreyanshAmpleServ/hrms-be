const { prisma } = require("../../utils/prismaProxy.js");
const CustomError = require("../../utils/CustomError");

// Serialize warning letter data
const serializeWarningLetterData = (data) => ({
  reason: data.reason?.trim().toLowerCase() || "",
  issued_date: data.issued_date ? new Date(data.issued_date) : new Date(),
  severity_level: data.severity_level?.trim().toLowerCase() || "",
  remarks: data.remarks?.trim().toLowerCase() || "",
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
        warning_letter_type: {
          connect: { id: Number(data.letter_type) },
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
        warning_letter_type: true,
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
    const updateData = {
      reason: data.reason?.trim().toLowerCase() || "",
      issued_date: data.issued_date ? new Date(data.issued_date) : new Date(),
      severity_level: data.severity_level?.trim().toLowerCase() || "",
      remarks: data.remarks?.trim().toLowerCase() || "",
      attachment_path: data.attachment_path || "",
      updatedby: data.updatedby || 1,
      updatedate: new Date(),
    };

    if (data.employee_id) {
      updateData.warning_letters_employee = {
        connect: { id: Number(data.employee_id) },
      };
    }

    if (data.issued_by) {
      updateData.warning_letters_issuedBy = {
        connect: { id: Number(data.issued_by) },
      };
    }

    if (data.letter_type) {
      updateData.warning_letter_type = {
        connect: { id: Number(data.letter_type) },
      };
    }

    const updatedEntry = await prisma.hrms_d_warning_letters.update({
      where: { id: parseInt(id) },
      data: updateData,
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
        warning_letter_type: true,
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

// Get all warning letters with pagination and search
const getAllWarningLetter = async (search, page, size, startDate, endDate) => {
  try {
    page = !page || page == 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size || 0;

    const filters = {};

    if (search) {
      const searchText = search.toLowerCase();

      const orFilters = [
        {
          reason: { contains: searchText },
        },
        {
          severity_level: { contains: searchText },
        },
        {
          remarks: { contains: searchText },
        },
        {
          warning_letters_employee: {
            full_name: { contains: searchText },
          },
        },
        {
          warning_letters_issuedBy: {
            full_name: { contains: searchText },
          },
        },
      ];

      if (!isNaN(Number(searchText))) {
        orFilters.push({ letter_type: Number(searchText) });
      }

      filters.OR = orFilters;
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
        warning_letter_type: true,
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

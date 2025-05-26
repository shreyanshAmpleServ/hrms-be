const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const { errorNotExist } = require("../../Comman/errorNotExist");
const prisma = new PrismaClient();

const serializeData = (data) => {
  return {
    employee_id: Number(data.employee_id) || null,
    review_period: data.review_period || "",
    rating: Number(data.rating) || 0,
    reviewer_comments: data.reviewer_comments || "",
  };
};

// Create a new appraisal entry
const createAppraisalEntry = async (data) => {
  try {
    await errorNotExist("hrms_d_employee", data.employee_id, "Employee");
    const reqData = await prisma.hrms_d_appraisal.create({
      data: {
        ...serializeData(data),
        createdby: data.createdby || 1,
        createdate: new Date(),
        log_inst: data.log_inst || 1,
      },
      include: {
        appraisal_employee: {
          select: {
            full_name: true,
            id: true,
          },
        },
      },
    });
    return reqData;
  } catch (error) {
    console.error("Error creating appraisal entry:", error);
    throw new CustomError(
      `Error creating appraisal entry: ${error.message}`,
      500
    );
  }
};

// Find a appraisal entry by ID
const findAppraisalEntryById = async (id) => {
  try {
    const reqData = await prisma.hrms_d_appraisal.findUnique({
      where: { id: parseInt(id) },
      include: {
        appraisal_employee: {
          select: {
            full_name: true,
            id: true,
          },
        },
      },
    });
    if (!reqData) {
      throw new CustomError("appraisal entry not found", 404);
    }
    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error finding appraisal entry by ID: ${error.message}`,
      503
    );
  }
};

// Update a appraisal entry
const updateAppraisalEntry = async (id, data) => {
  try {
    await errorNotExist("hrms_d_employee", data.employee_id, "Employee");
    const updatedAppraisalEntry = await prisma.hrms_d_appraisal.update({
      where: { id: parseInt(id) },
      data: {
        ...serializeData(data),
        updatedby: data.updatedby || 1,
        updatedate: new Date(),
      },
      include: {
        appraisal_employee: {
          select: {
            full_name: true,
            id: true,
          },
        },
      },
    });
    return updatedAppraisalEntry;
  } catch (error) {
    throw new CustomError(
      `Error updating appraisal entry: ${error.message}`,
      500
    );
  }
};

// Delete a appraisal entry
const deleteAppraisalEntry = async (id) => {
  try {
    await prisma.hrms_d_appraisal.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    throw new CustomError(
      `Error deleting appraisal entry: ${error.message}`,
      500
    );
  }
};

// Get all appraisal entrys
const getAllAppraisalEntry = async (search, page, size, startDate, endDate) => {
  try {
    page = !page || page == 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size || 0;

    const filters = {};
    // Handle search
    if (search) {
      filters.OR = [
        {
          appraisal_employee: {
            full_name: { contains: search.toLowerCase() },
          },
        },
        {
          rating: { equals: search },
        },
        // {
        //   interest_rate: { equals: search },
        // },
      ];
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        filters.createdate = {
          gte: start,
          lte: end,
        };
      }
    }
    const datas = await prisma.hrms_d_appraisal.findMany({
      where: filters,
      skip: skip,
      take: size,
      include: {
        appraisal_employee: {
          select: {
            full_name: true,
            id: true,
          },
        },
      },
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
    });
    // const totalCount = await prisma.hrms_d_appraisal.count();
    const totalCount = await prisma.hrms_d_appraisal.count({
      where: filters,
    });

    return {
      data: datas,
      currentPage: page,
      size,
      totalPages: Math.ceil(totalCount / size),
      totalCount: totalCount,
    };
  } catch (error) {
    throw new CustomError("Error retrieving appraisal entrys", 503);
  }
};

module.exports = {
  createAppraisalEntry,
  findAppraisalEntryById,
  updateAppraisalEntry,
  deleteAppraisalEntry,
  getAllAppraisalEntry,
};

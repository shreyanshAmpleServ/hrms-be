const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const { errorNotExist } = require("../../Comman/errorNotExist");
const { createRequest } = require("./requestsModel");
const prisma = new PrismaClient();

const serializeData = (data) => {
  return {
    employee_id: Number(data.employee_id) || null,
    review_period: data.review_period || "",
    rating: parseFloat(data.rating) || 0,
    reviewer_comments: data.reviewer_comments || "",
    status: data.status || "P",
    appraisal_cycle_id: Number(data.appraisal_cycle_id) || null,
    appraisal_template_id: Number(data.appraisal_template_id) || null,
    reviewer_id: Number(data.reviewer_id) || null,
    hr_reviewer_id: Number(data.hr_reviewer_id) || null,
    review_start_date: data.review_start_date
      ? new Date(data.review_start_date)
      : null,
    review_end_date: data.review_end_date
      ? new Date(data.review_end_date)
      : null,
    final_score: data.final_score ? Number(data.final_score) : null,
    overall_remarks: data.overall_remarks || "",
    effective_date: data.effective_date ? new Date(data.effective_date) : null,
    review_date: data.review_date ? new Date(data.review_date) : null,
    next_review_date: data.next_review_date
      ? new Date(data.next_review_date)
      : null,
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
    await createRequest({
      requester_id: reqData.employee_id,
      request_type: "appraisal_review",
      reference_id: reqData.id,
      // request_data:
      //   reqData.reason ||
      //   `Leave from ${reqData.start_date} to ${reqData.end_date}`,
      createdby: data.createdby || 1,
      log_inst: data.log_inst || 1,
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

// Get all appraisal entrys
const getAllAppraisalEntry = async (search, page, size, startDate, endDate) => {
  try {
    page = !page || page == 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size || 0;

    const filters = {};
    if (search) {
      filters.OR = [
        {
          appraisal_employee: {
            full_name: { contains: search.toLowerCase() },
          },
        },
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

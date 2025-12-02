const { prisma } = require("../../utils/prismaProxy.js");
const CustomError = require("../../utils/CustomError");
const { checkDuplicate } = require("../../utils/duplicateCheck");

const createJobCategory = async (data) => {
  try {
    await checkDuplicate({
      model: "hrms_m_job_category",
      field: "job_category_name",
      value: data.job_category_name,
      errorMessage: "Job category already exists",
    });
    const finalData = await prisma.hrms_m_job_category.create({
      data: {
        job_category_name: data.job_category_name || "",
        is_active: data.is_active || "Y",

        createdby: data.createdby || 1,
        log_inst: data.log_inst || 1,
        createdate: new Date(),
        updatedate: new Date(),
        updatedby: 1,
      },
    });
    return finalData;
  } catch (error) {
    console.log("Create job category ", error);
    throw new CustomError(error.message, 500);
  }
};

const findJobCategoryById = async (id) => {
  try {
    const data = await prisma.hrms_m_job_category.findUnique({
      where: { id: parseInt(id) },
    });
    if (!data) {
      throw new CustomError("job category not found", 404);
    }
    return data;
  } catch (error) {
    console.log("job category By Id  ", error);
    throw new CustomError(error.message, 500);
  }
};

const updateJobCategory = async (id, data) => {
  try {
    await checkDuplicate({
      model: "hrms_m_job_category",
      field: "job_category_name",
      value: data.job_category_name,
      excludeId: id,
      errorMessage: "Job category already exists",
    });
    const updatedData = await prisma.hrms_m_job_category.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        updatedate: new Date(),
      },
    });
    return updatedData;
  } catch (error) {
    throw new CustomError(error.message, 500);
  }
};

const deleteJobCategory = async (id) => {
  try {
    await prisma.hrms_m_job_category.delete({
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

// Get all job category
const getAllJobCategory = async (
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
          job_category_name: { contains: search.toLowerCase() },
        },
      ];
    }
    if (typeof is_active === "boolean") {
      filters.is_active = is_active ? "Y" : "N";
    } else if (typeof is_active === "string") {
      if (is_active.toLowerCase() === "true") filters.is_active = "Y";
      else if (is_active.toLowerCase() === "false") filters.is_active = "N";
    }

    // if (startDate && endDate) {
    //   const start = new Date(startDate);
    //   const end = new Date(endDate);

    //   if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
    //     filters.createdate = {
    //       gte: start,
    //       lte: end,
    //     };
    //   }
    // }
    const data = await prisma.hrms_m_job_category.findMany({
      where: filters,
      skip: skip,
      take: size,

      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
    });

    const totalCount = await prisma.hrms_m_job_category.count({
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
    throw new CustomError("Error retrieving job category", 503);
  }
};

module.exports = {
  createJobCategory,
  findJobCategoryById,
  updateJobCategory,
  deleteJobCategory,
  getAllJobCategory,
};

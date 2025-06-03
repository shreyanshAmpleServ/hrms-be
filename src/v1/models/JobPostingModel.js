const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const prisma = new PrismaClient();

const serializeJobData = (data) => {
  return {
    department_id: Number(data.department_id) || null,
    designation_id: Number(data.designation_id) || null,
    job_title: data.job_title || "",
    description: data.description || "",
    required_experience: data.required_experience || "",
    posting_date: data.posting_date || new Date(),
    closing_date: data.closing_date || null,
    is_internal:
      typeof data.is_internal === "boolean"
        ? data.is_internal
        : data.is_internal === "true" ||
          data.is_internal === 1 ||
          data.is_internal === "1",
  };
};

// Create a new job posting
const createJobPosting = async (data) => {
  try {
    const reqData = await prisma.hrms_d_job_posting.create({
      data: {
        ...serializeJobData(data),
        createdby: data.createdby || 1,
        createdate: new Date(),
        log_inst: data.log_inst || 1,
      },
      include: {
        hrms_job_department: {
          select: {
            department_name: true,
            id: true,
          },
        },
        hrms_job_designation: {
          select: {
            designation_name: true,
            id: true,
          },
        },
      },
    });
    return reqData;
  } catch (error) {
    throw new CustomError(`Error creating job posting: ${error.message}`, 500);
  }
};

// Find a job posting by ID
const findJobPostingById = async (id) => {
  try {
    const reqData = await prisma.hrms_d_job_posting.findUnique({
      where: { id: parseInt(id) },
    });
    if (!JobPosting) {
      throw new CustomError("job posting not found", 404);
    }
    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error finding job posting by ID: ${error.message}`,
      503
    );
  }
};

// Update a job posting
const updateJobPosting = async (id, data) => {
  try {
    const updatedJobPosting = await prisma.hrms_d_job_posting.update({
      where: { id: parseInt(id) },
      data: {
        ...serializeJobData(data),
        updatedby: data.updatedby || 1,
        updatedate: new Date(),
      },
      include: {
        hrms_job_department: {
          select: {
            department_name: true,
            id: true,
          },
        },
        hrms_job_designation: {
          select: {
            designation_name: true,
            id: true,
          },
        },
      },
    });

    return updatedJobPosting;
  } catch (error) {
    throw new CustomError(`Error updating job posting: ${error.message}`, 500);
  }
};

// Delete a job posting
const deleteJobPosting = async (id) => {
  try {
    await prisma.hrms_d_job_posting.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    throw new CustomError(`Error deleting job posting: ${error.message}`, 500);
  }
};

// Get all job postings
const getAllJobPosting = async (search, page, size, startDate, endDate) => {
  try {
    page = !page || page == 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size || 0;

    const filters = {};
    // Handle search
    if (search) {
      filters.OR = [
        {
          hrms_job_department: {
            department_name: { contains: search.toLowerCase() },
          },
        },
        {
          hrms_job_designation: {
            designation_name: { contains: search.toLowerCase() },
          },
        },
        {
          job_title: { contains: search.toLowerCase() },
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
    const datas = await prisma.hrms_d_job_posting.findMany({
      where: filters,
      skip: skip,
      take: size,
      include: {
        hrms_job_department: {
          select: {
            department_name: true,
            id: true,
          },
        },
        hrms_job_designation: {
          select: {
            designation_name: true,
            id: true,
          },
        },
      },
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
    });
    // const totalCount = await prisma.hrms_d_job_posting.count();
    const totalCount = await prisma.hrms_d_job_posting.count({
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
    throw new CustomError("Error retrieving job postings", 503);
  }
};

module.exports = {
  createJobPosting,
  findJobPostingById,
  updateJobPosting,
  deleteJobPosting,
  getAllJobPosting,
};

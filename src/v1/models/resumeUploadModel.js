const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const { errorNotExist } = require("../../Comman/errorNotExist");
const prisma = new PrismaClient();

const serializeJobData = (data) => {
  return {
    candidate_id: Number(data.candidate_id) || null,
    resume_path: data.resume_path || "",
    uploaded_on: data.uploaded_on || new Date(),
  };
};

// Create a new resume
const createResumeUpload = async (data) => {
  try {
    await errorNotExist(
      "hrms_d_candidate_master",
      data.candidate_id,
      "Candidate"
    );
    const reqData = await prisma.hrms_d_resume.create({
      data: {
        ...serializeJobData(data),
        createdby: data.createdby || 1,
        createdate: new Date(),
        log_inst: data.log_inst || 1,
      },
      include: {
        resume_candidate: {
          select: {
            full_name: true,
            id: true,
          },
        },
      },
    });
    return reqData;
  } catch (error) {
    throw new CustomError(`Error creating resume: ${error.message}`, 500);
  }
};

// Find a resume by ID
const findResumeUploadById = async (id) => {
  try {
    const reqData = await prisma.hrms_d_resume.findUnique({
      where: { id: parseInt(id) },
    });
    if (!reqData) {
      throw new CustomError("resume not found", 404);
    }
    return reqData;
  } catch (error) {
    throw new CustomError(`Error finding resume by ID: ${error.message}`, 503);
  }
};

// Update a resume
const updateResumeUpload = async (id, data) => {
  try {
    await errorNotExist(
      "hrms_d_candidate_master",
      data.candidate_id,
      "Candidate"
    );

    const updatedResumeUpload = await prisma.hrms_d_resume.update({
      where: { id: parseInt(id) },
      data: {
        ...serializeJobData(data),
        updatedby: data.updatedby || 1,
        updatedate: new Date(),
      },
      include: {
        resume_candidate: {
          select: {
            full_name: true,
            id: true,
          },
        },
      },
    });
    return updatedResumeUpload;
  } catch (error) {
    console.error("Error updating resume:", error);
    throw new CustomError(`Error updating resume: ${error.message}`, 500);
  }
};

// Delete a resume
const deleteResumeUpload = async (id) => {
  try {
    await prisma.hrms_d_resume.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    throw new CustomError(`Error deleting resume: ${error.message}`, 500);
  }
};

// Get all resumes
const getAllResumeUpload = async (
  search,
  page,
  size,
  startDate,
  endDate,
  candidate_id
) => {
  try {
    page = !page || page == 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size || 0;

    const filters = {};
    // Handle search
    if (search) {
      filters.OR = [
        {
          resume_candidate: {
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
    if (candidate_id) {
      filters.candidate_id = parseInt(candidate_id);
    }
    const datas = await prisma.hrms_d_resume.findMany({
      where: filters,
      skip: skip,
      take: size,
      include: {
        resume_candidate: {
          select: {
            full_name: true,
            id: true,
          },
        },
      },
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
    });
    const totalCount = await prisma.hrms_d_resume.count({
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
    throw new CustomError("Error retrieving resumes", 503);
  }
};

module.exports = {
  createResumeUpload,
  findResumeUploadById,
  updateResumeUpload,
  deleteResumeUpload,
  getAllResumeUpload,
};

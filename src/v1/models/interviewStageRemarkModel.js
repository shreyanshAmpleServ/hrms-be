const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const prisma = new PrismaClient();

// Serialize
const serializeRemarkData = (data) => ({
  candidate_id: data.candidate_id ? Number(data.candidate_id) : null,
  stage_id: Number(data.stage_id),
  stage_name: data.stage_name || null,
  remark: data.remark || null,
  rating: data.rating ? Number(data.rating) : null,
  is_completed: data.is_completed ?? false,
});

// Create
const createInterviewStageRemark = async (data) => {
  try {
    const result = await prisma.hrms_m_interview_stage_remark.create({
      data: {
        ...serializeRemarkData(data),
        createdby: data.createdby || 1,
        createdate: new Date(),
        log_inst: data.log_inst || 1,
      },
      include: {
        interview_stage_candidate: {
          select: { id: true, full_name: true, candidate_code: true },
        },
        interview_stage_stage_id: {
          select: { id: true, stage_name: true },
        },
      },
    });
    return result;
  } catch (error) {
    throw new CustomError(
      `Error creating interview stage remark: ${error.message}`,
      500
    );
  }
};

//  Read by ID
const findInterviewStageRemarkById = async (id) => {
  try {
    const remark = await prisma.hrms_m_interview_stage_remark.findUnique({
      where: { id: parseInt(id) },
      include: {
        interview_stage_candidate: {
          select: { id: true, full_name: true, candidate_code: true },
        },
        interview_stage_stage_id: {
          select: { id: true, stage_name: true },
        },
      },
    });
    if (!remark) throw new CustomError("Interview stage remark not found", 404);
    return remark;
  } catch (error) {
    throw new CustomError(`Error fetching remark: ${error.message}`, 500);
  }
};

//  Update
const updateInterviewStageRemark = async (id, data) => {
  try {
    const updated = await prisma.hrms_m_interview_stage_remark.update({
      where: { id: parseInt(id) },
      data: {
        ...serializeRemarkData(data),
        updatedby: data.updatedby || 1,
        updatedate: new Date(),
      },
      include: {
        interview_stage_candidate: {
          select: { id: true, full_name: true, candidate_code: true },
        },
        interview_stage_stage_id: {
          select: { id: true, stage_name: true },
        },
      },
    });
    return updated;
  } catch (error) {
    throw new CustomError(
      `Error updating interview stage remark: ${error.message}`,
      500
    );
  }
};

//  Delete
const deleteInterviewStageRemark = async (id) => {
  try {
    await prisma.hrms_m_interview_stage_remark.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    throw new CustomError(`Error deleting remark: ${error.message}`, 500);
  }
};

//  Get All
const getAllInterviewStageRemark = async (search, page, size) => {
  try {
    page = page && page > 0 ? page : 1;
    size = size || 10;
    const skip = (page - 1) * size;

    const filters = {};
    if (search) {
      filters.OR = [
        { stage_name: { contains: search.toLowerCase() } },
        { remark: { contains: search.toLowerCase() } },
        {
          interview_stage_candidate: {
            full_name: { contains: search.toLowerCase() },
          },
        },
        {
          interview_stage_stage_id: {
            stage_name: { contains: search.toLowerCase() },
          },
        },
      ];
    }

    const data = await prisma.hrms_m_interview_stage_remark.findMany({
      where: filters,
      skip,
      take: size,
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
      include: {
        interview_stage_candidate: {
          select: { id: true, full_name: true, candidate_code: true },
        },
        interview_stage_stage_id: {
          select: { id: true, stage_name: true },
        },
      },
    });

    const totalCount = await prisma.hrms_m_interview_stage_remark.count({
      where: filters,
    });

    return {
      data,
      currentPage: page,
      size,
      totalPages: Math.ceil(totalCount / size),
      totalCount,
    };
  } catch (error) {
    throw new CustomError(`Error fetching remarks: ${error.message}`, 503);
  }
};

module.exports = {
  createInterviewStageRemark,
  findInterviewStageRemarkById,
  updateInterviewStageRemark,
  deleteInterviewStageRemark,
  getAllInterviewStageRemark,
};

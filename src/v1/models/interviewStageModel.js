const { prisma } = require("../../utils/prismaProxy.js");
const CustomError = require("../../utils/CustomError");

// Serializer
const serializeInterviewStage = (data) => ({
  stage_name: data.stage_name,
  description: data.description,
  sort_order: data.sort_order ? Number(data.sort_order) : 0,
  stage_code: data.stage_code,
});

// Create
const createInterviewStage = async (data) => {
  try {
    const result = await prisma.hrms_m_interview_stage.create({
      data: {
        ...serializeInterviewStage(data),
        createdby: data.createdby || 1,
        createdate: new Date(),
        log_inst: data.log_inst || 1,
      },
    });
    return result;
  } catch (error) {
    throw new CustomError(
      `Error creating interview stage: ${error.message}`,
      500
    );
  }
};

// Read by ID
const findInterviewStageById = async (id) => {
  try {
    const stage = await prisma.hrms_m_interview_stage.findUnique({
      where: { id: parseInt(id) },
    });
    if (!stage) {
      throw new CustomError("Interview stage not found", 404);
    }
    return stage;
  } catch (error) {
    throw new CustomError(
      `Error fetching interview stage: ${error.message}`,
      503
    );
  }
};

// Update
const updateInterviewStage = async (id, data) => {
  try {
    const updated = await prisma.hrms_m_interview_stage.update({
      where: { id: parseInt(id) },
      data: {
        ...serializeInterviewStage(data),
        updatedby: data.updatedby || 1,
        updatedate: new Date(),
      },
    });
    return updated;
  } catch (error) {
    throw new CustomError(
      `Error updating interview stage: ${error.message}`,
      500
    );
  }
};

// Delete
const deleteInterviewStage = async (id) => {
  try {
    const stageId = parseInt(id);
    if (isNaN(stageId)) {
      throw new CustomError("Invalid interview stage ID", 400);
    }

    const existing = await prisma.hrms_m_interview_stage.findUnique({
      where: { id: stageId },
    });

    if (!existing) {
      throw new CustomError("Interview stage not found", 404);
    }

    await prisma.$transaction([
      prisma.hrms_m_interview_stage_remark.deleteMany({
        where: { stage_id: stageId },
      }),
      prisma.hrms_d_candidate_master.updateMany({
        where: { interview_stage: stageId },
        data: {
          interview_stage: null,
          updatedby: 1,
          updatedate: new Date(),
        },
      }),
      prisma.hrms_m_interview_stage.delete({
        where: { id: stageId },
      }),
    ]);

    return { message: "Interview stage and its children deleted successfully" };
  } catch (error) {
    // Keep consistent error patterns
    if (error instanceof CustomError) throw error;
    throw new CustomError(
      `Error deleting interview stage: ${error.message}`,
      500
    );
  }
};

// List all with search & pagination
const getAllInterviewStage = async (search, page, size) => {
  try {
    page = page && page > 0 ? page : 1;
    size = size || 10;
    const skip = (page - 1) * size;

    const filters = {};
    if (search) {
      filters.stage_name = { contains: search.toLowerCase() };
    }

    const data = await prisma.hrms_m_interview_stage.findMany({
      where: filters,
      skip,
      take: size,
      orderBy: [{ sort_order: "asc" }],
    });

    const totalCount = await prisma.hrms_m_interview_stage.count({
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
    throw new CustomError(
      `Error retrieving interview stages: ${error.message}`,
      503
    );
  }
};

module.exports = {
  createInterviewStage,
  findInterviewStageById,
  updateInterviewStage,
  deleteInterviewStage,
  getAllInterviewStage,
};

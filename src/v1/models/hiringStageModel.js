const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const prisma = new PrismaClient();

const serializeHiringStageData = (data) => ({
  code: data.code || "",
  stage_id: data.stage_id || "",
  description: data.description || null,
  planned_date: data.planned_date ? new Date(data.planned_date) : null,
  completion_date: data.completion_date ? new Date(data.completion_date) : null,
  feedback: data.feedback || null,
  competency_level: data.competency_level || null,
  remarks: data.remarks || null,
});

const createHiringStage = async (data) => {
  try {
    const existing = await prisma.hrms_d_hiring_stage.findFirst({
      where: { code: data.code },
    });

    if (existing) {
      throw new CustomError(
        `Code '${data.code}' already exists. Please use a unique code.`,
        400
      );
    }

    const newStage = await prisma.hrms_d_hiring_stage.create({
      data: {
        ...serializeHiringStageData(data),
        createdby: data.createdby || 1,
        createdate: new Date(),
        log_inst: data.log_inst || 1,
      },
      include: {
        hiring_stage_hiring_value: {
          select: { id: true, value: true },
        },
      },
    });

    return newStage;
  } catch (error) {
    if (error.code === "P2002") {
      throw new CustomError(`Code '${data.code}' must be unique.`, 400);
    }
    throw new CustomError(`Error creating hiring stage: ${error.message}`, 500);
  }
};

const getHiringStageById = async (id) => {
  try {
    const stage = await prisma.hrms_d_hiring_stage.findFirst({
      where: { id: parseInt(id) },
    });
    if (!stage) {
      throw new CustomError("Hiring stage not found", 404);
    }
    return stage;
  } catch (error) {
    throw new CustomError(
      `Error finding hiring stage by ID: ${error.message}`,
      503
    );
  }
};
const updateHiringStage = async (id, data) => {
  try {
    if (data.code) {
      const existing = await prisma.hrms_d_hiring_stage.findFirst({
        where: {
          code: data.code,
          NOT: { id: parseInt(id) },
        },
      });

      if (existing) {
        throw new CustomError(
          `Code '${data.code}' already exists. Please use a unique code.`,
          400
        );
      }
    }

    const updatedStage = await prisma.hrms_d_hiring_stage.update({
      where: { id: parseInt(id) },
      data: {
        ...serializeHiringStageData(data),
        updatedby: data.updatedby || 1,
        updatedate: new Date(),
      },
      include: {
        hiring_stage_hiring_value: {
          select: { id: true, value: true },
        },
      },
    });

    return updatedStage;
  } catch (error) {
    if (error.code === "P2002") {
      throw new CustomError(`Code '${data.code}' must be unique.`, 400);
    }
    throw new CustomError(`Error updating hiring stage: ${error.message}`, 500);
  }
};

const deleteHiringStage = async (id) => {
  try {
    await prisma.hrms_d_hiring_stage.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    if (error.code === "P2003") {
      throw new CustomError(
        "This record is connected to other data. Please remove that first.",
        400
      );
    } else {
      throw new CustomError(error.meta?.constraint || error.message, 500);
    }
  }
};

const getAllHiringStages = async (
  search,
  page,
  size,
  startDate,
  endDate,
  status
) => {
  try {
    page = !page || page == 0 ? 1 : parseInt(page);
    size = size ? parseInt(size) : 10;
    const skip = (page - 1) * size;

    const filters = {};
    const andFilters = [];

    if (search) {
      andFilters.push({
        OR: [
          { name: { contains: search.toLowerCase() } },
          { code: { contains: search.toLowerCase() } },
          { stage_name: { contains: search.toLowerCase() } },
          { competency_level: { contains: search.toLowerCase() } },
          { remarks: { contains: search.toLowerCase() } },
        ],
      });
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        andFilters.push({
          createdate: { gte: start, lte: end },
        });
      } else {
        console.warn("Invalid date format provided:", { startDate, endDate });
      }
    }

    if (status) {
      andFilters.push({ status });
    }

    if (andFilters.length > 0) {
      filters.AND = andFilters;
    }

    const stages = await prisma.hrms_d_hiring_stage.findMany({
      where: filters,
      skip,
      take: size,
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
      include: {
        hiring_stage_hiring_value: {
          select: {
            id: true,
            value: true,
          },
        },
      },
    });

    const totalCount = await prisma.hrms_d_hiring_stage.count({
      where: filters,
    });

    return {
      data: stages,
      currentPage: page,
      size,
      totalPages: Math.ceil(totalCount / size),
      totalCount,
    };
  } catch (error) {
    console.error("Error in getAllHiringStages:");
    console.error("Error message:", error.message);
    console.error("Error code:", error.code);
    console.error("Full error:", error);
    console.error("Parameters:", {
      search,
      page,
      size,
      startDate,
      endDate,
      status,
    });

    throw new CustomError(
      `Error retrieving hiring stages: ${error.message}`,
      503
    );
  }
};

module.exports = {
  createHiringStage,
  getHiringStageById,
  updateHiringStage,
  deleteHiringStage,
  getAllHiringStages,
};

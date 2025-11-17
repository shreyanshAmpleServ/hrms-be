const CustomError = require("../../utils/CustomError");
const { getPrisma } = require("../../config/prismaContext.js");

const createWorkEventType = async (data) => {
  const prisma = getPrisma();
  try {
      const prisma = getPrisma();
    const finalData = await prisma.hrms_m_work_life_event_type.create({
      data: {
        event_type_name: data.event_type_name || "",
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
    console.log("Create work life event type ", error);
    throw new CustomError(
      `Error creating work life event type: ${error.message}`,
      500
    );
  }
};

const findWorkEventTypeById = async (id) => {
  const prisma = getPrisma();
  try {
      const prisma = getPrisma();
    const data = await prisma.hrms_m_work_life_event_type.findUnique({
      where: { id: parseInt(id) },
    });
    if (!data) {
      throw new CustomError("work life event type not found", 404);
    }
    return data;
  } catch (error) {
    console.log("work life event type By Id  ", error);
    throw new CustomError(
      `Error finding work life event type by ID: ${error.message}`,
      503
    );
  }
};

const updateWorkEventType = async (id, data) => {
  const prisma = getPrisma();
  try {
      const prisma = getPrisma();
    const updatedData = await prisma.hrms_m_work_life_event_type.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        updatedate: new Date(),
      },
    });
    return updatedData;
  } catch (error) {
    throw new CustomError(
      `Error updating work life event type: ${error.message}`,
      500
    );
  }
};

const deleteWorkEventType = async (id) => {
  const prisma = getPrisma();
  try {
      const prisma = getPrisma();
    await prisma.hrms_m_work_life_event_type.delete({
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

const getAllWorkEventType = async (
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
    if (search) {
      filters.OR = [
        {
          event_type_name: { contains: search.toLowerCase() },
        },
      ];
    }
    if (typeof is_active === "boolean") {
      filters.is_active = is_active ? "Y" : "N";
    } else if (typeof is_active === "string") {
      if (is_active.toLowerCase() === "true") filters.is_active = "Y";
      else if (is_active.toLowerCase() === "false") filters.is_active = "N";
    }
    const prisma = getPrisma();
    const data = await prisma.hrms_m_work_life_event_type.findMany({
      where: filters,
      skip: skip,
      take: size,
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
    });

    const totalCount = await prisma.hrms_m_work_life_event_type.count({
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
    throw new CustomError("Error retrieving work life event type", 503);
  }
};

module.exports = {
  createWorkEventType,
  findWorkEventTypeById,
  updateWorkEventType,
  deleteWorkEventType,
  getAllWorkEventType,
};

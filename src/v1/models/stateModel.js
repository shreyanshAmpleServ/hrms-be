const { prisma } = require("../../utils/prismaProxy.js");
const CustomError = require("../../utils/CustomError");

const checkDuplicateStates = async (name, country_code, id = null) => {
  if (!name || !country_code) return null;

  const duplicate = await prisma.crms_m_states.findFirst({
    where: {
      name: name,
      country_code: Number(country_code),
      ...(id && { id: { not: parseInt(id) } }),
    },
  });

  return duplicate;
};

const createState = async (data) => {
  try {
    const duplicate = await checkDuplicateStates(data.name, data.country_code);
    if (duplicate) {
      throw new CustomError("State name already exists", 400);
    }
    const state = await prisma.crms_m_states.create({
      data: {
        ...data,
        country_code: Number(data.country_code) || null,
        is_active: data.is_active || "Y",
        createdby: data.createdby || 1,
        log_inst: data.log_inst || 1,
      },
      include: {
        country_details: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });
    return state;
  } catch (error) {
    throw new CustomError(`${error.message}`, 500);
  }
};

const findStateById = async (id) => {
  try {
    const state = await prisma.crms_m_states.findUnique({
      where: { id: parseInt(id) },
      include: {
        country_details: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });
    if (!state) {
      throw new CustomError("State not found", 404);
    }
    return state;
  } catch (error) {
    throw new CustomError(`${error.message}`, 503);
  }
};

const updateState = async (id, data) => {
  try {
    const duplicate = await checkDuplicateStates(
      data.name,
      data.country_code,
      id
    );

    if (duplicate) {
      throw new CustomError("State already exists for this country", 400);
    }

    const updatedState = await prisma.crms_m_states.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        country_code: Number(data.country_code),
        updatedate: new Date(),
      },
      include: {
        country_details: {
          select: { id: true, name: true, code: true },
        },
      },
    });
    return updatedState;
  } catch (error) {
    throw new CustomError(error.message, 500);
  }
};

const deleteState = async (id) => {
  try {
    await prisma.crms_m_states.delete({
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

const getAllStates = async (search, page, size, country_id, is_active) => {
  try {
    page = !page || page == 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size || 0;

    const filters = {};
    if (search) {
      filters.name = { contains: search.toLowerCase() };
    }
    if (country_id) {
      filters.country_code = { equals: country_id };
    }
    if (typeof is_active === "boolean") {
      filters.is_active = is_active ? "Y" : "N";
    } else if (typeof is_active === "string") {
      if (is_active.toLowerCase() === "true") filters.is_active = "Y";
      else if (is_active.toLowerCase() === "false") filters.is_active = "N";
    }
    if (typeof is_active === "boolean") {
      filters.is_active = is_active ? "Y" : "N";
    } else if (typeof is_active === "string") {
      if (is_active.toLowerCase() === "true") filters.is_active = "Y";
      else if (is_active.toLowerCase() === "false") filters.is_active = "N";
    }
    const states = await prisma.crms_m_states.findMany({
      where: filters,
      skip: skip,
      take: size,
      include: {
        country_details: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
      orderBy: [{ name: "asc" }],
    });
    const totalCount = await prisma.crms_m_states.count({
      where: filters,
    });

    return {
      data: states,
      currentPage: page,
      size,
      totalPages: Math.ceil(totalCount / size),
      totalCount: totalCount,
    };
  } catch (error) {
    console.log(error);
    throw new CustomError("Error retrieving states", 503);
  }
};

module.exports = {
  createState,
  findStateById,
  updateState,
  deleteState,
  getAllStates,
};

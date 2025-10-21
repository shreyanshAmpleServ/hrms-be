const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const prisma = new PrismaClient();

const createAssetsType = async (data) => {
  try {
    const finalData = await prisma.hrms_m_asset_type.create({
      data: {
        asset_type_name: data.asset_type_name || "",
        depreciation_rate: data.depreciation_rate || 0,
        createdby: data.createdby || 1,
        log_inst: data.log_inst || 1,
        createdate: new Date(),
        updatedate: new Date(),
        is_active: data.is_active || "Y",

        updatedby: 1,
      },
    });
    return finalData;
  } catch (error) {
    console.log("Create assets type ", error);
    throw new CustomError(`Error creating assets type: ${error.message}`, 500);
  }
};

const findAssetsTypeById = async (id) => {
  try {
    const data = await prisma.hrms_m_asset_type.findUnique({
      where: { id: parseInt(id) },
    });
    if (!data) {
      throw new CustomError("Assets type not found", 404);
    }
    return data;
  } catch (error) {
    console.log("assets type By Id  ", error);
    throw new CustomError(
      `Error finding assets type by ID: ${error.message}`,
      503
    );
  }
};

const updateAssetsType = async (id, data) => {
  try {
    const updatedData = await prisma.hrms_m_asset_type.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        updatedate: new Date(),
      },
    });
    return updatedData;
  } catch (error) {
    throw new CustomError(`Error updating assets type: ${error.message}`, 500);
  }
};

const deleteAssetsType = async (id) => {
  try {
    await prisma.hrms_m_asset_type.delete({
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

const getAllAssetsType = async (
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
          asset_type_name: { contains: search.toLowerCase() },
        },
      ];
    }
    if (typeof is_active === "boolean") {
      filters.is_active = is_active ? "Y" : "N";
    } else if (typeof is_active === "string") {
      if (is_active.toLowerCase() === "true") filters.is_active = "Y";
      else if (is_active.toLowerCase() === "false") filters.is_active = "N";
    }

    const data = await prisma.hrms_m_asset_type.findMany({
      where: filters,
      skip: skip,
      take: size,

      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
    });

    const totalCount = await prisma.hrms_m_asset_type.count({
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
    throw new CustomError("Error retrieving assets type", 503);
  }
};

module.exports = {
  createAssetsType,
  findAssetsTypeById,
  updateAssetsType,
  deleteAssetsType,
  getAllAssetsType,
};

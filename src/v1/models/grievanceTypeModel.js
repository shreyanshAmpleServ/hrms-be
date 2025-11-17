const { prisma } = require("../../utils/prismaProxy.js");
const CustomError = require("../../utils/CustomError");

const createGrievanceType = async (data) => {
  try {
    const finalData = await prisma.hrms_m_grievance_type.create({
      data: {
        grievance_type_name: data.grievance_type_name || "",
        createdby: data.createdby || 1,
        log_inst: data.log_inst || 1,
        createdate: new Date(),
        updatedate: new Date(),
        updatedby: 1,
      },
    });
    return finalData;
  } catch (error) {
    console.log("Create grievance type ", error);
    throw new CustomError(
      `Error creating grievance type: ${error.message}`,
      500
    );
  }
};

const findGrievanceTypeById = async (id) => {
  try {
    const data = await prisma.hrms_m_grievance_type.findUnique({
      where: { id: parseInt(id) },
    });
    if (!data) {
      throw new CustomError("grievance type not found", 404);
    }
    return data;
  } catch (error) {
    console.log("grievance type By Id  ", error);
    throw new CustomError(
      `Error finding grievance type by ID: ${error.message}`,
      503
    );
  }
};

const updateGrievanceType = async (id, data) => {
  try {
    const updatedData = await prisma.hrms_m_grievance_type.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        updatedate: new Date(),
      },
    });
    return updatedData;
  } catch (error) {
    throw new CustomError(
      `Error updating grievance type: ${error.message}`,
      500
    );
  }
};

const deleteGrievanceType = async (id) => {
  try {
    await prisma.hrms_m_grievance_type.delete({
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

// Get all grievance type
const getAllGrievanceType = async (page, size, search) => {
  try {
    page = page || page == 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size || 0;

    const filters = {};
    if (search) {
      filters.OR = [
        {
          grievance_type_name: { contains: search.toLowerCase() },
        },
      ];
    }

    const data = await prisma.hrms_m_grievance_type.findMany({
      where: filters,
      skip: skip,
      take: size,
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
    });

    const totalCount = await prisma.hrms_m_grievance_type.count({
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
    throw new CustomError("Error retrieving grievance type", 503);
  }
};

module.exports = {
  createGrievanceType,
  findGrievanceTypeById,
  updateGrievanceType,
  deleteGrievanceType,
  getAllGrievanceType,
};

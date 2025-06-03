const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const prisma = new PrismaClient();

// Serialize education data
const serializeEducationData = (data) => ({
  employee_id: Number(data.employee_id) || null,
  institute_name: data.institute_name || "",
  degree: data.degree || "",
  specialization: data.specialization || "",
  start_from: data.start_from ? new Date(data.start_from) : null,
  end_to: data.end_to ? new Date(data.end_to) : null,
});

// Create a new education record
const createEmployeeEducation = async (data) => {
  try {
    const reqData = await prisma.hrms_employee_d_educations.create({
      data: {
        ...serializeEducationData(data),
        createdby: data.createdby || 1,
        createdate: new Date(),
        log_inst: data.log_inst || 1,
      },
    });
    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error creating education record: ${error.message}`,
      500
    );
  }
};

// Find education by ID
const findEmployeeEducationById = async (id) => {
  try {
    const reqData = await prisma.hrms_employee_d_educations.findUnique({
      where: { id: parseInt(id) },
    });
    if (!reqData) {
      throw new CustomError("Education record not found", 404);
    }
    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error finding education record by ID: ${error.message}`,
      503
    );
  }
};

// Update education record
const updateEmployeeEducation = async (id, data) => {
  try {
    const updatedEducation = await prisma.hrms_employee_d_educations.update({
      where: { id: parseInt(id) },
      data: {
        ...serializeEducationData(data),
        updatedby: data.updatedby || 1,
        updatedate: new Date(),
      },
    });
    return updatedEducation;
  } catch (error) {
    throw new CustomError(
      `Error updating education record: ${error.message}`,
      500
    );
  }
};

// Delete education record
const deleteEmployeeEducation = async (id) => {
  try {
    await prisma.hrms_employee_d_educations.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    throw new CustomError(
      `Error deleting education record: ${error.message}`,
      500
    );
  }
};

// Get all education records with pagination and search
const getAllEmployeeEducation = async (
  search,
  page,
  size,
  startDate,
  endDate
) => {
  try {
    page = !page || page == 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size || 0;

    const filters = {};
    if (search) {
      filters.OR = [
        { institute_name: { contains: search.toLowerCase() } },
        { degree: { contains: search.toLowerCase() } },
        { specialization: { contains: search, mode: "insensitive" } },
      ];
    }
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        filters.createdate = { gte: start, lte: end };
      }
    }

    const datas = await prisma.hrms_employee_d_educations.findMany({
      where: filters,
      skip,
      take: size,
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
    });
    const totalCount = await prisma.hrms_employee_d_educations.count({
      where: filters,
    });

    return {
      data: datas.map((item) => ({ ...item })),
      currentPage: page,
      size,
      totalPages: Math.ceil(totalCount / size),
      totalCount,
    };
  } catch (error) {
    throw new CustomError("Error retrieving education records", 503);
  }
};

module.exports = {
  createEmployeeEducation,
  findEmployeeEducationById,
  updateEmployeeEducation,
  deleteEmployeeEducation,
  getAllEmployeeEducation,
};

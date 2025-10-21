const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const prisma = new PrismaClient();

const createSalaryStructure = async (data) => {
  try {
    const salaryStructure = await prisma.hrms_m_salary_structure.create({
      data: {
        structure_name: data.structure_name,
        createdby: data.createdby || 1,
        is_active: data.is_active || "Y",
        log_inst: data.log_inst || 1,
        createdate: new Date(),
        updatedate: new Date(),
        updatedby: 1,
      },
    });
    return salaryStructure;
  } catch (error) {
    console.log("Create salary structure ", error);
    throw new CustomError(
      `Error creating salary structure: ${error.message}`,
      500
    );
  }
};

const findSalaryStructureById = async (id) => {
  try {
    const salaryStructure = await prisma.hrms_m_salary_structure.findUnique({
      where: { id: parseInt(id) },
    });
    if (!salaryStructure) {
      throw new CustomError("salary structure not found", 404);
    }
    return salaryStructure;
  } catch (error) {
    console.log("salary structure By Id  ", error);
    throw new CustomError(
      `Error finding salary structure by ID: ${error.message}`,
      503
    );
  }
};

const updateSalaryStructure = async (id, data) => {
  try {
    const updatedSalaryStructure = await prisma.hrms_m_salary_structure.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        updatedate: new Date(),
      },
    });
    return updatedSalaryStructure;
  } catch (error) {
    throw new CustomError(
      `Error updating salary structure: ${error.message}`,
      500
    );
  }
};

const deleteSalaryStructure = async (id) => {
  try {
    await prisma.hrms_m_salary_structure.delete({
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

// Get all salary structure
const getAllSalaryStructure = async (
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
          structure_name: { contains: search.toLowerCase() },
        },
      ];
    }

    if (typeof is_active === "boolean") {
      filters.is_active = is_active ? "Y" : "N";
    } else if (typeof is_active === "string") {
      if (is_active.toLowerCase() === "true") filters.is_active = "Y";
      else if (is_active.toLowerCase() === "false") filters.is_active = "N";
    }

    const salary = await prisma.hrms_m_salary_structure.findMany({
      where: filters,
      skip: skip,
      take: size,

      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
    });

    const totalCount = await prisma.hrms_m_salary_structure.count({
      where: filters,
    });
    return {
      data: salary,
      currentPage: page,
      size,
      totalPages: Math.ceil(totalCount / size),
      totalCount: totalCount,
    };
  } catch (error) {
    console.log(error);
    throw new CustomError("Error retrieving salary structure", 503);
  }
};

module.exports = {
  createSalaryStructure,
  findSalaryStructureById,
  updateSalaryStructure,
  deleteSalaryStructure,
  getAllSalaryStructure,
};

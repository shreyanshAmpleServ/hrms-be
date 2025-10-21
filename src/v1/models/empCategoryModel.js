const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const prisma = new PrismaClient();

const createEmpCategory = async (data) => {
  try {
    const empCategory = await prisma.hrms_m_employee_category.create({
      data: {
        category_name: data.category_name,
        createdby: data.createdby || 1,
        log_inst: data.log_inst || 1,
        is_active: data.is_active || "Y",
        createdate: new Date(),
        updatedate: new Date(),
        updatedby: 1,
      },
    });
    return empCategory;
  } catch (error) {
    console.log("Create employee category ", error);
    throw new CustomError(
      `Error creating employee category: ${error.message}`,
      500
    );
  }
};

const findEmpCategoryById = async (id) => {
  try {
    const empCategory = await prisma.hrms_m_employee_category.findUnique({
      where: { id: parseInt(id) },
    });
    if (!empCategory) {
      throw new CustomError("employee category not found", 404);
    }
    return empCategory;
  } catch (error) {
    console.log("employee category By Id  ", error);
    throw new CustomError(
      `Error finding employee category by ID: ${error.message}`,
      503
    );
  }
};

const updateEmpCategory = async (id, data) => {
  try {
    const updatedEmpCategory = await prisma.hrms_m_employee_category.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        updatedate: new Date(),
      },
    });
    return updatedEmpCategory;
  } catch (error) {
    throw new CustomError(
      `Error updating employee category: ${error.message}`,
      500
    );
  }
};

const deleteEmpCategory = async (id) => {
  try {
    await prisma.hrms_m_employee_category.delete({
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

// Get all employee category
const getAllEmpCategory = async (
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

    let filters = {};

    if (search) {
      filters.OR = [
        {
          category_name: { contains: search.toLowerCase() },
        },
      ];
    }

    if (typeof is_active === "boolean") {
      filters.is_active = is_active ? "Y" : "N";
    } else if (typeof is_active === "string") {
      if (is_active.toLowerCase() === "true") filters.is_active = "Y";
      else if (is_active.toLowerCase() === "false") filters.is_active = "N";
    }

    const empCategories = await prisma.hrms_m_employee_category.findMany({
      where: filters,
      skip: skip,
      take: size,
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
    });

    const totalCount = await prisma.hrms_m_employee_category.count({
      where: filters,
    });
    return {
      data: empCategories,
      currentPage: page,
      size,
      totalPages: Math.ceil(totalCount / size),
      totalCount: totalCount,
    };
  } catch (error) {
    throw new CustomError("Error retrieving empCategories", 503);
  }
};

module.exports = {
  createEmpCategory,
  findEmpCategoryById,
  updateEmpCategory,
  deleteEmpCategory,
  getAllEmpCategory,
};

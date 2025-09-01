const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const prisma = new PrismaClient();

const createGoalCategory = async (data) => {
  try {
    const finalData = await prisma.hrms_m_goal_category.create({
      data: {
        category_name: data.category_name,
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
    console.log("Create goal category ", error);
    throw new CustomError(
      `Error creating goal category: ${error.message}`,
      500
    );
  }
};

const findGoalCategoryById = async (id) => {
  try {
    const data = await prisma.hrms_m_goal_category.findUnique({
      where: { id: parseInt(id) },
    });
    if (!data) {
      throw new CustomError("Goal category not found", 404);
    }
    return data;
  } catch (error) {
    console.log("Goal category By Id  ", error);
    throw new CustomError(
      `Error finding goal category by ID: ${error.message}`,
      503
    );
  }
};

const updateGoalCategory = async (id, data) => {
  try {
    const updatedData = await prisma.hrms_m_goal_category.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        updatedate: new Date(),
      },
    });
    return updatedData;
  } catch (error) {
    throw new CustomError(
      `Error updating goal category: ${error.message}`,
      500
    );
  }
};

const deleteGoalCategory = async (id) => {
  try {
    await prisma.hrms_m_goal_category.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    if (error.code === "P2003") {
      throw new CustomError(
        "This record cannot be deleted because it has associated data other records. Please remove the dependent data first.",
        400
      );
    } else {
      throw new CustomError(error.meta.constraint, 500);
    }
  }
};

// Get all goal category
const getAllGoalCategory = async (
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

    const data = await prisma.hrms_m_goal_category.findMany({
      where: filters,
      skip: skip,
      take: size,

      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
    });

    const totalCount = await prisma.hrms_m_goal_category.count({
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
    throw new CustomError("Error retrieving goal category", 503);
  }
};

module.exports = {
  createGoalCategory,
  findGoalCategoryById,
  updateGoalCategory,
  deleteGoalCategory,
  getAllGoalCategory,
};

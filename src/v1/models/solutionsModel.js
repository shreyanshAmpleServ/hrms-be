const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const prisma = new PrismaClient();

// Create a new solution
const createSolutions = async (data) => {
  try {
    // Create the solution
    const solutions = await prisma.crms_d_solution.create({
      data: {
        ...data,
        createdate: new Date(),
        updatedate: new Date(),
        createdby: data.createdby || 1,
        updatedby: data.createdby || 1,
      },
      include: {
        solution_user_owner: {
          select: {
            id: true,
            full_name: true,
            email: true,
            phone: true,
          },
        },
        solution_product: true,
      },
    });

    // Return the case with references
    return solutions;
  } catch (error) {
    console.log(error);
    throw new CustomError(`Error creating solutions: ${error.message}`, 500);
  }
};

// Update a Solution
const updateSolutions = async (id, data) => {
  try {
    const updatedSolution = await prisma.crms_d_solution.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        // product_id: Number(data?.product_id) || null,
        // case_reason: Number(data?.case_reason) || null,
        // contact_id: Number(data?.contact_id) || null,
        // deal_id: Number(data?.deal_id) || null,
        // case_owner: Number(data?.case_owner) || null,
        // account_id: Number(data?.account_id) || null,
        // reported_by: Number(data?.reported_by) || null,
        // is_active: data.is_active || "Y",
        // log_inst: data.log_inst || 1,
        updatedby: data.updatedby || 1,
        updatedate: new Date(),
      },
      include: {
        solution_user_owner: {
          select: {
            id: true,
            full_name: true,
            email: true,
            phone: true,
          },
        },
        solution_product: true,
      },
    });

    // Return the updated case
    return updatedSolution;
  } catch (error) {
    console.log(error);
    throw new CustomError(`Error updating solution: ${error.message}`, 500);
  }
};

// Find a case by ID
const findSolutionById = async (id) => {
  try {
    const solutionData = await prisma.crms_d_solution.findUnique({
      where: { id: parseInt(id) },
      include: {
        solution_user_owner: {
          select: {
            id: true,
            full_name: true,
            email: true,
            phone: true,
          },
        },
        solution_product: true,
      },
    });
    return await solutionData;
  } catch (error) {
    throw new CustomError(
      `Error finding solution by ID: ${error.message}`,
      503
    );
  }
};

// Delete a solution
const deleteSolution = async (id) => {
  try {
    await prisma.crms_d_solution.delete({
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

// Get all solutions
const getAllSolution = async (search, page, size, startDate, endDate) => {
  try {
    page = page || 1;
    size = size || 10;

    const filters = {};

    // Handle search
    if (search) {
      filters.OR = [
        {
          solution_product: {
            name: { contains: search.toLowerCase() },
          },
        },
        {
          solution_user_owner: {
            full_name: { contains: search.toLowerCase() },
          },
        },

        {
          title: { contains: search.toLowerCase() },
        },
      ];
    }

    // Handle date filtering
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        filters.createdate = {
          gte: start,
          lte: end,
        };
      }
    }

    const solutions = await prisma.crms_d_solution.findMany({
      where: filters,
      include: {
        solution_user_owner: {
          select: {
            id: true,
            full_name: true,
            email: true,
            phone: true,
          },
        },
        solution_product: true,
      },
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
    });

    const totalCount = await prisma.crms_d_solution.count();

    return {
      data: solutions,
      currentPage: page,
      size,
      totalPages: Math.ceil(totalCount / size),
      totalCount: totalCount,
    };
  } catch (error) {
    console.log(error);
    throw new CustomError("Error retrieving solutions", 503);
  }
};

module.exports = {
  createSolutions,
  findSolutionById,
  updateSolutions,
  deleteSolution,
  getAllSolution,
};

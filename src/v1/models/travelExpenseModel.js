const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const prisma = new PrismaClient();

// Serialize travel expense data
const serializeTravelExpense = (data) => ({
  employee_id: data.employee_id ? Number(data.employee_id) : null,
  travel_purpose: data.travel_purpose || "",
  start_date: data.start_date ? new Date(data.start_date) : null,
  end_date: data.end_date ? new Date(data.end_date) : null,
  destination: data.destination || "",
  total_amount: data.total_amount ? Number(data.total_amount) : null,
  approved_by: data.approved_by ? Number(data.approved_by) : null,
  approval_status: data.approval_status || "",
  approved_by: data.approved_by ? Number(data.approved_by) : null,
});

// Create a new travel expense
const createTravelExpense = async (data) => {
  try {
    const reqData = await prisma.hrms_d_travel_expense.create({
      data: {
        ...serializeTravelExpense(data),
        createdby: Number(data.createdby) || 1,
        createdate: new Date(),
        log_inst: data.log_inst || 1,
      },
      include: {
        travel_expense_employee: { select: { id: true, full_name: true } },
        travel_expense_createdby: { select: { id: true, full_name: true } },
        travel_expense_approver: { select: { id: true, full_name: true } }, // ← new
      },
    });
    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error creating travel expense: ${error.message}`,
      500
    );
  }
};

// Find a travel expense by ID
const findTravelExpenseById = async (id) => {
  try {
    const reqData = await prisma.hrms_d_travel_expense.findUnique({
      where: { id: parseInt(id) },
      include: {
        travel_expense_employee: { select: { id: true, full_name: true } },
        travel_expense_createdby: { select: { id: true, full_name: true } },
        travel_expense_approver: { select: { id: true, full_name: true } }, // ← new
      },
    });

    if (!reqData) {
      throw new CustomError("Travel expense not found", 404);
    }

    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error finding travel expense by ID: ${error.message}`,
      503
    );
  }
};

// Update a travel expense
const updateTravelExpense = async (id, data) => {
  try {
    const updatedExpense = await prisma.hrms_d_travel_expense.update({
      where: { id: parseInt(id) },
      include: {
        travel_expense_employee: { select: { id: true, full_name: true } },
        travel_expense_createdby: { select: { id: true, full_name: true } },
        travel_expense_approver: { select: { id: true, full_name: true } },
      },
      data: {
        ...serializeTravelExpense(data),
        updatedby: data.updatedby || 1,
        updatedate: new Date(),
      },
    });
    return updatedExpense;
  } catch (error) {
    throw new CustomError(
      `Error updating travel expense: ${error.message}`,
      500
    );
  }
};

// Delete a travel expense
const deleteTravelExpense = async (id) => {
  try {
    await prisma.hrms_d_travel_expense.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    throw new CustomError(
      `Error deleting travel expense: ${error.message}`,
      500
    );
  }
};

// Get all travel expenses
const getAllTravelExpense = async (search, page, size, startDate, endDate) => {
  try {
    page = !page || page == 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size || 0;

    const filterConditions = [];

    if (search) {
      filterConditions.push({
        OR: [
          { travel_expense_employee: { full_name: { contains: search } } },
          { travel_expense_createdby: { full_name: { contains: search } } },
          { travel_purpose: { contains: search.toLowerCase() } },
          { destination: { contains: search.toLowerCase() } },
          { approval_status: { contains: search.toLowerCase() } },
        ],
      });
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        filterConditions.push({
          createdate: {
            gte: start,
            lte: end,
          },
        });
      }
    }

    const filters =
      filterConditions.length > 0 ? { AND: filterConditions } : {};

    const datas = await prisma.hrms_d_travel_expense.findMany({
      where: filters,
      skip,
      take: size,
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
      include: {
        travel_expense_employee: { select: { id: true, full_name: true } },
        travel_expense_createdby: { select: { id: true, full_name: true } },
        travel_expense_approver: { select: { id: true, full_name: true } },
      },
    });

    const totalCount = await prisma.hrms_d_travel_expense.count({
      where: filters,
    });
    console.log("getAllTravelExpense called with:", datas);

    return {
      data: datas,
      currentPage: page,
      size,
      totalPages: Math.ceil(totalCount / size),
      totalCount,
    };
  } catch (error) {
    throw new CustomError("Error retrieving travel expenses", 400);
  }
};

module.exports = {
  createTravelExpense,
  findTravelExpenseById,
  updateTravelExpense,
  deleteTravelExpense,
  getAllTravelExpense,
};

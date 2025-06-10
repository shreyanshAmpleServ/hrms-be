const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const { toLowerCase } = require("zod/v4");
const prisma = new PrismaClient();

// Serialize travel expense data
const serializeTravelExpenseData = (data) => ({
  employee_id: data.employee_id ? Number(data.employee_id) : null,
  travel_purpose: data.travel_purpose || "",
  start_date: data.start_date ? new Date(data.start_date) : null,
  end_date: data.end_date ? new Date(data.end_date) : null,
  destination: data.destination || "",
  total_amount: data.total_amount ? Number(data.total_amount) : null,
  approved_by: data.approved_by ? Number(data.approved_by) : null,
  approval_status: data.approval_status || "",
  travel_mode: data.travel_mode || "",
  advance_amount: data.advance_amount ? Number(data.advance_amount) : null,
  expense_breakdown: data.expense_breakdown || "",
  attachment_path: data.attachment_path || "",
  currency: data.currency || "",
  exchange_rate: data.exchange_rate ? Number(data.exchange_rate) : null,
  final_approved_amount: data.final_approved_amount
    ? Number(data.final_approved_amount)
    : 0,
  remarks: data.remarks || "",
});

// Create a new travel expense
const createTravelExpense = async (data) => {
  try {
    const reqData = await prisma.hrms_d_travel_expense.create({
      data: {
        ...serializeTravelExpenseData(data),
        createdby: data.createdby ? Number(data.createdby) : 1,
        createdate: new Date(),
        log_inst: data.log_inst || 1,
      },
      include: {
        travel_expense_approver: {
          select: { id: true, employee_code: true, full_name: true },
        },
        travel_expense_createdby: {
          select: { id: true, employee_code: true, full_name: true },
        },
        travel_expense_employee: {
          select: { id: true, employee_code: true, full_name: true },
        },
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

// Find travel expense by ID
const findTravelExpenseById = async (id) => {
  try {
    const reqData = await prisma.hrms_d_travel_expense.findUnique({
      where: { id: parseInt(id) },
      include: {
        travel_expense_approver: {
          select: { id: true, employee_code: true, full_name: true },
        },
        travel_expense_createdby: {
          select: { id: true, employee_code: true, full_name: true },
        },
        travel_expense_employee: {
          select: { id: true, employee_code: true, full_name: true },
        },
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

// Update travel expense
const updateTravelExpense = async (id, data) => {
  try {
    const updatedEntry = await prisma.hrms_d_travel_expense.update({
      where: { id: parseInt(id) },
      include: {
        travel_expense_approver: {
          select: { id: true, employee_code: true, full_name: true },
        },
        travel_expense_createdby: {
          select: { id: true, employee_code: true, full_name: true },
        },
        travel_expense_employee: {
          select: { id: true, employee_code: true, full_name: true },
        },
      },
      data: {
        ...serializeTravelExpenseData(data),
        updatedby: data.updatedby ? Number(data.updatedby) : 1,
        updatedate: new Date(),
      },
      include: {
        travel_expense_approver: {
          select: { id: true, employee_code: true, full_name: true },
        },
        travel_expense_createdby: {
          select: { id: true, employee_code: true, full_name: true },
        },
        travel_expense_employee: {
          select: { id: true, employee_code: true, full_name: true },
        },
      },
    });
    return updatedEntry;
  } catch (error) {
    throw new CustomError(
      `Error updating travel expense: ${error.message}`,
      500
    );
  }
};

// Delete travel expense
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

// Get all travel expenses with pagination and search
const getAllTravelExpense = async (search, page, size, startDate, endDate) => {
  try {
    page = !page || page == 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size || 0;

    const filters = {};
    if (search) {
      filters.OR = [
        {
          travel_expense_approver: {
            full_name: { contains: search.toLowerCase() },
          },
        },
        {
          travel_expense_createdby: {
            full_name: { contains: search.toLowerCase() },
          },
        },
        {
          travel_expense_employee: {
            full_name: { contains: search.toLowerCase() },
          },
        },
        { travel_purpose: { contains: search.toLowerCase() } },
        { destination: { contains: search.toLowerCase() } },
        { approval_status: { contains: search.toLowerCase() } },
        { remarks: { contains: search } },
      ];
    }
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        filters.start_date = { gte: start, lte: end };
      }
    }

    const datas = await prisma.hrms_d_travel_expense.findMany({
      where: filters,
      skip,
      take: size,
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
    });
    const totalCount = await prisma.hrms_d_travel_expense.count({
      where: filters,
    });

    return {
      data: datas,
      currentPage: page,
      size,
      totalPages: Math.ceil(totalCount / size),
      totalCount,
    };
  } catch (error) {
    throw new CustomError("Error retrieving travel expenses", 503);
  }
};

module.exports = {
  createTravelExpense,
  findTravelExpenseById,
  updateTravelExpense,
  deleteTravelExpense,
  getAllTravelExpense,
};

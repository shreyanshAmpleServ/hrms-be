const { prisma, ensureTenantContext } = require("../../utils/prismaProxy.js");
const CustomError = require("../../utils/CustomError");

// Serialize travel expense data
const serializeTravelExpenseData = (data) => ({
  employee_id: data.employee_id ? Number(data.employee_id) : null,
  travel_purpose: data.travel_purpose || "",
  start_date: data.start_date ? new Date(data.start_date) : null,
  end_date: data.end_date ? new Date(data.end_date) : null,
  destination: data.destination || "",
  total_amount: data.total_amount ? Number(data.total_amount) : null,
  travel_mode: data.travel_mode || "",
  advance_amount: data.advance_amount ? Number(data.advance_amount) : null,
  expense_breakdown: data.expense_breakdown || "",
  attachment_path: data.attachment_path || "",
  currency: data.currency ? Number(data.currency) : 1,
  exchange_rate: data.exchange_rate ? Number(data.exchange_rate) : null,
  final_approved_amount: data.final_approved_amount
    ? Number(data.final_approved_amount)
    : 0,
  remarks: data.remarks || "",
});

// Create a new travel expense
const createTravelExpense = async (data) => {
  console.log(data);
  try {
    // Ensure tenant context is available, using tenantDb from data if provided
    const tenantDb = data.tenantDb;
    const createOperation = async () => {
      return await prisma.hrms_d_travel_expense.create({
        data: {
          ...serializeTravelExpenseData(data),
          createdby: data.createdby || 1,
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
          travel_expense_currency: {
            select: {
              id: true,
              currency_code: true,
              currency_name: true,
            },
          },
        },
      });
    };

    const reqData = tenantDb
      ? await ensureTenantContext(tenantDb, createOperation)
      : await createOperation();

    return reqData;
  } catch (error) {
    console.log(error);
    throw new CustomError(
      `Error creating travel expense: ${error.message}`,
      500
    );
  }
};

// Find travel expense by ID
const findTravelExpenseById = async (id, tenantDb = null) => {
  try {
    const findOperation = async () => {
      return await prisma.hrms_d_travel_expense.findUnique({
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
          travel_expense_currency: {
            select: { id: true, currency_code: true, currency_name: true },
          },
        },
      });
    };

    const reqData = tenantDb
      ? await ensureTenantContext(tenantDb, findOperation)
      : await findOperation();

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
    // Ensure tenant context is available, using tenantDb from data if provided
    const tenantDb = data.tenantDb;
    const updateOperation = async () => {
      return await prisma.hrms_d_travel_expense.update({
        where: { id: parseInt(id) },
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
          travel_expense_currency: {
            select: { id: true, currency_code: true, currency_name: true },
          },
        },
      });
    };

    const updatedEntry = tenantDb
      ? await ensureTenantContext(tenantDb, updateOperation)
      : await updateOperation();

    return updatedEntry;
  } catch (error) {
    throw new CustomError(
      `Error updating travel expense: ${error.message}`,
      500
    );
  }
};

// Delete travel expense
const deleteTravelExpense = async (id, tenantDb = null) => {
  try {
    const deleteOperation = async () => {
      return await prisma.hrms_d_travel_expense.delete({
        where: { id: parseInt(id) },
      });
    };

    await (tenantDb
      ? ensureTenantContext(tenantDb, deleteOperation)
      : deleteOperation());
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

// Get all travel expenses with pagination and search
const getAllTravelExpense = async (
  search,
  page,
  size,
  startDate,
  endDate,
  tenantDb = null
) => {
  try {
    page = !page || page == 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size || 0;

    const filters = {};
    if (search) {
      filters.OR = [
        //test
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

    const getAllOperation = async () => {
      const datas = await prisma.hrms_d_travel_expense.findMany({
        where: filters,
        skip,
        take: size,
        orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
        include: {
          travel_expense_currency: {
            select: { id: true, currency_code: true, currency_name: true },
          },
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
    };

    return await (tenantDb
      ? ensureTenantContext(tenantDb, getAllOperation)
      : getAllOperation());
  } catch (error) {
    console.log(error);
    throw new CustomError("Error retrieving travel expenses", 503);
  }
};

const updateTravelExpenseStatus = async (id, data) => {
  try {
    // Ensure tenant context is available, using tenantDb from data if provided
    const tenantDb = data.tenantDb;
    const travelExpenseId = parseInt(id);
    if (isNaN(travelExpenseId)) {
      throw new CustomError("Invalid travel expense ID", 400);
    }

    const updateStatusOperation = async () => {
      const existingTravelExpense =
        await prisma.hrms_d_travel_expense.findUnique({
          where: { id: travelExpenseId },
        });

      if (!existingTravelExpense) {
        throw new CustomError(
          `Travel Expense with ID ${travelExpenseId} not found`,
          404
        );
      }

      // Build update data aligned to your schema
      const updateData = {
        approval_status: data.status,
        updatedby: Number(data.updatedby) || 1,
        updatedate: new Date(),
      };

      // if (data.status === "Approved" || data.status === "Rejected") {
      //   updateData.approved_by = Number(data.approver_id) || null;
      //   updateData.remarks =
      //     data.status === "Rejected" ? data.rejection_reason || "" : "";
      // } else {
      //   updateData.approved_by = null;
      //   updateData.remarks = "";
      // }

      if (data.status === "Approved") {
        updateData.approved_by = Number(data.approved_by) || null;
        updateData.remarks = "";
      } else if (data.status === "Rejected") {
        updateData.approved_by = Number(data.approved_by) || null;
        updateData.remarks = data.rejection_reason || "";
      } else {
        updateData.approved_by = null;
        updateData.remarks = "";
      }

      return await prisma.hrms_d_travel_expense.update({
        where: { id: travelExpenseId },
        data: updateData,
        include: {
          travel_expense_approver: {
            select: {
              id: true,
              employee_code: true,
              full_name: true,
            },
          },
          travel_expense_createdby: {
            select: {
              id: true,
              employee_code: true,
              full_name: true,
            },
          },
          travel_expense_employee: {
            select: {
              id: true,
              employee_code: true,
              full_name: true,
            },
          },
          travel_expense_currency: {
            select: { id: true, currency_code: true, currency_name: true },
          },
        },
      });
    };

    return await (tenantDb
      ? ensureTenantContext(tenantDb, updateStatusOperation)
      : updateStatusOperation());
  } catch (error) {
    throw new CustomError(
      `Error updating travel expense: ${error.message}`,
      500
    );
  }
};

module.exports = {
  createTravelExpense,
  findTravelExpenseById,
  updateTravelExpense,
  deleteTravelExpense,
  getAllTravelExpense,
  updateTravelExpenseStatus,
};

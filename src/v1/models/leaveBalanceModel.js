/**
 * @fileoverview Optimized Leave balance model for CRUD operations.
 * @module leaveBalanceModel
 */

const { prisma } = require("../../utils/prismaProxy.js");
const CustomError = require("../../utils/CustomError");

/**
 * Normalizes leave balance detail entries by ensuring default values.
 * @param {Array<Object>} details - The leave balance details.
 * @param {number} parentId - The parent leave balance ID.
 * @returns {Array<Object>} Normalized leave balance detail entries.
 */
const normalizeDetails = (details, parentId) =>
  details.map((item) => ({
    ...item,
    parent_id: parentId,
    carried_forward: item.carried_forward || 0,
    encashed: item.encashed || 0,
    expired: item.expired || 0,
    unit: item.unit || "",
    closed: item.closed || "",
    leave_type_name: item.leave_type_name || "",
  }));

/**
 * Prepares base payload for leave balance creation or update.
 * @param {Object} data - The leave balance input data.
 * @returns {Object} The structured payload.
 */
const basePayload = (data) => ({
  employee_id: data.employee_id,
  employee_code: data.employee_code,
  first_name: data.first_name,
  last_name: data.last_name,
  status: data.status,
  start_date: data.start_date,
  end_date: data.end_date,
  is_active: data.is_active || "Y",

  createdby: Number(data.createdby) || 1,
  createdate: new Date(),
  log_inst: data.log_inst || 1,
});

/**
 * Creates a new leave balance record.
 * @param {Object} data - The leave balance data.
 * @returns {Promise<Object>} The created leave balance record.
 */
const createLeaveBalance = async (data) => {
  const isExist = await prisma.hrms_d_leave_balance.findFirst({
    where: {
      employee_id: Number(data.employee_id),
      AND: [
        {
          start_date: {
            lte: new Date(data.end_date),
          },
        },
        {
          end_date: {
            gte: new Date(data.start_date),
          },
        },
      ],
    },
  });

  if (isExist) {
    throw new CustomError(
      "Leave balance already exists for this employee within the selected date range.",
      400,
    );
  }

  try {
    const reqData = await prisma.hrms_d_leave_balance.create({
      data: basePayload(data),
      include: {
        leave_balance_employee: {
          select: { id: true, full_name: true },
        },
      },
    });

    const details = normalizeDetails(data?.leave_balances || [], reqData.id);

    await prisma.hrms_d_leave_balance_details.createMany({ data: details });

    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error creating leave balance: ${error.message}`,
      500,
    );
  }
};

/**
 * Updates an existing leave balance record.
 * @param {number|string} id - The ID of the leave balance to update.
 * @param {Object} data - The updated data.
 * @returns {Promise<Object>} The updated leave balance record.
 */
const updateLeaveBalance = async (id, data) => {
  try {
    const updated = await prisma.hrms_d_leave_balance.update({
      where: { id: Number(id) },
      data: basePayload(data),
      include: {
        leave_balance_employee: {
          select: { id: true, full_name: true },
        },
      },
    });

    await prisma.hrms_d_leave_balance_details.deleteMany({
      where: { parent_id: Number(id) },
    });

    const details = normalizeDetails(data?.leave_balances || [], Number(id));

    await prisma.hrms_d_leave_balance_details.createMany({ data: details });

    return updated;
  } catch (error) {
    throw new CustomError(
      `Error updating leave balance: ${error.message}`,
      500,
    );
  }
};

/**
 * Finds a leave balance record by ID.
 * @param {number|string} id - The leave balance ID.
 * @returns {Promise<Object>} The leave balance record and its details.
 */
const findLeaveBalanceById = async (id) => {
  try {
    const leaveBalance = await prisma.hrms_d_leave_balance.findUnique({
      where: { id: Number(id) },
    });
    const details = await prisma.hrms_d_leave_balance_details.findMany({
      where: { parent_id: Number(id) },
      include: {
        leave_balance_details_LeaveType: {
          select: { id: true, leave_type: true },
        },
      },
    });

    if (!leaveBalance) throw new CustomError("Leave balance not found", 404);

    return { ...leaveBalance, leaveBalances: details };
  } catch (error) {
    throw new CustomError(
      `Error finding leave balance by ID: ${error.message}`,
      503,
    );
  }
};

/**
 * Finds a leave balance record by ID.
 * @param {number|string} id - The leave balance ID.
 * @returns {Promise<Object>} The leave balance record and its details.
 */
const findLeaveBalanceByEmployeeId = async (employeeId) => {
  try {
    const leaveBalance = await prisma.hrms_d_leave_balance.findFirst({
      where: { employee_id: Number(employeeId) },
    });

    if (!leaveBalance)
      throw new CustomError("Leave balance not assigned to this employee", 404);

    const details = await prisma.hrms_d_leave_balance_details.findMany({
      where: { parent_id: Number(leaveBalance?.id) },
      include: {
        leave_balance_details_LeaveType: {
          select: { id: true, leave_type: true },
        },
      },
    });

    return { ...leaveBalance, leaveBalances: details };
  } catch (error) {
    throw new CustomError(
      `Error finding leave balance by ID: ${error.message}`,
      503,
    );
  }
};

/**
 * Deletes a leave balance record by ID.
 * @param {number|string} id - The leave balance ID.
 * @returns {Promise<void>}
 */
const deleteLeaveBalance = async (id) => {
  try {
    await prisma.hrms_d_leave_balance.delete({ where: { id: Number(id) } });
  } catch (error) {
    if (error.code === "P2003") {
      throw new CustomError(
        "This record is connected to other data. Please remove that first.",
        400,
      );
    } else {
      throw new CustomError(error.meta.constraint, 500);
    }
  }
};

/**
 * Retrieves paginated leave balances with optional search.
 * @param {string} [search] - Search keyword.
 * @param {number} [page=1] - Page number.
 * @param {number} [size=10] - Records per page.
 * @returns {Promise<Object>} Paginated leave balances with meta.
 */
const getAllLeaveBalances = async (search, page = 1, size = 10, is_active) => {
  try {
    const skip = (page - 1) * size;
    const where = search
      ? {
          OR: [
            { employee_code: { contains: search.toLowerCase() } },
            { first_name: { contains: search.toLowerCase() } },
            { last_name: { contains: search.toLowerCase() } },
          ],
        }
      : {};
    if (typeof is_active === "boolean") {
      filters.is_active = is_active ? "Y" : "N";
    } else if (typeof is_active === "string") {
      if (is_active.toLowerCase() === "true") filters.is_active = "Y";
      else if (is_active.toLowerCase() === "false") filters.is_active = "N";
    }
    const [data, totalCount] = await Promise.all([
      prisma.hrms_d_leave_balance.findMany({
        where,
        skip,
        take: size,
        orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
        include: {
          leave_balance_employee: {
            select: { id: true, full_name: true },
          },
        },
      }),
      prisma.hrms_d_leave_balance.count({ where }),
    ]);

    return {
      data,
      currentPage: page,
      size,
      totalPages: Math.ceil(totalCount / size),
      totalCount,
    };
  } catch (error) {
    throw new CustomError(error.message, 500);
  }
};

/**
 * Retrieves leave balances by employee ID and optional leave type ID.
 * @param {number|string} employeeId - Employee ID.
 * @param {number|string} [leaveTypeId] - Leave type ID.
 * @returns {Promise<Object>} Leave balance data with leave taken calculation.
 */
const getLeaveBalanceByEmployee = async (employeeId, leaveTypeId) => {
  try {
    const employeeIdInt = Number(employeeId);
    const leaveTypeIdInt = leaveTypeId ? Number(leaveTypeId) : undefined;

    if (isNaN(employeeIdInt)) throw new CustomError("Invalid Employee ID", 400);

    const [employee, leaveType] = await Promise.all([
      prisma.hrms_d_employee.findUnique({
        where: { id: employeeIdInt },
        select: { id: true, full_name: true },
      }),
      leaveTypeIdInt
        ? prisma.hrms_m_leave_type_master.findUnique({
            where: { id: leaveTypeIdInt },
            select: { id: true, leave_type: true, leave_qty: true },
          })
        : Promise.resolve(null),
    ]);

    if (!employee) throw new CustomError("Employee not found", 404);
    if (leaveTypeIdInt && !leaveType)
      throw new CustomError("Leave type not found", 404);

    let query = `SELECT * FROM vm_hrms_leave_balance WHERE employee_id = ${employeeIdInt}`;
    if (leaveTypeIdInt) query += ` AND leave_type_id = ${leaveTypeIdInt}`;

    const data = await prisma.$queryRawUnsafe(query);

    const result = leaveTypeIdInt
      ? data[0]
        ? {
            ...data[0],
            employee_name: employee.full_name,
            leave_type: leaveType.leave_type,
            total_leave: leaveType.leave_qty,
            leave_taken: await calculateLeaveTaken(
              employeeIdInt,
              leaveTypeIdInt,
            ),
          }
        : null
      : await Promise.all(
          data.map(async (item) => {
            const lt = await prisma.hrms_m_leave_type_master.findUnique({
              where: { id: item.leave_type_id },
              select: { leave_type: true, leave_qty: true },
            });

            const leaveTaken = await calculateLeaveTaken(
              employeeIdInt,
              item.leave_type_id,
            );

            return {
              ...item,
              employee_name: employee.full_name,
              leave_type: lt?.leave_type || null,
              total_leave: lt?.leave_qty || null,
              leave_taken: leaveTaken,
            };
          }),
        );

    return {
      data: result,
      message: "Leave balance retrieved successfully",
      status: 200,
    };
  } catch (error) {
    throw new CustomError(error.message, 500);
  }
};

/**
 * Calculates leave taken for an employee within a specific period and leave type.
 * @param {number|string} employeeId - Employee ID.
 * @param {number|string} [leaveTypeId] - Leave type ID (optional).
 * @param {number} [year] - Year to calculate for (defaults to current year).
 * @returns {Promise<Object>} Leave taken data with total days and breakdown.
 */
const calculateLeaveTaken = async (
  employeeId,
  leaveTypeId,
  year = new Date().getFullYear(),
) => {
  try {
    const employeeIdInt = parseInt(employeeId);
    const leaveTypeIdInt = leaveTypeId ? parseInt(leaveTypeId) : null;

    const whereClause = {
      employee_id: employeeIdInt,
      status: "A",
      AND: [
        {
          start_date: {
            gte: new Date(`${year}-01-01`),
            lte: new Date(`${year}-12-31`),
          },
        },
      ],
    };

    if (leaveTypeIdInt) {
      whereClause.leave_type_id = leaveTypeIdInt;
    }

    const leaveApplications = await prisma.hrms_d_leave_application.findMany({
      where: whereClause,
      select: {
        id: true,
        leave_type_id: true,
        start_date: true,
        end_date: true,
        partial_day: true,
        start_session: true,
        end_session: true,
        reason: true,
        leave_types: {
          select: {
            id: true,
            leave_type: true,
          },
        },
      },
    });

    let totalDays = 0;
    const leaveBreakdown = [];

    for (const leave of leaveApplications) {
      const start = new Date(leave.start_date);
      const end = new Date(leave.end_date);

      const diffTime = Math.abs(end - start);
      let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      if (leave.partial_day === "Y") {
        if (leave.start_session && leave.end_session) {
          if (leave.start_session === leave.end_session) {
            diffDays = 0.5;
          } else {
            diffDays = 1;
          }
        } else {
          diffDays = 0.5;
        }
      }

      totalDays += diffDays;

      leaveBreakdown.push({
        leave_application_id: leave.id,
        leave_type_id: leave.leave_type_id,
        leave_type_name: leave.leave_types?.leave_type || "Unknown",
        start_date: leave.start_date,
        end_date: leave.end_date,
        days_taken: diffDays,
        partial_day: leave.partial_day,
        start_session: leave.start_session,
        end_session: leave.end_session,
        reason: leave.reason,
      });
    }

    return {
      leave_type_id: leaveTypeIdInt,
      year: year,
      total_leave_taken: totalDays,
    };
  } catch (error) {
    console.error("Error calculating leave taken:", error);
    throw new CustomError(
      `Error calculating leave taken: ${error.message}`,
      500,
    );
  }
};

/**
 * Calculates leave taken for all leave types for an employee within a specific year.
 * @param {number|string} employeeId - Employee ID.
 * @param {number} [year] - Year to calculate for (defaults to current year).
 * @returns {Promise<Array>} Array of leave taken data for each leave type.
 */
const calculateAllLeaveTaken = async (
  employeeId,
  year = new Date().getFullYear(),
) => {
  try {
    const leaveTypes = await prisma.hrms_m_leave_type_master.findMany({
      where: { is_active: "Y" },
      select: { id: true, leave_type: true },
    });

    const leaveTakenPromises = leaveTypes.map(async (leaveType) => {
      return await calculateLeaveTaken(employeeId, leaveType.id, year);
    });

    const results = await Promise.all(leaveTakenPromises);

    return results.filter((result) => result.total_leave_taken > 0);
  } catch (error) {
    console.error("Error calculating all leave taken:", error);
    throw new CustomError(
      `Error calculating all leave taken: ${error.message}`,
      500,
    );
  }
};

module.exports = {
  createLeaveBalance,
  findLeaveBalanceById,
  updateLeaveBalance,
  deleteLeaveBalance,
  getAllLeaveBalances,
  getLeaveBalanceByEmployee,
  findLeaveBalanceByEmployeeId,
  calculateLeaveTaken,
  calculateAllLeaveTaken,
};

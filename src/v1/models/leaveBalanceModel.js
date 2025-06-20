/**
 * @fileoverview Leave balance model handling CRUD operations for leave balance
 * @module leaveBalanceModel
 */

const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const prisma = new PrismaClient();

/**
 * Creates a new leave balance
 * @param {Object} data - Leave balance data to create
 * @returns {Promise<Object>} Created leave balance
 * @throws {CustomError} If database error occurs
 */
const createLeaveBalance = async (data) => {
  try {
    const leaveBalances = data?.leave_balances;
    const reqData = await prisma.hrms_d_leave_balance.create({
      data: {
        employee_id: data.employee_id,
        employee_code: data.employee_code,
        first_name: data.first_name,
        last_name: data.last_name,
        status: data.status,
        start_date: data.start_date,
        end_date: data.end_date,
        createdby: Number(data.createdby) || 1,
        createdate: new Date(),
        log_inst: data.log_inst || 1,
      },
      include: {
        leave_balance_employee: {
          select: {
            id: true,
            full_name: true,
          },
        },
      },
    });

    await prisma.hrms_d_leave_balance_details.deleteMany({
      where: { parent_id: Number(reqData.id) },
    });

    await prisma.hrms_d_leave_balance_details.createMany({
      data: leaveBalances.map((item) => ({
        ...item,
        parent_id: Number(reqData.id),
        carried_forward: item.carried_forward || 0,
        encashed: item.encashed || 0,
        expired: item.expired || 0,
        unit: item.unit || "",
        closed: item.closed || "",
      })),
    });

    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error creating leave balance: ${error.message}`,
      500
    );
  }
};

/**
 * Updates a leave balance
 * @param {number|string} id - Leave balance ID to update
 * @param {Object} data - Updated leave balance data
 * @returns {Promise<Object>} Updated leave balance
 * @throws {CustomError} If database error occurs
 */
const updateLeaveBalance = async (id, data) => {
  const leaveBalances = data?.leave_balances;
  try {
    const payload = {
      employee_id: data.employee_id,
      employee_code: data.employee_code,
      first_name: data.first_name,
      last_name: data.last_name,
      status: data.status,
      start_date: data.start_date,
      end_date: data.end_date,
      createdby: Number(data.createdby) || 1,
      createdate: new Date(),
      log_inst: data.log_inst || 1,
    };

    const updatedLeaveBalance = await prisma.hrms_d_leave_balance.update({
      where: { id: parseInt(id) },
      data: payload,
      include: {
        leave_balance_employee: {
          select: {
            id: true,
            full_name: true,
          },
        },
      },
    });

    await prisma.hrms_d_leave_balance_details.deleteMany({
      where: { parent_id: Number(id) },
    });

    await prisma.hrms_d_leave_balance_details.createMany({
      data: leaveBalances.map((item) => ({
        ...item,
        parent_id: Number(id),
        carried_forward: item.carried_forward || 0,
        encashed: item.encashed || 0,
        expired: item.expired || 0,
        unit: item.unit || "",
        closed: item.closed || "",
      })),
    });

    return updatedLeaveBalance;
  } catch (error) {
    throw new CustomError(
      `Error updating leave balance: ${error.message}`,
      500
    );
  }
};

/**
 * Finds a leave balance by ID
 * @param {number|string} id - Leave balance ID
 * @returns {Promise<Object>} Leave balance
 * @throws {CustomError} If leave balance not found or database error occurs
 */
const findLeaveBalanceById = async (id) => {
  try {
    const leaveBalance = await prisma.hrms_d_leave_balance.findUnique({
      where: { id: Number(id) },
    });
    const data = await prisma.hrms_d_leave_balance_details.findMany({
      where: { parent_id: Number(id) },
    });
    if (!data) {
      throw new CustomError("Leave balance not found", 404);
    }
    return { ...leaveBalance, leaveBalances: data };
  } catch (error) {
    throw new CustomError(
      `Error finding leave balance by ID: ${error.message}`,
      503
    );
  }
};

/**
 * Deletes a leave balance
 * @param {number|string} id - Leave balance ID to delete
 * @throws {CustomError} If database error occurs
 */
const deleteLeaveBalance = async (id) => {
  try {
    await prisma.hrms_d_leave_balance.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    throw new CustomError(
      `Error deleting leave balance: ${error.message}`,
      500
    );
  }
};

/**
 * Gets all leave balances with pagination and filtering
 * @param {string} [search] - Search term for filtering leave balances
 * @param {number} [page=1] - Page number for pagination
 * @param {number} [size=10] - Number of items per page
 * @returns {Promise<Object>} Paginated leave balances with metadata
 * @throws {CustomError} If database error occurs
 */
const getAllLeaveBalances = async (search, page, size) => {
  try {
    page = !page || page == 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size || 0;

    const where = {};

    if (search) {
      where.OR = [
        { employee_code: { contains: search.toLowerCase() } },
        { first_name: { contains: search.toLowerCase() } },
        { last_name: { contains: search.toLowerCase() } },
      ];
    }

    const datas = await prisma.hrms_d_leave_balance.findMany({
      where,
      skip,
      take: size,
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
    });

    const totalCount = await prisma.hrms_d_leave_balance.count({
      where,
    });

    return {
      data: datas,
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
 * Gets leave balance by employee ID and leave type ID
 * @param {number|string} employeeId - Employee ID
 * @param {number|string} [leaveTypeId] - Leave type ID
 * @returns {Promise<Object>} Leave balance
 * @throws {CustomError} If employee not found or database error occurs
 */
const getLeaveBalanceByEmployee = async (employeeId, leaveTypeId) => {
  try {
    const employeeIdInt = Number(employeeId);
    const leaveTypeIdInt = leaveTypeId ? Number(leaveTypeId) : undefined;

    if (isNaN(employeeIdInt)) {
      throw new CustomError("Invalid Employee ID", 400);
    }

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

    if (!employee) {
      throw new CustomError("Employee not found", 404);
    }
    if (leaveTypeIdInt && !leaveType) {
      throw new CustomError("Leave type not found", 404);
    }

    let query = `SELECT * FROM vm_hrms_leave_balance WHERE employee_id = ${employeeIdInt}`;
    if (leaveTypeIdInt) {
      query += ` AND leave_type_id = ${leaveTypeIdInt}`;
    }

    const data = await prisma.$queryRawUnsafe(query);

    let result;
    if (leaveTypeIdInt) {
      result = data[0]
        ? {
            ...data[0],
            employee_name: employee.full_name,
            leave_type: leaveType.leave_type,
            total_leave: leaveType.leave_qty,
          }
        : null;
    } else {
      const leaveTypeIds = data.map((item) => item.leave_type_id);
      const leaveTypesMap = {};
      if (leaveTypeIds.length > 0) {
        const leaveTypes = await prisma.hrms_m_leave_type_master.findMany({
          where: { id: { in: leaveTypeIds } },
          select: { id: true, leave_type: true, leave_qty: true },
        });
        leaveTypes.forEach((lt) => {
          leaveTypesMap[lt.id] = lt;
        });
      }
      result = data.map((item) => ({
        ...item,
        employee_name: employee.full_name,
        leave_type: leaveTypesMap[item.leave_type_id]?.leave_type || null,
        total_leave: leaveTypesMap[item.leave_type_id]?.leave_qty || null,
      }));
    }

    return {
      data: result,
      message: "Leave balance retrieved successfully",
      status: 200,
    };
  } catch (error) {
    throw new CustomError(error.message, 500);
  }
};

module.exports = {
  createLeaveBalance,
  findLeaveBalanceById,
  updateLeaveBalance,
  deleteLeaveBalance,
  getAllLeaveBalances,
  getLeaveBalanceByEmployee,
};

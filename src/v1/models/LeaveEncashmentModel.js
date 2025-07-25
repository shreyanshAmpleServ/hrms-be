const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const { parse } = require("dotenv");
const prisma = new PrismaClient();

// Serialize leave encashment data
const serializeLeaveEncashmentData = (data) => ({
  employee_id: data.employee_id ? Number(data.employee_id) : null,
  leave_type_id: data.leave_type_id ? Number(data.leave_type_id) : null,
  leave_days: data.leave_days ? Number(data.leave_days) : null,
  encashment_amount: data.encashment_amount
    ? Number(data.encashment_amount)
    : null,
  approval_status: data.approval_status || "",
  encashment_date: data.encashment_date ? new Date(data.encashment_date) : null,
  basic_salary: data.basic_salary ? Number(data.basic_salary) : null,
  payroll_period: data.payroll_period || "",
  total_amount: data.total_amount ? Number(data.total_amount) : null,
  entitled: data.entitled ? Number(data.entitled) : null,
  total_available: data.total_available ? Number(data.total_available) : null,
  used: data.used ? Number(data.used) : null,
  balance: data.balance ? Number(data.balance) : null,
  requested: data.requested ? Number(data.requested) : null,
  requested_date: data.requested_date ? new Date(data.requested_date) : null,
});

const createLeaveEncashment = async (data) => {
  try {
    const serializedData = serializeLeaveEncashmentData(data);
    const employeeId = serializedData.employee_id;
    const encashmentDate = serializedData.encashment_date;

    if (!employeeId || !encashmentDate || isNaN(encashmentDate.getTime())) {
      throw new CustomError("Invalid employee id or encashment date", 400);
    }

    const month = encashmentDate.getMonth() + 1;
    const year = encashmentDate.getFullYear();

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const monthName = monthNames[month - 1];

    const payrollExists = await prisma.$queryRawUnsafe(`
      SELECT TOP 1 1
      FROM hrms_d_monthly_payroll_processing
      WHERE employee_id = ${employeeId}
      AND payroll_month = ${month}
      AND payroll_year = ${year}
    `);

    if (payrollExists.length > 0) {
      throw new CustomError(
        `Payroll for ${monthName} ${year} has already been processed for this employee. Leave encashment is not permitted.`,
        400
      );
    }

    console.log("Checking payroll conflict for:", {
      employeeId,
      encashmentDate,
      month,
      year,
    });

    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0);

    const existingEncashment = await prisma.hrms_d_leave_encashment.findFirst({
      where: {
        employee_id: employeeId,
        encashment_date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    if (existingEncashment) {
      throw new CustomError(
        `Leave encashment already exists for this employee in ${monthName} ${year}.`,
        400
      );
    }

    const createData = {
      ...serializedData,
      createdby: data.createdby || 1,
      createdate: new Date(),
      log_inst: data.log_inst || 1,
    };

    const reqData = await prisma.hrms_d_leave_encashment.create({
      data: createData,
      include: {
        leave_encashment_employee: {
          select: {
            full_name: true,
            id: true,
          },
        },
        encashment_leave_types: {
          select: {
            leave_type: true,
            id: true,
          },
        },
      },
    });

    return reqData;
  } catch (error) {
    console.error("Leave encashment error:", error);
    throw new CustomError(`${error.message}`, 500);
  }
};

// Find leave encashment by ID
const findLeaveEncashmentById = async (id) => {
  try {
    const reqData = await prisma.hrms_d_leave_encashment.findUnique({
      where: { id: parseInt(id) },
    });
    if (!reqData) {
      throw new CustomError("Leave encashment not found", 404);
    }
    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error finding leave encashment by ID: ${error.message}`,
      503
    );
  }
};

// Update leave encashment
const updateLeaveEncashment = async (id, data) => {
  try {
    const updatedEntry = await prisma.hrms_d_leave_encashment.update({
      where: { id: parseInt(id) },
      data: {
        ...serializeLeaveEncashmentData(data),
        updatedby: data.updatedby || 1,
        updatedate: new Date(),
      },
      include: {
        leave_encashment_employee: {
          select: {
            full_name: true,
            id: true,
          },
        },
        encashment_leave_types: {
          select: {
            leave_type: true,
            id: true,
          },
        },
      },
    });

    return updatedEntry;
  } catch (error) {
    throw new CustomError(
      `Error updating leave encashment: ${error.message}`,
      500
    );
  }
};

// Delete leave encashment
const deleteLeaveEncashment = async (id) => {
  try {
    await prisma.hrms_d_leave_encashment.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    throw new CustomError(
      `Error deleting leave encashment: ${error.message}`,
      500
    );
  }
};

// Get all leave encashments with pagination and search
const getAllLeaveEncashment = async (
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
        {
          leave_encashment_employee: {
            full_name: { contains: search.toLowerCase() },
          },
        },
        {
          encashment_leave_types: {
            leave_type: { contains: search.toLowerCase() },
          },
        },
      ];
    }
    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setUTCHours(0, 0, 0, 0);

      const end = new Date(endDate);
      end.setUTCHours(23, 59, 59, 999);
      filters.createdate = { gte: start, lte: end };
    }

    const datas = await prisma.hrms_d_leave_encashment.findMany({
      where: filters,
      skip,
      take: size,
      include: {
        leave_encashment_employee: {
          select: {
            full_name: true,
            id: true,
          },
        },
        encashment_leave_types: {
          select: {
            leave_type: true,
            id: true,
          },
        },
      },

      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
    });
    const totalCount = await prisma.hrms_d_leave_encashment.count({
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
    throw new CustomError("Error retrieving leave encashments", 503);
  }
};

const updateLeaveEnchashmentStatus = async (id, data) => {
  try {
    const leaveEnchashmentId = parseInt(id);
    if (isNaN(leaveEnchashmentId)) {
      throw new CustomError("Invalid leave Enchashment ID", 400);
    }

    const existingLeaveEnchasment =
      await prisma.hrms_d_leave_encashment.findUnique({
        where: { id: leaveEnchashmentId },
      });

    if (!existingLeaveEnchasment) {
      throw new CustomError(
        `Leave encashment with ID ${leaveEnchashmentId} not found`,
        404
      );
    }

    // Build update data aligned to your schema
    const updateData = {
      approval_status: data.status,
      updatedby: Number(data.updatedby) || 1,
      updatedate: new Date(),
      // remarks field removed because it doesn't exist
    };

    const updatedEntry = await prisma.hrms_d_leave_encashment.update({
      where: { id: leaveEnchashmentId },
      data: updateData,
      include: {
        leave_encashment_employee: {
          select: {
            id: true,
            employee_code: true,
            full_name: true,
          },
        },
        encashment_leave_types: {
          select: {
            id: true,
          },
        },
      },
    });

    return updatedEntry;
  } catch (error) {
    console.log("Error updating leave Enchashment", error);

    throw new CustomError(
      `Error updating leave Enchashment: ${error.message}`,
      500
    );
  }
};

module.exports = {
  createLeaveEncashment,
  findLeaveEncashmentById,
  updateLeaveEncashment,
  deleteLeaveEncashment,
  getAllLeaveEncashment,
  updateLeaveEnchashmentStatus,
};

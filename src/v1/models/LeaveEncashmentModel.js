const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const { errorNotExist } = require("../../Comman/errorNotExist");
const prisma = new PrismaClient();

const serializeJobData = (data) => {
  return {
    employee_id: Number(data.employee_id) || null,
    leave_type_id: Number(data.leave_type_id) || null,
    encashment_date: data.encashment_date || new Date(),
    leave_days: data.leave_days || 0,
    encashment_amount: data.encashment_amount || 0,
    approval_status: data.approval_status || "",
  };
};

// Create a new leave encashment
const createLeaveEncashment = async (data) => {
  try {
    await errorNotExist("hrms_d_employee", data.employee_id, "Employee");
    const reqData = await prisma.hrms_d_leave_encashment.create({
      data: {
        ...serializeJobData(data),
        createdby: data.createdby || 1,
        createdate: new Date(),
        log_inst: data.log_inst || 1,
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
    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error creating leave encashment: ${error.message}`,
      500
    );
  }
};

// Find a leave encashment by ID
const findLeaveEncashmentById = async (id) => {
  try {
    const reqData = await prisma.hrms_d_leave_encashment.findUnique({
      where: { id: parseInt(id) },
    });
    if (!reqData) {
      throw new CustomError("leave encashment not found", 404);
    }
    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error finding leave encashment by ID: ${error.message}`,
      503
    );
  }
};

// Update a leave encashment
const updateLeaveEncashment = async (id, data) => {
  try {
    await errorNotExist("hrms_d_employee", data.employee_id, "Employee");

    const updatedLeaveEncashment = await prisma.hrms_d_leave_encashment.update({
      where: { id: parseInt(id) },
      data: {
        ...serializeJobData(data),
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
    return updatedLeaveEncashment;
  } catch (error) {
    throw new CustomError(
      `Error updating leave encashment: ${error.message}`,
      500
    );
  }
};

// Delete a leave encashment
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

// Get all leave encashments
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
    // Handle search
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
      const end = new Date(endDate);

      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        filters.createdate = {
          gte: start,
          lte: end,
        };
      }
    }
    const datas = await prisma.hrms_d_leave_encashment.findMany({
      where: filters,
      skip: skip,
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
    // const totalCount = await prisma.hrms_d_leave_encashment.count();
    const totalCount = await prisma.hrms_d_leave_encashment.count({
      where: filters,
    });

    return {
      data: datas,
      currentPage: page,
      size,
      totalPages: Math.ceil(totalCount / size),
      totalCount: totalCount,
    };
  } catch (error) {
    console.log(error);
    throw new CustomError("Error retrieving leave encashments", 503);
  }
};

module.exports = {
  createLeaveEncashment,
  findLeaveEncashmentById,
  updateLeaveEncashment,
  deleteLeaveEncashment,
  getAllLeaveEncashment,
};

const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const { errorNotExist } = require("../../Comman/errorNotExist");
const { leaveApplicationSchema } = require("../schemas/leaveApplicationSchema");
const prisma = new PrismaClient();

const serializeJobData = (data) => {
  return {
    employee_id: Number(data.employee_id) || null,
    leave_type_id: Number(data.leave_type_id) || null,
    start_date: data.start_date ? new Date(data.start_date) : new Date(),
    end_date: data.end_date ? new Date(data.end_date) : new Date(),
    reason: data.reason || "",
    status: data.status || "",
  };
};

// Create a new leave application
const createLeaveApplication = async (data) => {
  try {
    const validatedData = leaveApplicationSchema.parse(data);
    await errorNotExist("hrms_d_employee", data.employee_id, "Employee");
    const reqData = await prisma.hrms_d_leave_application.create({
      data: {
        ...serializeJobData(data),
        createdby: data.createdby || 1,
        createdate: new Date(),
        log_inst: data.log_inst || 1,
      },
      include: {
        leave_employee: {
          select: {
            full_name: true,
            id: true,
          },
        },
        leave_types: {
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
      `Error creating leave application: ${error.message}`,
      500
    );
  }
};

// Find a leave application by ID
const findLeaveApplicationById = async (id) => {
  try {
    const reqData = await prisma.hrms_d_leave_application.findUnique({
      where: { id: parseInt(id) },
    });
    if (!reqData) {
      throw new CustomError("leave application not found", 404);
    }
    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error finding leave application by ID: ${error.message}`,
      503
    );
  }
};

// Update a leave application
const updateLeaveApplication = async (id, data) => {
  try {
    const validatedData = leaveApplicationSchema.parse(data);

    await errorNotExist("hrms_d_employee", data.employee_id, "Employee");

    const updatedLeaveApplication =
      await prisma.hrms_d_leave_application.update({
        where: { id: parseInt(id) },
        data: {
          ...serializeJobData(data),
          updatedby: data.updatedby || 1,
          updatedate: new Date(),
        },
        include: {
          leave_employee: {
            select: {
              full_name: true,
              id: true,
            },
          },
          leave_types: {
            select: {
              leave_type: true,
              id: true,
            },
          },
        },
      });
    return updatedLeaveApplication;
  } catch (error) {
    throw new CustomError(
      `Error updating leave application: ${error.message}`,
      500
    );
  }
};

// Delete a leave application
const deleteLeaveApplication = async (id) => {
  try {
    await prisma.hrms_d_leave_application.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    throw new CustomError(
      `Error deleting leave application: ${error.message}`,
      500
    );
  }
};

// Get all leave applications
const getAllLeaveApplication = async (
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
          leave_employee: {
            full_name: { contains: search.toLowerCase() },
          },
        },
        {
          leave_types: {
            leave_type: { contains: search.toLowerCase() },
          },
        },
        {
          status: { contains: search.toLowerCase() },
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
    const datas = await prisma.hrms_d_leave_application.findMany({
      where: filters,
      skip: skip,
      take: size,
      include: {
        leave_employee: {
          select: {
            full_name: true,
            id: true,
          },
        },
        leave_types: {
          select: {
            leave_type: true,
            id: true,
          },
        },
      },
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
    });
    // const totalCount = await prisma.hrms_d_leave_application.count();
    const totalCount = await prisma.hrms_d_leave_application.count({
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
    throw new CustomError("Error retrieving leave applications", 503);
  }
};

module.exports = {
  createLeaveApplication,
  findLeaveApplicationById,
  updateLeaveApplication,
  deleteLeaveApplication,
  getAllLeaveApplication,
};

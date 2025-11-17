const { prisma } = require("../../utils/prismaProxy");
const CustomError = require("../../utils/CustomError");

const createEarlyLeave = async (data) => {
  try {
    const finalData = await prisma.hrms_d_early_leave.create({
      data: {
        employee_id: data.employee_id,
        leave_date: data.leave_date || new Date(),
        early_leave_time: data.early_leave_time || "",
        reason: data.reason || "",
        status: data.status || "Pending",
        approved_by: data.approved_by || null,
        approved_date: data.approved_date || null,
        remarks: data.remarks || null,
        createdby: data.createdby || 1,
        log_inst: data.log_inst || 1,
        createdate: new Date(),
        updatedate: new Date(),
        updatedby: 1,
      },
      include: {
        early_leave_employee: {
          select: {
            id: true,
            employee_code: true,
            first_name: true,
            last_name: true,
            full_name: true,
            email: true,
            hrms_employee_department: {
              select: {
                id: true,
                department_name: true,
              },
            },
            hrms_employee_designation: {
              select: {
                id: true,
                designation_name: true,
              },
            },
          },
        },
        early_leave_approved_by: {
          select: {
            id: true,
            employee_code: true,
            first_name: true,
            last_name: true,
            full_name: true,
          },
        },
      },
    });
    return finalData;
  } catch (error) {
    console.log("Create early leave ", error);
    throw new CustomError(`Error creating early leave: ${error.message}`, 500);
  }
};

const findEarlyLeaveById = async (id) => {
  try {
    const data = await prisma.hrms_d_early_leave.findUnique({
      where: { id: parseInt(id) },
      include: {
        early_leave_employee: {
          select: {
            id: true,
            employee_code: true,
            first_name: true,
            last_name: true,
            full_name: true,
            email: true,
            phone_number: true,
            hrms_employee_department: {
              select: {
                id: true,
                department_name: true,
              },
            },
            hrms_employee_designation: {
              select: {
                id: true,
                designation_name: true,
              },
            },
          },
        },
        early_leave_approved_by: {
          select: {
            id: true,
            employee_code: true,
            first_name: true,
            last_name: true,
            full_name: true,
          },
        },
      },
    });
    if (!data) {
      throw new CustomError("early leave not found", 404);
    }
    return data;
  } catch (error) {
    console.log("early leave By Id  ", error);
    throw new CustomError(
      `Error finding early leave by ID: ${error.message}`,
      503
    );
  }
};

const updateEarlyLeave = async (id, data) => {
  try {
    const updatedData = await prisma.hrms_d_early_leave.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        updatedate: new Date(),
      },
      include: {
        early_leave_employee: {
          select: {
            id: true,
            employee_code: true,
            first_name: true,
            last_name: true,
            full_name: true,
            email: true,
            hrms_employee_department: {
              select: {
                id: true,
                department_name: true,
              },
            },
            hrms_employee_designation: {
              select: {
                id: true,
                designation_name: true,
              },
            },
          },
        },
        early_leave_approved_by: {
          select: {
            id: true,
            employee_code: true,
            first_name: true,
            last_name: true,
            full_name: true,
          },
        },
      },
    });
    return updatedData;
  } catch (error) {
    throw new CustomError(`Error updating early leave: ${error.message}`, 500);
  }
};

const deleteEarlyLeave = async (id) => {
  try {
    await prisma.hrms_d_early_leave.delete({
      where: { id: parseInt(id) },
    });
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

const getAllEarlyLeave = async (
  page,
  size,
  search,
  searchDate,
  endDate,
  status
) => {
  try {
    page = page || page == 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size || 0;

    const filters = {};
    if (search) {
      filters.OR = [
        {
          early_leave_employee: {
            OR: [
              { first_name: { contains: search.toLowerCase() } },
              { last_name: { contains: search.toLowerCase() } },
              { full_name: { contains: search.toLowerCase() } },
              { employee_code: { contains: search.toLowerCase() } },
            ],
          },
        },
        { reason: { contains: search.toLowerCase() } },
      ];
    }

    if (status) {
      filters.status = status;
    }

    if (searchDate && endDate) {
      filters.leave_date = {
        gte: new Date(searchDate),
        lte: new Date(endDate),
      };
    } else if (searchDate) {
      filters.leave_date = {
        gte: new Date(searchDate),
      };
    } else if (endDate) {
      filters.leave_date = {
        lte: new Date(endDate),
      };
    }

    const data = await prisma.hrms_d_early_leave.findMany({
      where: filters,
      skip: skip,
      take: size,
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
      include: {
        early_leave_employee: {
          select: {
            id: true,
            employee_code: true,
            first_name: true,
            last_name: true,
            full_name: true,
            email: true,
            hrms_employee_department: {
              select: {
                id: true,
                department_name: true,
              },
            },
            hrms_employee_designation: {
              select: {
                id: true,
                designation_name: true,
              },
            },
          },
        },
        early_leave_approved_by: {
          select: {
            id: true,
            employee_code: true,
            first_name: true,
            last_name: true,
            full_name: true,
          },
        },
      },
    });

    const totalCount = await prisma.hrms_d_early_leave.count({
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
    throw new CustomError("Error retrieving early leave", 503);
  }
};

const updateEarlyLeaveStatus = async (
  id,
  status,
  approvedBy = null,
  remarks = null
) => {
  try {
    const updateData = {
      status,
      remarks,
      updatedby: approvedBy || 1,
      updatedate: new Date(),
    };

    if (status === "Approved" || status === "Rejected") {
      updateData.approved_by = approvedBy;
      updateData.approved_date = new Date();
    }

    const earlyLeave = await prisma.hrms_d_early_leave.update({
      where: { id: Number(id) },
      data: updateData,
      include: {
        early_leave_employee: {
          select: {
            id: true,
            employee_code: true,
            first_name: true,
            last_name: true,
            full_name: true,
            email: true,
          },
        },
        early_leave_approved_by: {
          select: {
            id: true,
            employee_code: true,
            first_name: true,
            last_name: true,
            full_name: true,
          },
        },
      },
    });

    return earlyLeave;
  } catch (error) {
    throw new CustomError(
      `Error updating early leave status: ${error.message}`,
      500
    );
  }
};

module.exports = {
  createEarlyLeave,
  findEarlyLeaveById,
  updateEarlyLeave,
  deleteEarlyLeave,
  getAllEarlyLeave,
  updateEarlyLeaveStatus,
};

const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const { id } = require("zod/v4/locales");
const prisma = new PrismaClient();

// Serialize leave application data
const serializeLeaveApplicationData = (data) => ({
  employee_id: data.employee_id ? Number(data.employee_id) : null,
  leave_type_id: data.leave_type_id ? Number(data.leave_type_id) : null,
  start_date: data.start_date ? new Date(data.start_date) : null,
  end_date: data.end_date ? new Date(data.end_date) : null,
  reason: data.reason || "",
  status: data.status || "",
  partial_day: data.partial_day || "",
  start_session: data.start_session || "",
  end_session: data.end_session || "",
  backup_person_id: data.backup_person_id
    ? Number(data.backup_person_id)
    : null,
  contact_details_during_leave: data.contact_details_during_leave || "",
  approver_id: data.approver_id ? Number(data.approver_id) : null,
  approval_date: data.approval_date ? new Date(data.approval_date) : new Date(), // default to today if not provided
  document_attachment: data.document_attachment || "",
});

// Create a new leave application
const createLeaveApplication = async (data) => {
  try {
    console.log("Saving document_attachment:", data.document_attachment);

    const reqData = await prisma.hrms_d_leave_application.create({
      data: {
        ...serializeLeaveApplicationData(data),
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
        leave_approver: {
          select: {
            id: true,
            employee_code: true,
            full_name: true,
          },
        },
        leave_backup_person_id: {
          select: {
            id: true,
            employee_code: true,
            full_name: true,
          },
        },
        leave_types: true,
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

// Find leave application by ID
const findLeaveApplicationById = async (id) => {
  try {
    const reqData = await prisma.hrms_d_leave_application.findUnique({
      where: { id: parseInt(id) },
    });
    if (!reqData) {
      throw new CustomError("Leave application not found", 404);
    }
    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error finding leave application by ID: ${error.message}`,
      503
    );
  }
};

// Update leave applications
const updateLeaveApplication = async (id, data) => {
  try {
    const updatedEntry = await prisma.hrms_d_leave_application.update({
      where: { id: parseInt(id) },

      data: {
        ...serializeLeaveApplicationData(data),
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
        leave_approver: {
          select: {
            id: true,
            employee_code: true,
            full_name: true,
          },
        },
        leave_backup_person_id: {
          select: {
            id: true,
            employee_code: true,
            full_name: true,
          },
        },
        leave_types: true,
      },
    });
    return updatedEntry;
  } catch (error) {
    throw new CustomError(
      `Error updating leave application: ${error.message}`,
      500
    );
  }
};

// Delete leave application
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

// Get all leave applications with pagination and search
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
    if (search) {
      filters.OR = [
        {
          leave_approver: { full_name: { contains: search.toLowerCase() } },
        },
        {
          leave_backup_person_id: {
            full_name: { contains: search.toLowerCase() },
          },
        },
        { reason: { contains: search.toLowerCase() } },
        { status: { contains: search.toLowerCase() } },
        { rejection_reason: { contains: search.toLowerCase() } },
        {
          contact_details_during_leave: {
            contains: search.toLowerCase(),
          },
        },
      ];
    }
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        filters.start_date = { gte: start, lte: end };
      }
    }

    const datas = await prisma.hrms_d_leave_application.findMany({
      where: filters,
      skip,
      take: size,
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
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
        leave_approver: {
          select: {
            id: true,
            employee_code: true,
            full_name: true,
          },
        },
        leave_backup_person_id: {
          select: {
            id: true,
            employee_code: true,
            full_name: true,
          },
        },
        leave_types: true,
      },
    });
    const totalCount = await prisma.hrms_d_leave_application.count({
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
    throw new CustomError("Error retrieving leave applications", 503);
  }
};

const updateLeaveStatus = async (id, data) => {
  try {
    const updateData = {
      status: data.status,
      updatedby: data.updatedby || 1,
      updatedate: new Date(),
    };

    if (data.status === "Approved") {
      updateData.approver_id = Number(data.approver_id) || null;
      updateData.approval_date = new Date(); // current date
      updateData.rejection_reason = "";
    } else if (data.status === "Rejected") {
      updateData.approver_id = Number(data.approver_id) || null;
      updateData.approval_date = new Date();
      updateData.rejection_reason = data.rejection_reason || "";
    } else {
      updateData.approver_id = null;
      updateData.approval_date = null;
      updateData.rejection_reason = "";
    }

    const updatedEntry = await prisma.hrms_d_leave_application.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    return updatedEntry;
  } catch (error) {
    throw new CustomError(`Error updating leave status: ${error.message}`, 500);
  }
};

module.exports = {
  createLeaveApplication,
  findLeaveApplicationById,
  updateLeaveApplication,
  deleteLeaveApplication,
  getAllLeaveApplication,
  updateLeaveStatus,
};

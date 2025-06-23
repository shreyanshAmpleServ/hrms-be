const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const { errorNotExist } = require("../../Comman/errorNotExist");
const { parse } = require("dotenv");
const prisma = new PrismaClient();

const serializeData = (data) => {
  return {
    employee_id: Number(data.employee_id) || null,
    grievance_type: Number(data.grievance_type) || null,
    description: data.description || "",
    anonymous: data.anonymous || false,
    submitted_on: data.submitted_on || "",
    status: data.status || "",
    assigned_to: Number(data.assigned_to) || null,
    resolution_notes: data.resolution_notes || 0,
    resolved_on: data.resolved_on || null,
    // grievance_employee: {
    //   connect: { id: Number(data?.employee_id) || null },
    // },
    // grievance_types: {
    //   connect: { id: Number(data?.loan_type_id) || null },
    // },
  };
};

// Create a new loan request
const createGrievanceSubmission = async (data) => {
  try {
    await errorNotExist("hrms_d_employee", data.employee_id, "Employee");
    await errorNotExist("hrms_d_employee", data.assigned_to, "Assign to");
    const reqData = await prisma.hrms_d_grievance.create({
      data: {
        ...serializeData(data),
        createdby: data.createdby || 1,
        createdate: new Date(),
        log_inst: data.log_inst || 1,
      },
      include: {
        grievance_employee: {
          select: {
            full_name: true,
            id: true,
          },
        },
        grievance_assigned_to: {
          select: {
            full_name: true,
            id: true,
          },
        },
        grievance_types: {
          select: {
            grievance_type_name: true,
            id: true,
          },
        },
      },
    });
    return reqData;
  } catch (error) {
    console.error("Error creating loan request:", error);
    throw new CustomError(`Error creating loan request: ${error.message}`, 500);
  }
};

// Find a loan request by ID
const findGrievanceSubmissionById = async (id) => {
  try {
    const reqData = await prisma.hrms_d_grievance.findUnique({
      where: { id: parseInt(id) },
    });
    if (!reqData) {
      throw new CustomError("loan request not found", 404);
    }
    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error finding loan request by ID: ${error.message}`,
      503
    );
  }
};

// Update a loan request
const updateGrievanceSubmission = async (id, data) => {
  try {
    if (data.employee_id) {
      await errorNotExist("hrms_d_employee", data.employee_id, "Employee");
    } else {
      throw new Error("Employee is required");
    }
    await errorNotExist("hrms_d_employee", data.assigned_to, "Assign to");

    const updatedGrievanceSubmission = await prisma.hrms_d_grievance.update({
      where: { id: parseInt(id) },
      data: {
        ...serializeData(data),
        updatedby: data.updatedby || 1,
        updatedate: new Date(),
      },
      include: {
        grievance_employee: {
          select: {
            full_name: true,
            id: true,
          },
        },
        grievance_assigned_to: {
          select: {
            full_name: true,
            id: true,
          },
        },
        grievance_types: {
          select: {
            grievance_type_name: true,
            id: true,
          },
        },
      },
    });
    return updatedGrievanceSubmission;
  } catch (error) {
    throw new CustomError(`Error updating loan request: ${error.message}`, 500);
  }
};

// Delete a loan request
const deleteGrievanceSubmission = async (id) => {
  try {
    await prisma.hrms_d_grievance.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    throw new CustomError(`Error deleting loan request: ${error.message}`, 500);
  }
};

// Get all loan requests
const getAllGrievanceSubmission = async (
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
          grievance_employee: {
            full_name: { contains: search.toLowerCase() },
          },
        },
        {
          grievance_assigned_to: {
            full_name: { contains: search.toLowerCase() },
          },
        },
        {
          grievance_types: {
            grievance_type_name: { contains: search.toLowerCase() },
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
    const datas = await prisma.hrms_d_grievance.findMany({
      where: filters,
      skip: skip,
      take: size,
      include: {
        grievance_employee: {
          select: {
            full_name: true,
            id: true,
          },
        },
        grievance_assigned_to: {
          select: {
            full_name: true,
            id: true,
          },
        },
        grievance_types: {
          select: {
            grievance_type_name: true,
            id: true,
          },
        },
      },
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
    });
    // const totalCount = await prisma.hrms_d_grievance.count();
    const totalCount = await prisma.hrms_d_grievance.count({
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
    throw new CustomError("Error retrieving loan requests", 503);
  }
};

const updateGrievanceSubmissionStatus = async (id, data) => {
  try {
    const grievanceSubmissionId = parseInt(id);
    if (isNaN(grievanceSubmissionId)) {
      throw new CustomError("Invalid grievance submission id", 400);
    }
    const existingGrievanceSubmission = await prisma.hrms_d_grievance.update({
      where: { id: grievanceSubmissionId },
    });

    if (!existingGrievanceSubmission) {
      throw new CustomError(
        `Grieb=vance Submission application with ID ${grievanceSubmissionId} not found`,
        404
      );
    }

    const updateData = {
      status: data.status,
      updatedby: data.updatedby || 1,
      updatedate: new Date(),
    };
    if (data.status === "Approved") {
      updateData.status = data.status;
    } else if (data.status === "Rejected") {
      updateData.status = data.status;
    } else {
      updateData.status = data.status;
    }
    const updatedEntry = await prisma.hrms_d_grievance.update({
      where: { id: grievanceSubmissionId },
      data: updateData,
    });
    return updatedEntry;
  } catch (error) {
    console.log("Error updating grievance submission status:", error);
    throw new CustomError(
      `Error updating Grievance submission status: ${error.message}`,
      error.status || 500
    );
  }
};
module.exports = {
  createGrievanceSubmission,
  findGrievanceSubmissionById,
  updateGrievanceSubmission,
  deleteGrievanceSubmission,
  getAllGrievanceSubmission,
  updateGrievanceSubmissionStatus,
};

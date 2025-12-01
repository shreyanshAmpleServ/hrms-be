const { prisma } = require("../../utils/prismaProxy.js");
const CustomError = require("../../utils/CustomError");

// Serialize request approval data
const serializeRequestApprovalData = (data) => ({
  request_id: Number(data.request_id),
  approver_id: Number(data.approver_id),
  sequence: Number(data.sequence),
  status: data.status || "Pending",
  action_at: data.action_at ? new Date(data.action_at) : null,
  reference_id: data.reference_id ? Number(data.reference_id) : null,
});

// Create approval entry
const createRequestApproval = async (data) => {
  try {
    const reqData = await prisma.hrms_d_requests_approval.create({
      data: {
        ...serializeRequestApprovalData(data),
        createdby: data.createdby || 1,
        createdate: new Date(),
        log_inst: data.log_inst || 1,
      },
      include: {
        request_approval_request: {
          select: {
            request_data: true,
            request_type: true,
            requester_id: true,
          },
        },
        request_approval_approver: {
          select: { id: true, full_name: true, employee_code: true },
        },
      },
    });
    return reqData;
  } catch (error) {
    throw new CustomError(`${error.message}`, 500);
  }
};

// Update approval entry
const updateRequestApproval = async (approval_id, data) => {
  try {
    const updatedEntry = await prisma.hrms_d_requests_approval.update({
      where: { approval_id: parseInt(approval_id) },
      data: {
        ...serializeRequestApprovalData(data),
        updatedby: data.updatedby || 1,
        updatedate: new Date(),
      },
      include: {
        request_approval_request: {
          select: {
            request_data: true,
            request_type: true,
            requester_id: true,
          },
        },
        request_approval_approver: {
          select: { id: true, full_name: true, employee_code: true },
        },
      },
    });
    return updatedEntry;
  } catch (error) {
    throw new CustomError(
      `Error updating request approval: ${error.message}`,
      500
    );
  }
};

// Delete approval entry
const deleteRequestApproval = async (approval_id) => {
  try {
    await prisma.hrms_d_requests_approval.delete({
      where: { approval_id: parseInt(approval_id) },
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

const getAllRequestApproval = async (
  search,
  page,
  size,
  startDate,
  endDate,
  request_type,
  approver_id,
  status
) => {
  try {
    page = !page || page == 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size;

    const filters = { AND: [] };

    // Search conditions (OR logic)
    if (search) {
      filters.AND.push({
        OR: [
          {
            request_approval_request: {
              request_type: { contains: search, mode: "insensitive" },
            },
          },
          {
            request_approval_approver: {
              full_name: { contains: search, mode: "insensitive" },
            },
          },
          {
            status: { contains: search, mode: "insensitive" },
          },
        ],
      });
    }

    // Exact match filters (AND logic)
    if (request_type) {
      filters.AND.push({
        request_approval_request: {
          request_type: { equals: request_type },
        },
      });
    }

    if (approver_id) {
      filters.AND.push({
        approver_id: { equals: parseInt(approver_id) },
      });
    }

    if (status) {
      filters.AND.push({
        status: { equals: status },
      });
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        filters.AND.push({
          createdate: { gte: start, lte: end },
        });
      }
    }

    // If no conditions, remove the AND wrapper
    const whereClause = filters.AND.length > 0 ? filters : {};

    const datas = await prisma.hrms_d_requests_approval.findMany({
      where: whereClause,
      skip,
      take: size,
      orderBy: [{ createdate: "desc" }],
      include: {
        request_approval_request: {
          select: {
            request_data: true,
            request_type: true,
            requester_id: true,
          },
        },
        request_approval_approver: {
          select: { id: true, full_name: true, employee_code: true },
        },
      },
    });

    const totalCount = await prisma.hrms_d_requests_approval.count({
      where: whereClause,
    });

    return {
      data: datas,
      currentPage: page,
      size,
      totalPages: Math.ceil(totalCount / size),
      totalCount,
    };
  } catch (error) {
    console.log("Error", error);
    throw new CustomError("Error retrieving request approvals", 503);
  }
};

// Get by ID
const findRequestApproval = async (approval_id) => {
  try {
    const result = await prisma.hrms_d_requests_approval.findUnique({
      where: { approval_id: parseInt(approval_id) },
      include: {
        request_approval_request: {
          select: {
            request_data: true,
            request_type: true,
            requester_id: true,
          },
        },
        request_approval_approver: {
          select: { id: true, full_name: true, employee_code: true },
        },
      },
    });

    if (!result) {
      throw new CustomError("Request approval not found", 404);
    }
    return result;
  } catch (error) {
    throw new CustomError(
      `Error finding request approval by ID: ${error.message}`,
      503
    );
  }
};

module.exports = {
  createRequestApproval,
  updateRequestApproval,
  deleteRequestApproval,
  getAllRequestApproval,
  findRequestApproval,
};

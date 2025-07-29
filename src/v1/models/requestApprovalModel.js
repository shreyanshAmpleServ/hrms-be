const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const prisma = new PrismaClient();

// Serialize request approval data
const serializeRequestApprovalData = (data) => ({
  request_id: Number(data.request_id),
  approver_id: Number(data.approver_id),
  sequence: Number(data.sequence),
  status: data.status || "Pending",
  action_at: data.action_at ? new Date(data.action_at) : null,
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
          select: { request_id: true, request_type: true, requester_id: true },
        },
        request_approval_approver: {
          select: { id: true, full_name: true, employee_code: true },
        },
      },
    });
    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error creating request approval: ${error.message}`,
      500
    );
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
          select: { request_id: true, request_type: true, requester_id: true },
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
    throw new CustomError(
      `Error deleting request approval: ${error.message}`,
      500
    );
  }
};

// Get all approvals (paginated + searchable)
const getAllRequestApproval = async (
  search,
  page,
  size,
  startDate,
  endDate
) => {
  try {
    page = !page || page == 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size;

    const filters = {};
    if (search) {
      filters.OR = [
        {
          request_approval_request: {
            request_type: { contains: search.toLowerCase() },
          },
        },
        {
          request_approval_approver: {
            full_name: { contains: search.toLowerCase() },
          },
        },
        { status: { contains: search.toLowerCase() } },
      ];
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        filters.createdate = { gte: start, lte: end };
      }
    }

    const datas = await prisma.hrms_d_requests_approval.findMany({
      where: filters,
      skip,
      take: size,
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
      include: {
        request_approval_request: {
          select: { request_id: true, request_type: true, requester_id: true },
        },
        request_approval_approver: {
          select: { id: true, full_name: true, employee_code: true },
        },
      },
    });

    const totalCount = await prisma.hrms_d_requests_approval.count({
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
          select: { request_id: true, request_type: true, requester_id: true },
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

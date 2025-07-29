const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const prisma = new PrismaClient();

// Serialize approval workflow data
const serializeApprovalWorkFlowData = (data) => ({
  request_type: data.request_type || "",
  sequence: data.sequence ? Number(data.sequence) : 1,
  approver_id: Number(data.approver_id),
  is_active: data.is_active || "",
});

// Create a new approval workflow
const createApprovalWorkFlow = async (data) => {
  try {
    const reqData = await prisma.hrms_d_approval_work_flow.create({
      data: {
        ...serializeApprovalWorkFlowData(data),
        createdby: data.createdby || 1,
        createdate: new Date(),
        log_inst: data.log_inst ? Number(data.log_inst) : 1,
      },
      include: {
        approval_work_approver: true, // include related employee (approver)
      },
    });
    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error creating approval workflow: ${error.message}`,
      500
    );
  }
};

// Find approval workflow by ID
const findApprovalWorkFlow = async (id) => {
  try {
    const reqData = await prisma.hrms_d_approval_work_flow.findUnique({
      where: { workflow_id: parseInt(id) },
      include: {
        approval_work_approver: true,
      },
    });
    if (!reqData) {
      throw new CustomError("Approval workflow not found", 404);
    }
    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error finding approval workflow by ID: ${error.message}`,
      503
    );
  }
};

// Update approval workflow
const updateApprovalWorkFlow = async (id, data) => {
  try {
    const updatedEntry = await prisma.hrms_d_approval_work_flow.update({
      where: { workflow_id: parseInt(id) },
      data: {
        ...serializeApprovalWorkFlowData(data),
        updatedby: data.updatedby || 1,
        updatedate: new Date(),
      },
      include: {
        approval_work_approver: true,
      },
    });
    return updatedEntry;
  } catch (error) {
    throw new CustomError(
      `Error updating approval workflow: ${error.message}`,
      500
    );
  }
};

// Delete approval workflow
const deleteApprovalWorkFlow = async (id) => {
  try {
    await prisma.hrms_d_approval_work_flow.delete({
      where: { workflow_id: parseInt(id) },
    });
  } catch (error) {
    throw new CustomError(
      `Error deleting approval workflow: ${error.message}`,
      500
    );
  }
};

// Get all approval workflows with relation
const getAllApprovalWorkFlow = async (
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
        { request_type: { contains: search, mode: "insensitive" } },
        { is_active: { contains: search, mode: "insensitive" } },
      ];
    }
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        filters.createdate = { gte: start, lte: end };
      }
    }

    const datas = await prisma.hrms_d_approval_work_flow.findMany({
      where: filters,
      skip,
      take: size,
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
      include: {
        approval_work_approver: true,
      },
    });
    const totalCount = await prisma.hrms_d_approval_work_flow.count({
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
    throw new CustomError("Error retrieving approval workflows", 503);
  }
};

module.exports = {
  createApprovalWorkFlow,
  findApprovalWorkFlow,
  updateApprovalWorkFlow,
  deleteApprovalWorkFlow,
  getAllApprovalWorkFlow,
};

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
// const createApprovalWorkFlow = async (data) => {
//   try {
//     const reqData = await prisma.hrms_d_approval_work_flow.create({
//       data: {
//         ...serializeApprovalWorkFlowData(data),
//         createdby: data.createdby || 1,
//         createdate: new Date(),
//         log_inst: data.log_inst ? Number(data.log_inst) : 1,
//       },
//       include: {
//         approval_work_approver: {
//           select: {
//             id: true,
//             employee_code: true,
//             full_name: true,
//           },
//         },
//       },
//     });
//     return reqData;
//   } catch (error) {
//     throw new CustomError(
//       `Error creating approval workflow: ${error.message}`,
//       500
//     );
//   }
// };

const createApprovalWorkFlow = async (dataArray) => {
  try {
    if (!Array.isArray(dataArray)) {
      throw new CustomError("Input must be an array of data objects", 400);
    }

    const results = [];

    for (const data of dataArray) {
      const result = await prisma.hrms_d_approval_work_flow.create({
        data: {
          ...serializeApprovalWorkFlowData(data),
          createdby: data.createdby || 1,
          createdate: new Date(),
          log_inst: data.log_inst ? Number(data.log_inst) : 1,
        },
        include: {
          approval_work_approver: {
            select: {
              id: true,
              employee_code: true,
              full_name: true,
            },
          },
        },
      });

      results.push(result);
    }

    return results;
  } catch (error) {
    throw new CustomError(
      `Error creating approval workflows: ${error.message}`,
      500
    );
  }
};

const findApprovalWorkFlow = async (id) => {
  try {
    const reqData = await prisma.hrms_d_approval_work_flow.findUnique({
      where: { workflow_id: parseInt(id) },
      include: {
        approval_work_approver: {
          select: {
            id: true,
            employee_code: true,
            full_name: true,
          },
        },
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
        approval_work_approver: {
          select: {
            id: true,
            employee_code: true,
            full_name: true,
          },
        },
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

const deleteApprovalWorkFlow = async (requestType) => {
  try {
    await prisma.hrms_d_approval_work_flow.deleteMany({
      where: { request_type: requestType },
    });
  } catch (error) {
    throw new CustomError(
      `Error deleting approval workflow: ${error.message}`,
      500
    );
  }
};

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

    const workflows = await prisma.hrms_d_approval_work_flow.findMany({
      where: filters,
      skip,
      take: size,
      orderBy: [{ request_type: "asc" }, { sequence: "asc" }],
      include: {
        approval_work_approver: {
          select: {
            id: true,
            full_name: true,
            employee_code: true,
          },
        },
      },
    });

    const totalCount = await prisma.hrms_d_approval_work_flow.count({
      where: filters,
    });

    // Group by request_type
    const grouped = {};
    for (const wf of workflows) {
      const type = wf.request_type;
      if (!grouped[type]) {
        grouped[type] = {
          request_type: type,
          no_of_approvers: 0,
          is_active: wf.is_active,
          request_approval_request: [],
        };
      }

      grouped[type].request_approval_request.push({
        id: wf.id,
        request_type: wf.request_type,
        sequence: wf.sequence,
        approver_id: wf.approver_id,
        is_active: wf.is_active,
        createdate: wf.createdate,
        createdby: wf.createdby,
        updatedate: wf.updatedate,
        updatedby: wf.updatedby,
        log_inst: wf.log_inst,
        approval_work_approver: {
          id: wf.approval_work_approver?.id || null,
          name: wf.approval_work_approver?.full_name || null,
          employee_code: wf.approval_work_approver?.employee_code || null,
        },
      });

      grouped[type].no_of_approvers += 1;
    }

    return {
      data: Object.values(grouped),
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

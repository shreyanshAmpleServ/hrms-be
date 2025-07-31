const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const { log } = require("winston");
const prisma = new PrismaClient();

const serializeRequestsData = (data) => ({
  requester_id: Number(data.requester_id),
  request_type: data.request_type || null,
  request_data: data.request_data || null,
  status: data.status || "N",
});

// const createRequest = async (data) => {
//   const { children = [], ...parentData } = data;
//   try {
//     if (parentData.request_type) {
//       const existingRequest = await prisma.hrms_d_requests.findFirst({
//         where: { request_type: parentData.request_type },
//       });
//       if (existingRequest) {
//         throw new CustomError(
//           `Request type '${parentData.request_type}' already exists`,
//           400
//         );
//       }
//     }

//     const reqData = await prisma.hrms_d_requests.create({
//       data: {
//         ...serializeRequestsData(parentData),
//         createdby: parentData.createdby || 1,
//         createdate: new Date(),
//         log_inst: parentData.log_inst || 1,
//       },
//     });

//     if (children.length > 0) {
//       const approvalsToInsert = children.map((child, index) => ({
//         request_id: reqData.id,
//         approver_id: Number(child.approver_id),
//         sequence: Number(child.sequence) || index + 1,
//         status: child.status || "Pending",
//         action_at: child.action_at ? new Date(child.action_at) : null,
//         createdby: parentData.createdby || 1,
//         createdate: new Date(),
//         updatedby: parentData.updatedby || null,
//         updatedate: new Date(),
//         log_inst: parentData.log_inst || 1,
//       }));
//       console.log("reqData =>", reqData);

//       await prisma.hrms_d_requests_approval.createMany({
//         data: approvalsToInsert,
//       });
//     }

//     const fullData = await prisma.hrms_d_requests.findUnique({
//       where: { id: reqData.id },
//       include: {
//         requests_employee: {
//           select: {
//             id: true,
//             full_name: true,
//             employee_code: true,
//           },
//         },
//         request_approval_request: {
//           select: {
//             id: true,
//             request_id: true,
//             approver_id: true,
//             sequence: true,
//             status: true,
//             action_at: true,
//             createdate: true,
//             createdby: true,
//             updatedate: true,
//             updatedby: true,
//             log_inst: true,
//             request_approval_approver: {
//               select: {
//                 id: true,
//                 full_name: true,
//                 employee_code: true,
//               },
//             },
//           },
//         },
//       },
//     });

//     return {
//       ...fullData,
//     };
//   } catch (error) {
//     throw new CustomError(`Error creating request model ${error.message}`, 500);
//   }
// };

const createRequest = async (data) => {
  const { request_type, ...parentData } = data;
  try {
    if (!request_type) throw new CustomError("request_type is required", 400);

    const reqData = await prisma.hrms_d_requests.create({
      data: {
        ...serializeRequestsData({ request_type, ...parentData }),
        createdby: parentData.createdby || 1,
        createdate: new Date(),
        log_inst: parentData.log_inst || 1,
      },
    });

    const workflowSteps = await prisma.hrms_d_approval_work_flow.findMany({
      where: { request_type },
      orderBy: { sequence: "asc" },
    });

    if (!workflowSteps || workflowSteps.length === 0) {
      throw new CustomError(
        `No approval workflow defined for '${request_type}'`,
        400
      );
    }

    const approvalsToInsert = workflowSteps.map((step) => ({
      request_id: Number(reqData.id),
      approver_id: Number(step.approver_id),
      sequence: Number(step.sequence) || 1,
      status: "Pending",
      createdby: Number(parentData.createdby) || 1,
      createdate: new Date(),
      log_inst: Number(parentData.log_inst) || 1,
    }));
    if (
      approvalsToInsert.some((a) => isNaN(a.request_id) || isNaN(a.approver_id))
    ) {
      throw new CustomError("Approval step has invalid data (NaN values)", 400);
    }

    await prisma.hrms_d_requests_approval.createMany({
      data: approvalsToInsert,
    });

    // Fetch full result with joins
    const fullData = await prisma.hrms_d_requests.findUnique({
      where: { id: reqData.id },
      include: {
        requests_employee: {
          select: { id: true, full_name: true, employee_code: true },
        },
        request_approval_request: {
          select: {
            id: true,
            request_id: true,
            approver_id: true,
            sequence: true,
            status: true,
            action_at: true,
            createdate: true,
            createdby: true,
            updatedate: true,
            updatedby: true,
            log_inst: true,
            request_approval_approver: {
              select: { id: true, full_name: true, employee_code: true },
            },
          },
        },
      },
    });

    return fullData;
  } catch (error) {
    // console.log("Error", error);
    console.log(error);

    throw new CustomError(
      `Error creating request model: ${error.message}`,
      500
    );
  }
};
// const updateRequests = async (id, data) => {
//   try {
//     const { children = [], ...parentData } = data;

//     const existing = await prisma.hrms_d_requests.findUnique({
//       where: { id: parseInt(id) },
//     });

//     if (!existing) {
//       throw new CustomError(`Request with ID ${id} not found`, 404);
//     }

//     if (
//       parentData.request_type &&
//       parentData.request_type !== existing.request_type
//     ) {
//       const duplicate = await prisma.hrms_d_requests.findFirst({
//         where: {
//           request_type: parentData.request_type,
//           NOT: { id: parseInt(id) },
//         },
//       });
//       if (duplicate) {
//         throw new CustomError(
//           `Request type '${parentData.request_type}' already exists`,
//           400
//         );
//       }
//     }

//     const updatedEntry = await prisma.hrms_d_requests.update({
//       where: { id: parseInt(id) },
//       data: {
//         ...serializeRequestsData(parentData),
//         updatedby: parentData.updatedby || 1,
//         updatedate: new Date(),
//       },
//     });

//     for (const child of children) {
//       if (child.id) {
//         await prisma.hrms_d_requests_approval.update({
//           where: { id: Number(child.id) },
//           data: {
//             approver_id: Number(child.approver_id),
//             sequence: Number(child.sequence),
//             status: child.status || "Pending",
//             action_at: child.action_at ? new Date(child.action_at) : null,
//             updatedby: parentData.updatedby || 1,
//             updatedate: new Date(),
//           },
//         });
//       } else {
//         await prisma.hrms_d_requests_approval.create({
//           data: {
//             request_id: parseInt(id),
//             approver_id: Number(child.approver_id),
//             sequence: Number(child.sequence),
//             status: child.status || "Pending",
//             action_at: child.action_at ? new Date(child.action_at) : null,
//             createdby: parentData.createdby || 1,
//             createdate: new Date(),
//             updatedby: parentData.updatedby || null,
//             updatedate: new Date(),
//             log_inst: parentData.log_inst || 1,
//           },
//         });
//       }
//     }

//     const fullData = await prisma.hrms_d_requests.findUnique({
//       where: { id: parseInt(id) },
//       include: {
//         requests_employee: {
//           select: {
//             id: true,
//             full_name: true,
//             employee_code: true,
//           },
//         },
//         request_approval_request: {
//           select: {
//             id: true,
//             request_id: true,
//             approver_id: true,
//             sequence: true,
//             status: true,
//             action_at: true,
//             createdate: true,
//             createdby: true,
//             updatedate: true,
//             updatedby: true,
//             log_inst: true,
//             request_approval_approver: {
//               select: {
//                 id: true,
//                 full_name: true,
//                 employee_code: true,
//               },
//             },
//           },
//         },
//       },
//     });

//     return fullData;
//   } catch (error) {
//     throw new CustomError(`Error updating request: ${error.message}`, 500);
//   }
// };

const updateRequests = async (id, data) => {
  try {
    const { children = [], ...parentData } = data;

    const existing = await prisma.hrms_d_requests.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existing) {
      throw new CustomError(`Request with ID ${id} not found`, 404);
    }

    if (
      parentData.request_type &&
      parentData.request_type.trim() !== "" &&
      parentData.request_type !== existing.request_type
    ) {
      const duplicate = await prisma.hrms_d_requests.findFirst({
        where: {
          request_type: parentData.request_type,
          NOT: { id: parseInt(id) },
        },
      });
      if (duplicate) {
        throw new CustomError(
          `Request type '${parentData.request_type}' already exists`,
          400
        );
      }
    }

    const updatedEntry = await prisma.hrms_d_requests.update({
      where: { id: parseInt(id) },
      data: {
        ...serializeRequestsData(parentData),
        updatedby: parentData.updatedby || 1,
        updatedate: new Date(),
      },
    });

    for (const child of children) {
      if (child.id) {
        await prisma.hrms_d_requests_approval.update({
          where: { id: Number(child.id) },
          data: {
            approver_id: Number(child.approver_id),
            sequence: Number(child.sequence),
            status: child.status || "Pending",
            action_at: child.action_at ? new Date(child.action_at) : null,
            updatedby: parentData.updatedby || 1,
            updatedate: new Date(),
          },
        });
      } else {
        await prisma.hrms_d_requests_approval.create({
          data: {
            request_id: parseInt(id),
            approver_id: Number(child.approver_id),
            sequence: Number(child.sequence),
            status: child.status || "Pending",
            action_at: child.action_at ? new Date(child.action_at) : null,
            createdby: parentData.createdby || 1,
            createdate: new Date(),
            updatedby: parentData.updatedby || null,
            updatedate: new Date(),
            log_inst: parentData.log_inst || 1,
          },
        });
      }
    }

    const fullData = await prisma.hrms_d_requests.findUnique({
      where: { id: parseInt(id) },
      include: {
        requests_employee: {
          select: {
            id: true,
            full_name: true,
            employee_code: true,
          },
        },
        request_approval_request: {
          select: {
            id: true,
            request_id: true,
            approver_id: true,
            sequence: true,
            status: true,
            action_at: true,
            createdate: true,
            createdby: true,
            updatedate: true,
            updatedby: true,
            log_inst: true,
            request_approval_approver: {
              select: {
                id: true,
                full_name: true,
                employee_code: true,
              },
            },
          },
        },
      },
    });

    return fullData;
  } catch (error) {
    throw new CustomError(`Error updating request: ${error.message}`, 500);
  }
};

const deleteRequests = async (id) => {
  try {
    await prisma.hrms_d_requests_approval.deleteMany({
      where: { request_id: parseInt(id) },
    });

    await prisma.hrms_d_requests.delete({
      where: { id: parseInt(id) }, // ✅ fixed here
    });

    return {
      success: true,
      message: "Request and its approvals deleted successfully",
    };
  } catch (error) {
    throw new CustomError(`Error deleting requets: ${error.message}`, 500);
  }
};

const getAllRequests = async (search, page, size, startDate, endDate) => {
  try {
    page = !page || page == 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size || 0;

    const filters = {};
    if (search) {
      filters.OR = [
        { request_type: { contains: search.toLowerCase() } },
        { request_data: { contains: search.toLowerCase() } },
      ];
    }
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        filters.createdate = { gte: start, lte: end };
      }
    }

    const datas = await prisma.hrms_d_requests.findMany({
      where: filters,
      skip,
      take: size,
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
      include: {
        requests_employee: {
          select: {
            id: true,
            full_name: true,
            employee_code: true,
          },
        },
        request_approval_request: {
          select: {
            id: true,
            request_id: true,
            approver_id: true,
            sequence: true,
            status: true,
            action_at: true,
            createdate: true,
            createdby: true,
            updatedate: true,
            updatedby: true,
            log_inst: true,
            request_approval_approver: {
              select: {
                id: true,
                full_name: true,
                employee_code: true,
              },
            },
          },
        },
      },
    });

    const totalCount = await prisma.hrms_d_requests.count({ where: filters });

    return {
      data: datas,
      currentPage: page,
      size,
      totalPages: Math.ceil(totalCount / size),
      totalCount,
    };
  } catch (error) {
    throw new CustomError("Error retrieving requests", 503);
  }
};

const findRequests = async (request_id) => {
  try {
    const reqData = await prisma.hrms_d_requests.findUnique({
      where: { request_id: parseInt(request_id) },
    });
    if (!reqData) {
      throw new CustomError("Request not found", 404);
    }
    return reqData;
  } catch (error) {
    throw new CustomError(`Error finding Request by ID: ${error.message}`, 503);
  }
};

const findRequestByRequestTypeAndReferenceId = async (request) => {
  try {
    const reqData = await prisma.hrms_d_requests.findFirst({
      where: {
        request_type: parseInt(request.requestType),
        reference_id: parseInt(request.referenceId),
      },
    });
    if (!reqData) {
      throw new CustomError("Request not found", 404);
    }
    return reqData;
  } catch (error) {
    logger.error(error);
    throw new CustomError(`Error finding Request by ID: ${error.message}`, 503);
  }
};

const takeActionOnRequest = async ({
  request_id,
  approver_id,
  action,
  acted_by,
}) => {
  try {
    const approval = await prisma.hrms_d_requests_approval.findFirst({
      where: {
        request_id: Number(request_id),
        approver_id: Number(approver_id),
        status: "Pending",
      },
    });

    if (!approval) {
      throw new CustomError("No pending approval found for this approver", 404);
    }

    await prisma.hrms_d_requests_approval.update({
      where: { id: approval.id },
      data: {
        status: action === "approve" ? "Approved" : "Rejected",
        action_at: new Date(),
        updatedby: acted_by || approver_id,
        updatedate: new Date(),
      },
    });

    // Get reference_id from the request
    const request = await prisma.hrms_d_requests.findUnique({
      where: { id: Number(request_id) },
    });

    const reference_id = request?.reference_id;

    if (action === "reject") {
      // Update request
      await prisma.hrms_d_requests.update({
        where: { id: Number(request_id) },
        data: {
          status: "Rejected",
          updatedby: acted_by || approver_id,
          updatedate: new Date(),
        },
      });

      // Update linked leave
      if (reference_id) {
        await prisma.hrms_d_leave_application.update({
          where: { id: reference_id },
          data: {
            status: "R", // Rejected
            approval_date: new Date(),
            approver_id: approver_id,
            updatedby: acted_by || approver_id,
            updatedate: new Date(),
          },
        });
      }

      return { message: "Request rejected and leave marked as rejected." };
    }

    // Check if there are more pending approvers
    const nextApprover = await prisma.hrms_d_requests_approval.findFirst({
      where: {
        request_id: Number(request_id),
        status: "Pending",
      },
      orderBy: { sequence: "asc" },
    });

    if (!nextApprover) {
      // Final approval
      await prisma.hrms_d_requests.update({
        where: { id: Number(request_id) },
        data: {
          status: "Approved",
          updatedby: acted_by || approver_id,
          updatedate: new Date(),
        },
      });

      // Update linked leave
      if (reference_id) {
        await prisma.hrms_d_leave_application.update({
          where: { id: reference_id },
          data: {
            status: "A", // Approved
            approval_date: new Date(),
            approver_id: approver_id,
            updatedby: acted_by || approver_id,
            updatedate: new Date(),
          },
        });
      }

      return {
        message: "All approvers have approved. Request and leave are approved.",
      };
    }

    return {
      message: `Approval recorded. Notified next approver (ID: ${nextApprover.approver_id}).`,
    };
  } catch (error) {
    throw new CustomError(`Error in approval flow: ${error.message}`, 500);
  }
};

module.exports = {
  createRequest,
  deleteRequests,
  updateRequests,
  findRequests,
  getAllRequests,
  takeActionOnRequest,
  findRequestByRequestTypeAndReferenceId,
};

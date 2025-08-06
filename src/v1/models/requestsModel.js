const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const { log } = require("winston");
const logger = require("../../Comman/logger");
const prisma = new PrismaClient();
const sendEmail = require("../../utils/mailer.js");
const emailTemplates = require("../../utils/emailTemplates.js");

const serializeRequestsData = (data) => ({
  requester_id: Number(data.requester_id),
  request_type: data.request_type || null,
  request_data: data.request_data || null,
  status: data.status || "P",
  reference_id: data.reference_id ? Number(data.reference_id) : null,
});

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
      status: "P",
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

const getAllRequests = async (
  search,
  page,
  size,
  startDate,
  endDate,
  requestType,
  status
) => {
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

    if (requestType) {
      filters.request_type = { equals: requestType };
    }

    if (status) {
      filters.status = { equals: status.toUpperCase() };
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
    throw new CustomError(` ${error.message}`, 503);
  }
};

const findRequestByRequestTypeAndReferenceId = async (request) => {
  try {
    const reqData = await prisma.hrms_d_requests.findFirst({
      where: {
        request_type: request.request_type,
        reference_id: parseInt(request.reference_id),
      },
      include: {
        request_approval_request: true,
      },
    });
    return reqData || {};
  } catch (error) {
    throw new CustomError(`Error finding Request by ID: ${error.message}`, 503);
  }
};

const findRequestByRequestUsers = async (
  search = "",
  page = 1,
  size = 10,
  employee_id,
  requestType = "",
  status = "",
  requester_id,
  startDate,
  endDate
) => {
  page = !page || page == 0 ? 1 : page;
  size = size || 10;
  const skip = (page - 1) * size || 0;

  const filters = {};

  if (search) {
    filters.OR = [
      {
        request_type: { contains: search.toLowerCase() },
      },
      {
        request_data: { contains: search.toLowerCase() },
      },
    ];
  }

  if (requestType) {
    filters.request_type = { equals: requestType };
  }

  if (status) {
    filters.status = { equals: status.toUpperCase() };
  }

  if (requester_id) {
    filters.requester_id = { equals: requester_id };
  }

  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
      filters.createdate = { gte: start, lte: end };
    }
  }

  try {
    const reqData = await prisma.hrms_d_requests.findMany({
      where: filters,
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
      include: {
        requests_employee: {
          select: {
            id: true,
            full_name: true,
            employee_code: true,
            profile_pic: true,
            createdate: true,
          },
        },
        request_approval_request: {
          orderBy: { sequence: "asc" },
          select: {
            id: true,
            request_id: true,
            approver_id: true,
            sequence: true,
            status: true,
            action_at: true,
            createdate: true,
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

    let data = [];

    await Promise.all(
      reqData.map(async (request) => {
        const requestType = request.request_type;
        const referenceId = request.reference_id;
        if (requestType === "leave_request" && referenceId) {
          const leaveRequest = await prisma.hrms_d_leave_application.findUnique(
            {
              where: { id: parseInt(referenceId) },
              select: {
                id: true,
                status: true,
                leave_type_id: true,
                start_date: true,
                end_date: true,
                reason: true,
                leave_types: {
                  select: {
                    id: true,
                    leave_type: true,
                  },
                },
              },
            }
          );
          if (leaveRequest) {
            data.push({
              ...request,
              createdate: request.createdate,
              reference: leaveRequest,
            });
          }
        }
        if (requestType === "loan_request" && referenceId) {
          const loanRequest = await prisma.hrms_d_loan_request.findUnique({
            where: { id: parseInt(referenceId) },
            select: {
              id: true,
              status: true,
              amount: true,
              emi_months: true,
              currency: true,
              loan_req_employee: {
                select: {
                  id: true,
                  full_name: true,
                  employee_code: true,
                },
              },
              loan_req_currency: {
                select: {
                  id: true,
                  currency_code: true,
                  currency_name: true,
                },
              },
              loan_emi_loan_request: {
                select: {
                  id: true,
                  due_month: true,
                  due_year: true,
                  emi_amount: true,
                  status: true,
                  payslip_id: true,
                },
              },
              loan_types: {
                select: {
                  id: true,
                  loan_name: true,
                },
              },
            },
          });
          if (loanRequest) {
            data.push({
              ...request,
              createdate: request.createdate,
              reference: loanRequest,
            });
          }
        }
        if (requestType === "advance_request" && referenceId) {
          const advancePayment =
            await prisma.hrms_d_advance_payment_entry.findUnique({
              where: { id: parseInt(referenceId) },
              select: {
                id: true,
                employee_id: true,
                request_date: true,
                amount_requested: true,
                amount_approved: true,
                approval_status: true,
                approval_date: true,
                approved_by: true,
                reason: true,
                repayment_schedule: true,
                hrms_advance_payement_entry_employee: {
                  select: {
                    id: true,
                    full_name: true,
                    employee_code: true,
                    employee_currency: {
                      select: {
                        id: true,
                        currency_code: true,
                        currency_name: true,
                      },
                    },
                  },
                },
                hrms_advance_payement_entry_approvedBy: {
                  select: {
                    id: true,
                    full_name: true,
                  },
                },
              },
            });
          if (advancePayment) {
            data.push({
              ...request,
              createdate: request.createdate,
              reference: advancePayment,
            });
          }
        }
        if (requestType === "asset_request" && referenceId) {
          const assetRequest = await prisma.hrms_d_asset_assignment.findUnique({
            where: { id: parseInt(referenceId) },
            select: {
              id: true,
              asset_type_id: true,
              asset_name: true,
              serial_number: true,
              issued_on: true,
              returned_on: true,
              status: true,
              asset_assignment_employee: {
                select: {
                  id: true,
                  full_name: true,
                  employee_code: true,
                },
              },
              asset_assignment_type: {
                select: {
                  id: true,
                  id: true,
                  asset_type_name: true,
                  depreciation_rate: true,
                },
              },
            },
          });
          if (assetRequest) {
            data.push({
              ...request,
              createdate: request.createdate,
              reference: assetRequest,
            });
          }
        }
        if (requestType === "probation_review" && referenceId) {
          const probationRequest =
            await prisma.hrms_d_probation_review.findUnique({
              where: { id: parseInt(referenceId) },
              select: {
                id: true,
                employee_id: true,
                probation_end_date: true,
                review_notes: true,
                confirmation_status: true,
                confirmation_date: true,
                reviewer_id: true,
                review_meeting_date: true,
                performance_rating: true,
                extension_required: true,
                extension_reason: true,
                extended_till_date: true,
                next_review_date: true,
                final_remarks: true,
                probation_review_employee: {
                  select: {
                    id: true,
                    employee_code: true,
                    full_name: true,
                  },
                },
                probation_reviewer: {
                  select: {
                    id: true,
                    employee_code: true,
                    full_name: true,
                  },
                },
              },
            });
          if (probationRequest) {
            data.push({
              ...request,
              createdate: request.createdate,
              reference: probationRequest,
            });
          }
        }
        if (requestType === "appraisal_review" && referenceId) {
          const appraisalRequest = await prisma.hrms_d_appraisal.findUnique({
            where: { id: parseInt(referenceId) },
            select: {
              id: true,
              employee_id: true,
              review_period: true,
              rating: true,
              reviewer_comments: true,
              appraisal_employee: {
                select: {
                  full_name: true,
                  id: true,
                },
              },
            },
          });
          if (appraisalRequest) {
            data.push({
              ...request,
              createdate: request.createdate,
              reference: appraisalRequest,
            });
          }
        }
        if (requestType === "leave_encashment" && referenceId) {
          const leaveEncashmentRequest =
            await prisma.hrms_d_leave_encashment.findUnique({
              where: { id: parseInt(referenceId) },
              select: {
                id: true,
                employee_id: true,
                leave_type_id: true,
                leave_days: true,
                encashment_amount: true,
                approval_status: true,
                encashment_date: true,
                basic_salary: true,
                payroll_period: true,
                total_amount: true,
                entitled: true,
                total_available: true,
                used: true,
                balance: true,
                requested: true,
                requested_date: true,
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
          if (leaveEncashmentRequest) {
            data.push({
              ...request,
              createdate: request.createdate,
              reference: leaveEncashmentRequest,
            });
          }
        }
      })
    );
    data.sort((a, b) => new Date(b.createdate) - new Date(a.createdate));
    const filteredData = data.filter((request) => {
      const approvals = request.request_approval_request;
      const approverIndex = approvals.findIndex(
        (approval) =>
          approval.approver_id === employee_id &&
          (status === "" || approval.status === status)
      );
      if (approverIndex === -1) return false;
      if (approverIndex === 0) return true;
      const prevApproval = approvals[approverIndex - 1];
      return prevApproval?.status === "A";
    });
    const slideData = filteredData.slice(skip, skip + size);
    return {
      data: slideData,
      currentPage: page,
      size,
      totalPages: Math.ceil(filteredData.length / size),
      totalCount: filteredData.length,
    };
  } catch (error) {
    throw new CustomError(`${error.message}`, 503);
  }
};

// IInd  - new modified
//II.1
// const takeActionOnRequest = async ({
//   request_id,
//   request_approval_id,
//   action,
//   acted_by,
//   remarks,
// }) => {
//   try {
//     const approval = await prisma.hrms_d_requests_approval.findFirst({
//       where: {
//         request_id: Number(request_id),
//         id: Number(request_approval_id),
//         status: "P",
//       },
//     });

//     if (!approval) {
//       throw new CustomError("No pending approval found for this approver", 404);
//     }

//     await prisma.hrms_d_requests_approval.update({
//       where: { id: approval.id },
//       data: {
//         status: action === "A" ? "A" : "R",
//         remarks: remarks || null,
//         action_at: new Date(),
//         updatedby: acted_by,
//         updatedate: new Date(),
//       },
//     });

//     const request = await prisma.hrms_d_requests.update({
//       where: { id: Number(request_id) },
//       data: {
//         remarks: remarks || null,
//         updatedate: new Date(),
//         updatedby: acted_by,
//       },
//     });

//     if (action === "R") {
//       if (
//         request &&
//         request.request_type === "leave_request" &&
//         request.reference_id
//       ) {
//         await prisma.hrms_d_leave_application.update({
//           where: { id: request.reference_id },
//           data: {
//             status: "R",
//             rejection_reason: remarks || null,
//             updatedby: acted_by,
//             updatedate: new Date(),
//           },
//         });
//       }

//       return { message: "Request rejected and closed." };
//     }

//     const nextApprover = await prisma.hrms_d_requests_approval.findFirst({
//       where: {
//         request_id: Number(request_id),
//         status: "P",
//       },
//       orderBy: { sequence: "asc" },
//     });

//     if (!nextApprover) {
//       await prisma.hrms_d_requests.update({
//         where: { id: request_id },
//         data: {
//           status: "A",
//           updatedate: new Date(),
//           updatedby: acted_by,
//         },
//       });

//       if (
//         request &&
//         request.request_type === "leave_request" &&
//         request.reference_id
//       ) {
//         await prisma.hrms_d_leave_application.update({
//           where: { id: request.reference_id },
//           data: {
//             status: "A",
//             rejection_reason: remarks || null,
//             updatedby: acted_by,
//             updatedate: new Date(),
//           },
//         });
//       }

//       return {
//         message: "All approvers have approved. Request is fully approved.",
//       };
//     }

//     return {
//       // message: `Approval recorded. Notified next approver (ID: ${nextApprover.approver_id}).`,
//       message: `Approval recorded successfully`,
//     };
//   } catch (error) {
//     throw new CustomError(`Error in approval flow: ${error.message}`, 500);
//   }
// };

//II.2
// const takeActionOnRequest = async ({
//   request_id,
//   request_approval_id,
//   action,
//   acted_by,
//   remarks,
// }) => {
//   try {
//     const approval = await prisma.hrms_d_requests_approval.findFirst({
//       where: {
//         request_id: Number(request_id),
//         id: Number(request_approval_id),
//         status: "P",
//       },
//     });

//     if (!approval) {
//       throw new CustomError("No pending approval found for this approver", 404);
//     }

//     await prisma.hrms_d_requests_approval.update({
//       where: { id: approval.id },
//       data: {
//         status: action === "A" ? "A" : "R",
//         remarks: remarks || null,
//         action_at: new Date(),
//         updatedby: acted_by,
//         updatedate: new Date(),
//       },
//     });

//     const request = await prisma.hrms_d_requests.update({
//       where: { id: Number(request_id) },
//       data: {
//         remarks: remarks || null,
//         updatedate: new Date(),
//         updatedby: acted_by,
//       },
//     });

//     if (
//       request &&
//       request.request_type === "leave_request" &&
//       request.reference_id
//     ) {
//       await prisma.hrms_d_leave_application.update({
//         where: { id: request.reference_id },
//         data: {
//           rejection_reason: remarks || null,
//           updatedby: acted_by,
//           updatedate: new Date(),
//         },
//       });
//     }

//     if (action === "R") {
//       await prisma.hrms_d_requests.update({
//         where: { id: Number(request_id) },
//         data: {
//           status: "R",
//           updatedate: new Date(),
//           updatedby: acted_by,
//         },
//       });

//       if (
//         request &&
//         request.request_type === "leave_request" &&
//         request.reference_id
//       ) {
//         await prisma.hrms_d_leave_application.update({
//           where: { id: request.reference_id },
//           data: {
//             status: "R",
//             updatedby: acted_by,
//             updatedate: new Date(),
//           },
//         });
//       }
//       if (
//         request &&
//         request.request_type === "loan_request" &&
//         request.reference_id
//       ) {
//         await prisma.hrms_d_loan_request.update({
//           where: { id: request.reference_id },
//           data: {
//             status: "R",
//             updatedby: acted_by,
//             updatedate: new Date(),
//           },
//         });
//       }

//       return { message: "Request rejected and closed." };
//     }

//     const nextApprover = await prisma.hrms_d_requests_approval.findFirst({
//       where: {
//         request_id: Number(request_id),
//         status: "P",
//       },
//       orderBy: { sequence: "asc" },
//     });

//     if (!nextApprover) {
//       await prisma.hrms_d_requests.update({
//         where: { id: Number(request_id) },
//         data: {
//           status: "A",
//           updatedate: new Date(),
//           updatedby: acted_by,
//         },
//       });

//       if (
//         request &&
//         request.request_type === "leave_request" &&
//         request.reference_id
//       ) {
//         await prisma.hrms_d_leave_application.update({
//           where: { id: request.reference_id },
//           data: {
//             status: "A",
//             updatedby: acted_by,
//             updatedate: new Date(),
//           },
//         });
//       }
//       if (
//         request &&
//         request.request_type === "loan_request" &&
//         request.reference_id
//       ) {
//         await prisma.hrms_d_loan_request.update({
//           where: { id: request.reference_id },
//           data: {
//             status: "A",
//             updatedby: acted_by,
//             updatedate: new Date(),
//           },
//         });
//       }

//       return {
//         message: "All approvers have approved. Request is fully approved.",
//       };
//     }

//     return {
//       message: `Approval recorded successfully`,
//     };
//   } catch (error) {
//     throw new CustomError(`Error in approval flow: ${error.message}`, 500);
//   }
// };

// II.3

const takeActionOnRequest = async ({
  request_id,
  request_approval_id,
  action,
  acted_by,
  remarks,
}) => {
  try {
    const approval = await prisma.hrms_d_requests_approval.findFirst({
      where: {
        request_id: Number(request_id),
        id: Number(request_approval_id),
        status: "P",
      },
    });

    if (!approval) {
      throw new CustomError("No pending approval found for this approver", 404);
    }

    await prisma.hrms_d_requests_approval.update({
      where: { id: approval.id },
      data: {
        status: action === "A" ? "A" : "R",
        remarks: remarks || null,
        action_at: new Date(),
        updatedby: acted_by,
        updatedate: new Date(),
      },
    });

    const request = await prisma.hrms_d_requests.update({
      where: { id: Number(request_id) },
      data: {
        remarks: remarks || null,
        updatedate: new Date(),
        updatedby: acted_by,
      },
    });

    if (request?.reference_id) {
      if (request.request_type === "leave_request") {
        await prisma.hrms_d_leave_application.update({
          where: { id: request.reference_id },
          data: {
            rejection_reason: remarks || null,
            updatedby: acted_by,
            updatedate: new Date(),
          },
        });
      } else if (request.request_type === "loan_request") {
        await prisma.hrms_d_loan_request.update({
          where: { id: request.reference_id },
          data: {
            rejection_reason: remarks || null,
            updatedby: acted_by,
            updatedate: new Date(),
          },
        });
      } else if (request.request_type === "advance_request") {
        await prisma.hrms_d_advance_payment_entry.update({
          where: { id: request.reference_id },
          data: {
            reason: remarks || null,
            updatedby: acted_by,
            updatedate: new Date(),
          },
        });
      } else if (request.request_type === "asset_request") {
        await prisma.hrms_d_asset_assignment.update({
          where: { id: request.reference_id },
          data: {
            updatedby: acted_by,
            updatedate: new Date(),
          },
        });
      } else if (request.request_type === "probation_review") {
        await prisma.hrms_d_probation_review.update({
          where: { id: request.reference_id },
          data: {
            final_remarks: remarks || null,
            updatedby: acted_by,
            updatedate: new Date(),
          },
        });
      } else if (request.request_type === "appraisal_review") {
        await prisma.hrms_d_appraisal.update({
          where: { id: request.reference_id },
          data: {
            reviewer_comments: remarks || null,
            updatedby: acted_by,
            updatedate: new Date(),
          },
        });
      } else if (request.request_type === "leave_encashment") {
        await prisma.hrms_d_leave_encashment.update({
          where: { id: request.reference_id },
          data: {
            updatedby: acted_by,
            updatedate: new Date(),
          },
        });
      }
    }

    if (action === "R") {
      await prisma.hrms_d_requests.update({
        where: { id: Number(request_id) },
        data: {
          status: "R",
          updatedate: new Date(),
          updatedby: acted_by,
        },
      });

      if (request?.reference_id) {
        if (request.request_type === "leave_request") {
          await prisma.hrms_d_leave_application.update({
            where: { id: request.reference_id },
            data: {
              status: "R",
              updatedby: acted_by,
              updatedate: new Date(),
            },
          });
        } else if (request.request_type === "loan_request") {
          await prisma.hrms_d_loan_request.update({
            where: { id: request.reference_id },
            data: {
              status: "R",
              updatedby: acted_by,
              updatedate: new Date(),
            },
          });
        } else if (request.request_type === "advance_request") {
          await prisma.hrms_d_advance_payment_entry.update({
            where: { id: request.reference_id },
            data: {
              approval_status: "R",
              updatedby: acted_by,
              updatedate: new Date(),
            },
          });
        } else if (request.request_type === "asset_request") {
          await prisma.hrms_d_asset_assignment.update({
            where: { id: request.reference_id },
            data: {
              status: "R",
              updatedby: acted_by,
              updatedate: new Date(),
            },
          });
        } else if (request.request_type === "probation_review") {
          await prisma.hrms_d_probation_review.update({
            where: { id: request.reference_id },
            data: {
              confirmation_status: "R",
              updatedby: acted_by,
              updatedate: new Date(),
            },
          });
        } else if (request.request_type === "appraisal_review") {
          await prisma.hrms_d_appraisal.update({
            where: { id: request.reference_id },
            data: {
              status: "R",
              updatedby: acted_by,
              updatedate: new Date(),
            },
          });
        } else if (request.request_type === "leave_encashment") {
          await prisma.hrms_d_leave_encashment.update({
            where: { id: request.reference_id },
            data: {
              approval_status: "R",
              updatedby: acted_by,
              updatedate: new Date(),
            },
          });
        }
      }
      const requester = await prisma.hrms_d_employee.findUnique({
        where: { id: request.requester_id },
        select: { email: true, full_name: true },
      });

      if (requester?.email) {
        const template = emailTemplates.requestRejected({
          fullName: requester.full_name,
          requestType: request.request_type,
          remarks,
        });

        await sendEmail({
          to: requester.email,
          subject: template.subject,
          html: template.html,
          createdby: acted_by,
          log_inst: request.log_inst,
        });
      }

      return { message: "Request rejected and closed." };
    }

    const nextApprover = await prisma.hrms_d_requests_approval.findFirst({
      where: {
        request_id: Number(request_id),
        status: "P",
      },
      orderBy: { sequence: "asc" },
    });

    if (!nextApprover) {
      await prisma.hrms_d_requests.update({
        where: { id: Number(request_id) },
        data: {
          status: "A",
          updatedate: new Date(),
          updatedby: acted_by,
        },
      });

      if (request?.reference_id) {
        if (request.request_type === "leave_request") {
          await prisma.hrms_d_leave_application.update({
            where: { id: request.reference_id },
            data: {
              status: "A",
              updatedby: acted_by,
              updatedate: new Date(),
            },
          });
        } else if (request.request_type === "loan_request") {
          await prisma.hrms_d_loan_request.update({
            where: { id: request.reference_id },
            data: {
              status: "A",
              updatedby: acted_by,
              updatedate: new Date(),
            },
          });
        } else if (request.request_type === "advance_request") {
          await prisma.hrms_d_advance_payment_entry.update({
            where: { id: request.reference_id },
            data: {
              approval_status: "A",
              updatedby: acted_by,
              updatedate: new Date(),
            },
          });
        } else if (request.request_type === "asset_request") {
          await prisma.hrms_d_asset_assignment.update({
            where: { id: request.reference_id },
            data: {
              status: "A",
              updatedby: acted_by,
              updatedate: new Date(),
            },
          });
        } else if (request.request_type === "probation_review") {
          await prisma.hrms_d_probation_review.update({
            where: { id: request.reference_id },
            data: {
              confirmation_status: "A",
              updatedby: acted_by,
              updatedate: new Date(),
            },
          });
        } else if (request.request_type === "appraisal_review") {
          await prisma.hrms_d_appraisal.update({
            where: { id: request.reference_id },
            data: {
              status: "A",
              updatedby: acted_by,
              updatedate: new Date(),
            },
          });
        } else if (request.request_type === "leave_encashment") {
          await prisma.hrms_d_leave_encashment.update({
            where: { id: request.reference_id },
            data: {
              approval_status: "A",
              updatedby: acted_by,
              updatedate: new Date(),
            },
          });
        }
      }
      const requester = await prisma.hrms_d_employee.findUnique({
        where: { id: request.requester_id },
        select: { email: true, full_name: true },
      });

      if (requester?.email) {
        const template = emailTemplates.requestApproved({
          fullName: requester.full_name,
          requestType: request.request_type,
        });

        await sendEmail({
          to: requester.email,
          subject: template.subject,
          html: template.html,
          createdby: acted_by,
          log_inst: request.log_inst,
        });
      }

      return {
        message: "All approvers have approved. Request is fully approved.",
      };
    }

    return {
      message: `Approval recorded successfully`,
    };
  } catch (error) {
    throw new CustomError(`Error in approval flow: ${error.message}`, 500);
  }
};
// III with socket
// const takeActionOnRequest = async ({
//   request_id,
//   request_approval_id,
//   action,
//   acted_by,
//   remarks,
// }) => {
//   try {
//     const approval = await prisma.hrms_d_requests_approval.findFirst({
//       where: {
//         request_id: Number(request_id),
//         id: Number(request_approval_id),
//         status: "P",
//       },
//     });

//     if (!approval) {
//       throw new CustomError("No pending approval found for this approver", 404);
//     }

//     await prisma.hrms_d_requests_approval.update({
//       where: { id: approval.id },
//       data: {
//         status: action === "A" ? "A" : "R",
//         remarks: remarks || null,
//         action_at: new Date(),
//         updatedby: acted_by,
//         updatedate: new Date(),
//       },
//     });

//     const request = await prisma.hrms_d_requests.update({
//       where: { id: Number(request_id) },
//       data: {
//         remarks: remarks || null,
//         updatedate: new Date(),
//         updatedby: acted_by,
//       },
//     });

//     if (action === "R") {
//       if (
//         request &&
//         request.request_type === "leave_request" &&
//         request.reference_id
//       ) {
//         await prisma.hrms_d_leave_application.update({
//           where: { id: request.reference_id },
//           data: {
//             status: "R",
//             remarks: remarks || null,
//             updatedby: acted_by,
//             updatedate: new Date(),
//           },
//         });
//       }

//       global.io.to(`user_${request.requester_id}`).emit("request_update", {
//         request_id,
//         status: "Rejected",
//         message: `Your request has been rejected.`,
//       });

//       return { message: "Request rejected and closed." };
//     }

//     const nextApprover = await prisma.hrms_d_requests_approval.findFirst({
//       where: {
//         request_id: Number(request_id),
//         status: "P",
//       },
//       orderBy: { sequence: "asc" },
//     });

//     if (!nextApprover) {
//       await prisma.hrms_d_requests.update({
//         where: { id: request_id },
//         data: {
//           status: "A",
//           updatedate: new Date(),
//           updatedby: acted_by,
//         },
//       });

//       if (
//         request &&
//         request.request_type === "leave_request" &&
//         request.reference_id
//       ) {
//         await prisma.hrms_d_leave_application.update({
//           where: { id: request.reference_id },
//           data: {
//             status: "A",
//             reason: remarks || null,
//             updatedby: acted_by,
//             updatedate: new Date(),
//           },
//         });
//       }

//       global.io.to(`user_${request.requester_id}`).emit("request_update", {
//         request_id,
//         status: "Approved",
//         message: `Your request has been fully approved.`,
//       });

//       return {
//         message: "All approvers have approved. Request is fully approved.",
//       };
//     }

//     global.io
//       .to(`user_${nextApprover.approver_id}`)
//       .emit("request_approval_pending", {
//         request_id,
//         approver_id: nextApprover.approver_id,
//         message: `You have a new request to approve.`,
//       });

//     return {
//       message: `Approval recorded. Notified next approver (ID: ${nextApprover.approver_id}).`,
//     };
//   } catch (error) {
//     throw new CustomError(`Error in approval flow: ${error.message}`, 500);
//   }
// };

module.exports = {
  createRequest,
  deleteRequests,
  updateRequests,
  findRequests,
  getAllRequests,
  takeActionOnRequest,
  findRequestByRequestUsers,
  findRequestByRequestTypeAndReferenceId,
};

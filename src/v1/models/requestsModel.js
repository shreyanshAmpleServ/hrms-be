const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const prisma = new PrismaClient();
const sendEmail = require("../../utils/mailer.js");
const emailTemplates = require("../../utils/emailTemplates.js");
const getRequestDetailsByType = require("../../utils/getDetails.js");
const { generateEmailContent } = require("../../utils/emailTemplates.js");
const { templateKeyMap } = require("../../utils/templateKeyMap.js");

const formatRequestType = (type) => {
  return type
    .replace(/_/g, " ")
    .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1));
};

const serializeRequestsData = (data) => ({
  requester_id: Number(data.requester_id),
  request_type: data.request_type || null,
  request_data: data.request_data || null,
  status: data.status || "P",
  reference_id: data.reference_id ? Number(data.reference_id) : null,
});

// const createRequest = async (data) => {
//   const { request_type, ...parentData } = data;
//   try {
//     if (!request_type) throw new CustomError("request_type is required", 400);

//     const reqData = await prisma.hrms_d_requests.create({
//       data: {
//         ...serializeRequestsData({ request_type, ...parentData }),
//         createdby: parentData.createdby || 1,
//         createdate: new Date(),
//         log_inst: parentData.log_inst || 1,
//       },
//     });

//     const workflowSteps = await prisma.hrms_d_approval_work_flow.findMany({
//       where: { request_type },
//       orderBy: { sequence: "asc" },
//     });

//     if (!workflowSteps || workflowSteps.length === 0) {
//       throw new CustomError(
//         `No approval workflow defined for '${request_type}'`,
//         400
//       );
//     }

//     const approvalsToInsert = workflowSteps.map((step) => ({
//       request_id: Number(reqData.id),
//       approver_id: Number(step.approver_id),
//       sequence: Number(step.sequence) || 1,
//       status: "P",
//       createdby: Number(parentData.createdby) || 1,
//       createdate: new Date(),
//       log_inst: Number(parentData.log_inst) || 1,
//     }));
//     if (
//       approvalsToInsert.some((a) => isNaN(a.request_id) || isNaN(a.approver_id))
//     ) {
//       throw new CustomError("Approval step has invalid data (NaN values)", 400);
//     }

//     await prisma.hrms_d_requests_approval.createMany({
//       data: approvalsToInsert,
//     });

//     const fullData = await prisma.hrms_d_requests.findUnique({
//       where: { id: reqData.id },
//       include: {
//         requests_employee: {
//           select: { id: true, full_name: true, employee_code: true },
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
//               select: { id: true, full_name: true, employee_code: true },
//             },
//           },
//         },
//       },
//     });

//     const requester = await prisma.hrms_d_employee.findUnique({
//       where: { id: parentData.requester_id },
//       select: { full_name: true },
//     });
//     console.log("parentData.requester_id:", parentData.requester_id);
//     console.log("requester found:", requester);
//     console.log("requester full_name:", requester?.full_name);
//     const firstApproverId = approvalsToInsert[0]?.approver_id;
//     const firstApprover = await prisma.hrms_d_employee.findUnique({
//       where: { id: firstApproverId },
//       select: { email: true, full_name: true },
//     });

//     const company = await prisma.hrms_d_default_configurations.findUnique({
//       where: { id: parentData.log_inst },
//       select: { company_name: true },
//     });
//     const company_name = company?.company_name || "HRMS System";

//     if (firstApprover?.email && requester?.full_name) {
//       const request_detail = await getRequestDetailsByType(
//         request_type,
//         reqData.reference_id
//       );

//       const template = await generateEmailContent(
//         request_type === "interview_stage"
//           ? templateKeyMap.interviewRemark
//           : templateKeyMap.notifyApprover,
//         {
//           employee_name: firstApprover.full_name,
//           approver_name: firstApprover.full_name,
//           requester_name: requester.full_name,
//           request_type: request_type,
//           action: "created",
//           company_name,
//           request_detail,
//           stage_name: parentData.stage_name,
//         }
//       );

//       await sendEmail({
//         to: firstApprover.email,
//         subject: template.subject,
//         html: template.body,
//         createdby: parentData.createdby,
//         log_inst: parentData.log_inst,
//       });

//       console.log(`[Email Sent] → First Approver: ${firstApprover.email}`);
//     }
//     return fullData;
//   } catch (error) {
//     console.log(error);
//     throw new CustomError(
//       `Error creating request model: ${error.message}`,
//       500
//     );
//   }
// };

const getWorkflowForRequest = async (
  request_type,
  requester_department_id,
  requester_designation_id
) => {
  try {
    let workflowSteps;
    let workflowType = "NONE";

    if (requester_department_id) {
      console.log(
        `Looking for workflow: ${request_type} for department: ${requester_department_id}`
      );

      workflowSteps = await prisma.hrms_d_approval_work_flow.findMany({
        where: {
          request_type,
          department_id: requester_department_id,
          designation_id: null,
          is_active: "Y",
        },
        orderBy: { sequence: "asc" },
        include: {
          approval_work_approver: {
            select: {
              id: true,
              full_name: true,
              employee_code: true,
              hrms_employee_department: {
                select: { department_name: true },
              },
            },
          },
          approval_work_department: {
            select: { department_name: true },
          },
        },
      });

      if (workflowSteps && workflowSteps.length > 0) {
        workflowType = "DEPARTMENT-SPECIFIC";
        console.log(
          `Found DEPARTMENT-SPECIFIC workflow with ${workflowSteps.length} approvers`
        );
        return {
          workflow: workflowSteps,
          isGlobalWorkflow: false,
          workflowType,
        };
      } else {
        console.log(
          ` No department-specific workflow found for ${request_type}`
        );
      }
    }
    if (requester_designation_id) {
      console.log(
        `Looking for workflow: ${request_type} for designation: ${requester_designation_id}`
      );

      workflowSteps = await prisma.hrms_d_approval_work_flow.findMany({
        where: {
          request_type,
          designation_id: requester_designation_id,
          department_id: null,
          is_active: "Y",
        },
        orderBy: { sequence: "asc" },
        include: {
          approval_work_approver: {
            select: {
              id: true,
              full_name: true,
              employee_code: true,
              hrms_employee_department: {
                select: { department_name: true },
              },
            },
          },
          approval_work_flow_designation: {
            select: {
              id: true,
              designation_name: true,
            },
          },
        },
      });

      if (workflowSteps && workflowSteps.length > 0) {
        workflowType = "DESIGNATION-SPECIFIC";
        console.log(
          `Found DESIGNATION-SPECIFIC workflow with ${workflowSteps.length} approvers`
        );
        return {
          workflow: workflowSteps,
          isGlobalWorkflow: false,
          workflowType,
        };
      } else {
        console.log(
          ` No designation-specific workflow found for ${request_type}`
        );
      }
    } else if (!requester_department_id) {
      console.log(
        ` Requester has no designation, skipping designation workflow check`
      );
    }

    console.log(
      ` No department-specific or designation-specific workflow found for ${request_type}, falling back to global workflow`
    );

    workflowSteps = await prisma.hrms_d_approval_work_flow.findMany({
      where: {
        request_type,
        department_id: null,
        designation_id: null,
        is_active: "Y",
      },
      orderBy: { sequence: "asc" },
      include: {
        approval_work_approver: {
          select: {
            id: true,
            full_name: true,
            employee_code: true,
            hrms_employee_department: {
              select: { department_name: true },
            },
          },
        },
      },
    });

    workflowType = "GLOBAL";

    console.log(
      `Found ${workflowType} workflow with ${workflowSteps.length} approvers`
    );

    return {
      workflow: workflowSteps,
      isGlobalWorkflow: workflowType === "GLOBAL",
      workflowType,
    };
  } catch (error) {
    throw new CustomError(`Error resolving workflow: ${error.message}`, 500);
  }
};

// const createRequest = async (data) => {
//   const { request_type, ...parentData } = data;

//   try {
//     if (!request_type) throw new CustomError("request_type is required", 400);

//     const requester = await prisma.hrms_d_employee.findUnique({
//       where: { id: parentData.requester_id },
//       select: {
//         department_id: true,
//         full_name: true,
//         hrms_employee_department: {
//           select: {
//             id: true,
//             department_name: true,
//           },
//         },
//       },
//     });

//     if (!requester) {
//       throw new CustomError("Requester not found", 404);
//     }

//     console.log(
//       ` Requester: ${requester.full_name} from ${
//         requester.hrms_employee_department?.department_name || "No Department"
//       }`
//     );

//     const reqData = await prisma.hrms_d_requests.create({
//       data: {
//         ...serializeRequestsData({ request_type, ...parentData }),
//         createdby: parentData.createdby || 1,
//         createdate: new Date(),
//         log_inst: parentData.log_inst || 1,
//       },
//     });

//     const {
//       workflow: workflowSteps,
//       isGlobalWorkflow,
//       workflowType,
//     } = await getWorkflowForRequest(request_type, requester.department_id);

//     if (!workflowSteps || workflowSteps.length === 0) {
//       throw new CustomError(
//         `No approval workflow defined for '${request_type}'${
//           requester.department_id
//             ? ` in department ${requester.hrms_employee_department?.department_name}`
//             : ""
//         } and no global fallback available`,
//         400
//       );
//     }

//     console.log(` Using ${workflowType} workflow for ${request_type}`);
//     if (!isGlobalWorkflow && requester.hrms_employee_department) {
//       console.log(
//         ` Department: ${requester.hrms_employee_department.department_name}`
//       );
//     }

//     const approvalsToInsert = workflowSteps.map((step, index) => ({
//       request_id: Number(reqData.id),
//       approver_id: Number(step.approver_id),
//       sequence: Number(step.sequence) || index + 1,
//       status: "P",
//       createdby: Number(parentData.createdby) || 1,
//       createdate: new Date(),
//       log_inst: Number(parentData.log_inst) || 1,
//     }));

//     if (
//       approvalsToInsert.some((a) => isNaN(a.request_id) || isNaN(a.approver_id))
//     ) {
//       throw new CustomError("Approval step has invalid data (NaN values)", 400);
//     }

//     await prisma.hrms_d_requests_approval.createMany({
//       data: approvalsToInsert,
//     });

//     console.log(` Created ${approvalsToInsert.length} approval steps`);

//     const fullData = await prisma.hrms_d_requests.findUnique({
//       where: { id: reqData.id },
//       include: {
//         requests_employee: {
//           select: {
//             id: true,
//             full_name: true,
//             employee_code: true,
//             hrms_employee_department: {
//               select: {
//                 id: true,
//                 department_name: true,
//               },
//             },
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
//                 hrms_employee_department: {
//                   select: {
//                     id: true,
//                     department_name: true,
//                   },
//                 },
//               },
//             },
//           },
//           orderBy: { sequence: "asc" },
//         },
//       },
//     });

//     const firstApproverId = approvalsToInsert[0]?.approver_id;
//     const firstApprover = await prisma.hrms_d_employee.findUnique({
//       where: { id: firstApproverId },
//       select: {
//         email: true,
//         full_name: true,
//         hrms_employee_department: {
//           select: { department_name: true },
//         },
//       },
//     });

//     const company = await prisma.hrms_d_default_configurations.findUnique({
//       where: { id: parentData.log_inst },
//       select: { company_name: true },
//     });
//     const company_name = company?.company_name || "HRMS System";

//     if (firstApprover?.email && requester?.full_name) {
//       const request_detail = await getRequestDetailsByType(
//         request_type,
//         reqData.reference_id
//       );

//       const template = await generateEmailContent(
//         request_type === "interview_stage"
//           ? templateKeyMap.interviewRemark
//           : templateKeyMap.notifyApprover,
//         {
//           employee_name: firstApprover.full_name,
//           approver_name: firstApprover.full_name,
//           requester_name: requester.full_name,
//           request_type: request_type,
//           action: "created",
//           company_name,
//           request_detail,
//           stage_name: parentData.stage_name,
//           workflow_info: isGlobalWorkflow
//             ? "(Global Workflow)"
//             : `(${requester.hrms_employee_department?.department_name} Department Workflow)`,
//           approver_department:
//             firstApprover.hrms_employee_department?.department_name,
//         }
//       );

//       await sendEmail({
//         to: firstApprover.email,
//         subject: template.subject,
//         html: template.body,
//         createdby: parentData.createdby,
//         log_inst: parentData.log_inst,
//       });

//       console.log(
//         ` [Email Sent] ${workflowType} workflow → ${firstApprover.email}`
//       );
//       console.log(
//         `First Approver: ${firstApprover.full_name} (${
//           firstApprover.hrms_employee_department?.department_name || "No Dept"
//         })`
//       );
//     }

//     return fullData;
//   } catch (error) {
//     console.error(" Error creating request:", error);
//     throw new CustomError(`Error creating request: ${error.message}`, 500);
//   }
// };

const createRequest = async (data) => {
  const { request_type, ...parentData } = data;

  try {
    if (!request_type) throw new CustomError("request_type is required", 400);

    const requester = await prisma.hrms_d_employee.findUnique({
      where: { id: parentData.requester_id },
      select: {
        id: true,
        full_name: true,
        department_id: true,
        designation_id: true,
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
    });

    if (!requester) {
      throw new CustomError("Requester not found", 404);
    }

    console.log(
      ` Requester: ${requester.full_name} from ${
        requester.hrms_employee_department?.department_name || "No Department"
      }, Designation: ${
        requester.hrms_employee_designation?.designation_name ||
        "No Designation"
      }`
    );

    const reqData = await prisma.hrms_d_requests.create({
      data: {
        ...serializeRequestsData({ request_type, ...parentData }),
        createdby: parentData.createdby || 1,
        createdate: new Date(),
        log_inst: parentData.log_inst || 1,
      },
    });

    const {
      workflow: workflowSteps,
      isGlobalWorkflow,
      workflowType,
    } = await getWorkflowForRequest(
      request_type,
      requester.department_id,
      requester.designation_id
    );

    if (!workflowSteps || workflowSteps.length === 0) {
      throw new CustomError(
        `No approval workflow defined for '${request_type}'${
          requester.department_id
            ? ` in department ${requester.hrms_employee_department?.department_name}`
            : requester.designation_id
            ? ` for designation ${requester.hrms_employee_designation?.designation_name}`
            : ""
        } and no global fallback available`,
        400
      );
    }

    console.log(` Using ${workflowType} workflow for ${request_type}`);
    if (!isGlobalWorkflow && requester.hrms_employee_department) {
      console.log(
        ` Department: ${requester.hrms_employee_department.department_name}`
      );
    }
    if (!isGlobalWorkflow && requester.hrms_employee_designation) {
      console.log(
        ` Designation: ${requester.hrms_employee_designation.designation_name}`
      );
    }

    const approvalsToInsert = workflowSteps.map((step, index) => ({
      request_id: Number(reqData.id),
      approver_id: Number(step.approver_id),
      sequence: Number(step.sequence) || index + 1,
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

    console.log(` Created ${approvalsToInsert.length} approval steps`);

    const fullData = await prisma.hrms_d_requests.findUnique({
      where: { id: reqData.id },
      include: {
        requests_employee: {
          select: {
            id: true,
            full_name: true,
            employee_code: true,
            hrms_employee_department: {
              select: {
                id: true,
                department_name: true,
              },
            },
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
                hrms_employee_department: {
                  select: {
                    id: true,
                    department_name: true,
                  },
                },
              },
            },
          },
          orderBy: { sequence: "asc" },
        },
      },
    });

    const firstApproverId = approvalsToInsert[0]?.approver_id;
    const firstApprover = await prisma.hrms_d_employee.findUnique({
      where: { id: firstApproverId },
      select: {
        email: true,
        full_name: true,
        hrms_employee_department: {
          select: { department_name: true },
        },
      },
    });

    const company = await prisma.hrms_d_default_configurations.findUnique({
      where: { id: parentData.log_inst },
      select: { company_name: true },
    });
    const company_name = company?.company_name || "HRMS System";

    if (firstApprover?.email && requester?.full_name) {
      const request_detail = await getRequestDetailsByType(
        request_type,
        reqData.reference_id
      );

      const template = await generateEmailContent(
        request_type === "interview_stage"
          ? templateKeyMap.interviewRemark
          : templateKeyMap.notifyApprover,
        {
          employee_name: firstApprover.full_name,
          approver_name: firstApprover.full_name,
          requester_name: requester.full_name,
          request_type: request_type,
          action: "created",
          company_name,
          request_detail,
          stage_name: parentData.stage_name,
          workflow_info: isGlobalWorkflow
            ? "(Global Workflow)"
            : workflowType === "designation-specific"
            ? `(${requester.hrms_employee_designation?.designation_name} Designation Workflow)`
            : `(${requester.hrms_employee_department?.department_name} Department Workflow)`,
          approver_department:
            firstApprover.hrms_employee_department?.department_name,
        }
      );

      await sendEmail({
        to: firstApprover.email,
        subject: template.subject,
        html: template.body,
        createdby: parentData.createdby,
        log_inst: parentData.log_inst,
      });

      console.log(
        ` [Email Sent] ${workflowType} workflow → ${firstApprover.email}`
      );
      console.log(
        `First Approver: ${firstApprover.full_name} (${
          firstApprover.hrms_employee_department?.department_name || "No Dept"
        })`
      );
    }

    return fullData;
  } catch (error) {
    console.error(" Error creating request:", error);
    throw new CustomError(`Error creating request: ${error.message}`, 500);
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
      where: { id: parseInt(id) },
    });

    return {
      success: true,
      message: "Request and its approvals deleted successfully",
    };
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

// const findRequestByRequestUsers = async (
//   search = "",
//   page = 1,
//   size = 10,
//   employee_id,
//   requestType = "",
//   status = "",
//   requester_id,
//   startDate,
//   endDate,
//   overall_status
// ) => {
//   page = !page || page == 0 ? 1 : page;
//   size = size || 10;
//   const skip = (page - 1) * size || 0;

//   const filters = {};

//   if (search) {
//     filters.OR = [
//       {
//         request_type: { contains: search.toLowerCase() },
//       },
//       {
//         request_data: { contains: search.toLowerCase() },
//       },
//     ];
//   }

//   if (requestType) {
//     filters.request_type = { equals: requestType };
//   }

//   if (status) {
//     filters.status = { equals: status };
//   }

//   if (overall_status) {
//     filters.overall_status = { equals: overall_status };
//   }

//   if (requester_id) {
//     filters.requester_id = { equals: requester_id };
//   }

//   if (startDate && endDate) {
//     const start = new Date(startDate);
//     const end = new Date(endDate);
//     if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
//       filters.createdate = { gte: start, lte: end };
//     }
//   }

//   try {
//     const reqData = await prisma.hrms_d_requests.findMany({
//       where: filters,
//       orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
//       include: {
//         requests_employee: {
//           select: {
//             id: true,
//             full_name: true,
//             employee_code: true,
//             profile_pic: true,
//             createdate: true,
//           },
//         },
//         request_approval_request: {
//           orderBy: { sequence: "asc" },
//           select: {
//             id: true,
//             request_id: true,
//             approver_id: true,
//             sequence: true,
//             status: true,
//             action_at: true,
//             createdate: true,
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

//     let data = [];

//     await Promise.all(
//       reqData.map(async (request) => {
//         const requestType = request.request_type;
//         const referenceId = request.reference_id;
//         if (requestType === "interview_stage" && referenceId) {
//           const interviewRemark =
//             await prisma.hrms_m_interview_stage_remark.findUnique({
//               where: { id: parseInt(referenceId) },
//               select: {
//                 id: true,
//                 status: true,
//                 stage_id: true,
//                 remark: true,
//                 stage_name: true,
//                 interview_stage_candidate: {
//                   select: {
//                     id: true,
//                     full_name: true,
//                     candidate_code: true,
//                   },
//                 },
//               },
//             });
//           if (interviewRemark) {
//             data.push({
//               ...request,
//               createdate: request.createdate,
//               reference: interviewRemark,
//             });
//           }
//         }
//         if (requestType === "leave_request" && referenceId) {
//           const leaveRequest = await prisma.hrms_d_leave_application.findUnique(
//             {
//               where: { id: parseInt(referenceId) },
//               select: {
//                 id: true,
//                 status: true,
//                 leave_type_id: true,
//                 start_date: true,
//                 end_date: true,
//                 reason: true,
//                 leave_types: {
//                   select: {
//                     id: true,
//                     leave_type: true,
//                   },
//                 },
//               },
//             }
//           );
//           if (leaveRequest) {
//             data.push({
//               ...request,
//               createdate: request.createdate,
//               reference: leaveRequest,
//             });
//           }
//         }
//         if (requestType === "loan_request" && referenceId) {
//           const loanRequest = await prisma.hrms_d_loan_request.findUnique({
//             where: { id: parseInt(referenceId) },
//             select: {
//               id: true,
//               status: true,
//               amount: true,
//               emi_months: true,
//               currency: true,
//               loan_req_employee: {
//                 select: {
//                   id: true,
//                   full_name: true,
//                   employee_code: true,
//                 },
//               },
//               loan_req_currency: {
//                 select: {
//                   id: true,
//                   currency_code: true,
//                   currency_name: true,
//                 },
//               },
//               loan_emi_loan_request: {
//                 select: {
//                   id: true,
//                   due_month: true,
//                   due_year: true,
//                   emi_amount: true,
//                   status: true,
//                   payslip_id: true,
//                 },
//               },
//               loan_types: {
//                 select: {
//                   id: true,
//                   loan_name: true,
//                 },
//               },
//             },
//           });
//           if (loanRequest) {
//             data.push({
//               ...request,
//               createdate: request.createdate,
//               reference: loanRequest,
//             });
//           }
//         }
//         if (requestType === "advance_request" && referenceId) {
//           const advancePayment =
//             await prisma.hrms_d_advance_payment_entry.findUnique({
//               where: { id: parseInt(referenceId) },
//               select: {
//                 id: true,
//                 employee_id: true,
//                 request_date: true,
//                 amount_requested: true,
//                 amount_approved: true,
//                 approval_status: true,
//                 approval_date: true,
//                 approved_by: true,
//                 reason: true,
//                 repayment_schedule: true,
//                 hrms_advance_payement_entry_employee: {
//                   select: {
//                     id: true,
//                     full_name: true,
//                     employee_code: true,
//                     employee_currency: {
//                       select: {
//                         id: true,
//                         currency_code: true,
//                         currency_name: true,
//                       },
//                     },
//                   },
//                 },
//                 hrms_advance_payement_entry_approvedBy: {
//                   select: {
//                     id: true,
//                     full_name: true,
//                   },
//                 },
//               },
//             });
//           if (advancePayment) {
//             data.push({
//               ...request,
//               createdate: request.createdate,
//               reference: advancePayment,
//             });
//           }
//         }
//         if (requestType === "asset_request" && referenceId) {
//           const assetRequest = await prisma.hrms_d_asset_assignment.findUnique({
//             where: { id: parseInt(referenceId) },
//             select: {
//               id: true,
//               asset_type_id: true,
//               asset_name: true,
//               serial_number: true,
//               issued_on: true,
//               returned_on: true,
//               status: true,
//               asset_assignment_employee: {
//                 select: {
//                   id: true,
//                   full_name: true,
//                   employee_code: true,
//                 },
//               },
//               asset_assignment_type: {
//                 select: {
//                   id: true,
//                   id: true,
//                   asset_type_name: true,
//                   depreciation_rate: true,
//                 },
//               },
//             },
//           });
//           if (assetRequest) {
//             data.push({
//               ...request,
//               createdate: request.createdate,
//               reference: assetRequest,
//             });
//           }
//         }
//         if (requestType === "probation_review" && referenceId) {
//           const probationRequest =
//             await prisma.hrms_d_probation_review.findUnique({
//               where: { id: parseInt(referenceId) },
//               select: {
//                 id: true,
//                 employee_id: true,
//                 probation_end_date: true,
//                 review_notes: true,
//                 confirmation_status: true,
//                 confirmation_date: true,
//                 reviewer_id: true,
//                 review_meeting_date: true,
//                 performance_rating: true,
//                 extension_required: true,
//                 extension_reason: true,
//                 extended_till_date: true,
//                 next_review_date: true,
//                 final_remarks: true,
//                 probation_review_employee: {
//                   select: {
//                     id: true,
//                     employee_code: true,
//                     full_name: true,
//                   },
//                 },
//                 probation_reviewer: {
//                   select: {
//                     id: true,
//                     employee_code: true,
//                     full_name: true,
//                   },
//                 },
//               },
//             });
//           if (probationRequest) {
//             data.push({
//               ...request,
//               createdate: request.createdate,
//               reference: probationRequest,
//             });
//           }
//         }
//         if (requestType === "appraisal_review" && referenceId) {
//           const appraisalRequest = await prisma.hrms_d_appraisal.findUnique({
//             where: { id: parseInt(referenceId) },
//             select: {
//               id: true,
//               employee_id: true,
//               review_period: true,
//               rating: true,
//               reviewer_comments: true,
//               appraisal_employee: {
//                 select: {
//                   full_name: true,
//                   id: true,
//                 },
//               },
//             },
//           });
//           if (appraisalRequest) {
//             data.push({
//               ...request,
//               createdate: request.createdate,
//               reference: appraisalRequest,
//             });
//           }
//         }
//         if (requestType === "leave_encashment" && referenceId) {
//           const leaveEncashmentRequest =
//             await prisma.hrms_d_leave_encashment.findUnique({
//               where: { id: parseInt(referenceId) },
//               select: {
//                 id: true,
//                 employee_id: true,
//                 leave_type_id: true,
//                 leave_days: true,
//                 encashment_amount: true,
//                 approval_status: true,
//                 encashment_date: true,
//                 basic_salary: true,
//                 payroll_period: true,
//                 total_amount: true,
//                 entitled: true,
//                 total_available: true,
//                 used: true,
//                 balance: true,
//                 requested: true,
//                 requested_date: true,
//                 leave_encashment_employee: {
//                   select: {
//                     full_name: true,
//                     id: true,
//                   },
//                 },
//                 encashment_leave_types: {
//                   select: {
//                     leave_type: true,
//                     id: true,
//                   },
//                 },
//               },
//             });
//           if (leaveEncashmentRequest) {
//             data.push({
//               ...request,
//               createdate: request.createdate,
//               reference: leaveEncashmentRequest,
//             });
//           }
//         }
//       })
//     );
//     data.sort((a, b) => new Date(b.createdate) - new Date(a.createdate));
//     const filteredData = data.filter((request) => {
//       const approvals = request.request_approval_request;
//       const approverIndex = approvals.findIndex(
//         (approval) =>
//           approval.approver_id === employee_id &&
//           (status === "" || approval.status === status)
//       );
//       if (approverIndex === -1) {
//         return false;
//       }
//       if (approverIndex === 0) {
//         return true;
//       }
//       const prevApproval = approvals[approverIndex - 1];
//       const shouldInclude = prevApproval?.status === "A";
//       return shouldInclude;
//     });

//     const slideData = filteredData.slice(skip, skip + size);
//     return {
//       data: slideData,
//       currentPage: page,
//       size,
//       totalPages: Math.ceil(filteredData.length / size),
//       totalCount: filteredData.length,
//     };
//   } catch (error) {
//     throw new CustomError(`${error.message}`, 503);
//   }
// };

const findRequestByRequestUsers = async (
  search = "",
  page = 1,
  size = 10,
  employee_id,
  requestType = "",
  status = "",
  requester_id,
  startDate,
  endDate,
  overall_status
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
    filters.status = { equals: status };
  }

  if (overall_status) {
    filters.overall_status = { equals: overall_status };
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
            hrms_employee_department: {
              select: {
                id: true,
                department_name: true,
              },
            },
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
                hrms_employee_department: {
                  select: {
                    id: true,
                    department_name: true,
                  },
                },
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

        request.workflow_context = {
          requester_department:
            request.requests_employee?.hrms_employee_department
              ?.department_name || "No Department",
          approver_departments: request.request_approval_request.map(
            (apr) =>
              apr.request_approval_approver?.hrms_employee_department
                ?.department_name || "No Department"
          ),
        };

        if (requestType === "interview_stage" && referenceId) {
          const interviewRemark =
            await prisma.hrms_m_interview_stage_remark.findUnique({
              where: { id: parseInt(referenceId) },
              select: {
                id: true,
                status: true,
                stage_id: true,
                remark: true,
                stage_name: true,
                interview_stage_candidate: {
                  select: {
                    id: true,
                    full_name: true,
                    candidate_code: true,
                  },
                },
              },
            });
          if (interviewRemark) {
            data.push({
              ...request,
              createdate: request.createdate,
              reference: interviewRemark,
            });
          }
        }

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
        if (requestType === "job_posting" && referenceId) {
          const jobPostingRequest = await prisma.hrms_d_job_posting.findUnique({
            where: { id: parseInt(referenceId) },
            select: {
              id: true,
              job_title: true,
              job_code: true,
              description: true,
              required_experience: true,
              due_date: true,
              annual_salary_from: true,
              annual_salary_to: true,
              posting_date: true,
              closing_date: true,
              status: true,
              is_internal: true,
              hrms_job_department: {
                select: {
                  id: true,
                  department_name: true,
                },
              },
              hrms_job_designation: {
                select: {
                  id: true,
                  designation_name: true,
                },
              },
              job_posting_currency: {
                select: {
                  id: true,
                  currency_code: true,
                  currency_name: true,
                },
              },
            },
          });
          if (jobPostingRequest) {
            data.push({
              ...request,
              createdate: request.createdate,
              reference: jobPostingRequest,
            });
          }
        }
        if (requestType === "offer_letter" && referenceId) {
          const offerLetterRequest =
            await prisma.hrms_d_offer_letter.findUnique({
              where: { id: parseInt(referenceId) },
              select: {
                id: true,
                offer_date: true,
                currency_id: true,
                position: true,
                offered_salary: true,
                valid_until: true,
                status: true,
                offer_letter_currencyId: {
                  select: {
                    id: true,
                    currency_code: true,
                    currency_name: true,
                  },
                },
              },
            });
          if (offerLetterRequest) {
            data.push({
              ...request,
              createdate: request.createdate,
              reference: offerLetterRequest,
            });
          }
        }
        if (requestType === "appointment_letter" && referenceId) {
          const appointmentLetterRequest =
            await prisma.hrms_d_appointment_letter.findUnique({
              where: { id: parseInt(referenceId) },
              select: {
                id: true,
                issue_date: true,
                terms_summary: true,
              },
            });
          if (appointmentLetterRequest) {
            data.push({
              ...request,
              createdate: request.createdate,
              reference: appointmentLetterRequest,
            });
          }
        }
        if (requestType === "pay_component" && referenceId) {
          const payComponentRequest =
            await prisma.hrms_m_pay_component.findUnique({
              where: { id: parseInt(referenceId) },
              select: {
                id: true,
                component_name: true,
                component_code: true,
              },
            });
          if (payComponentRequest) {
            data.push({
              ...request,
              createdate: request.createdate,
              reference: payComponentRequest,
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
      if (approverIndex === -1) {
        return false;
      }
      if (approverIndex === 0) {
        return true;
      }
      const prevApproval = approvals[approverIndex - 1];
      const shouldInclude = prevApproval?.status === "A";
      return shouldInclude;
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
const takeActionOnRequest = async ({
  request_id,
  request_approval_id,
  action,
  acted_by,
  remarks,
  stage_name,
}) => {
  console.log(stage_name, "stage_name");

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

    const company = await prisma.hrms_d_default_configurations.findUnique({
      where: { id: request.log_inst },
      select: { company_name: true },
    });
    const company_name = company?.company_name || "HRMS System";

    let candidateName = null;
    // if (request.request_type === "interview_stage" && request.reference_id) {
    //   const interviewStage =
    //     await prisma.hrms_m_interview_stage_remark.findUnique({
    //       where: { id: request.reference_id },
    //       include: {
    //         interview_stage_candidate: {
    //           select: { full_name: true },
    //         },
    //       },
    //     });
    //   candidateName =
    //     interviewStage?.interview_stage_candidate?.full_name || null;
    // }
    // if (request?.reference_id) {
    //   if (request.request_type === "interview_stage") {
    //     await prisma.hrms_m_interview_stage_remark.update({
    //       where: { id: request.reference_id },
    //       data: {
    //         updatedby: acted_by,
    //         updatedate: new Date(),
    //       },
    //     });

    if (request.request_type === "interview_stage" && request.reference_id) {
      const interviewStage =
        await prisma.hrms_m_interview_stage_remark.findUnique({
          where: { id: request.reference_id },
          include: {
            interview_stage_candidate: {
              select: { full_name: true },
            },
          },
        });
      candidateName =
        interviewStage?.interview_stage_candidate?.full_name || null;
    }

    if (request?.reference_id) {
      if (request.request_type === "interview_stage") {
        await prisma.hrms_m_interview_stage_remark.update({
          where: { id: request.reference_id },
          data: {
            updatedby: acted_by,
            updatedate: new Date(),
          },
        });
      } else if (request.request_type === "leave_request") {
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
            // rejection_reason: remarks || null,
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
      } else if (request.request_type === "job_posting") {
        await prisma.hrms_d_job_posting.update({
          where: { id: request.reference_id },
          data: {
            updatedby: acted_by,
            updatedate: new Date(),
          },
        });
      } else if (request.request_type === "offer_letter") {
        await prisma.hrms_d_offer_letter.update({
          where: { id: request.reference_id },
          data: {
            updatedby: acted_by,
            updatedate: new Date(),
          },
        });
      } else if (request.request_type === "appointment_letter") {
        await prisma.hrms_d_appointment_letter.update({
          where: { id: request.reference_id },
          data: {
            updatedby: acted_by,
            updatedate: new Date(),
          },
        });
      } else if (request.request_type === "pay_component") {
        await prisma.hrms_m_pay_component.update({
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
        // if (request.request_type === "interview_stage") {
        //   await prisma.hrms_m_interview_stage_remark.update({
        //     where: { id: request.reference_id },
        //     data: {
        //       status: "R",
        //       updatedby: acted_by,
        //       updatedate: new Date(),
        //     },
        //   });
        // }

        if (request.request_type === "interview_stage") {
          let candidateId = null;
          let hiringStageId = null;

          if (request.request_data) {
            try {
              const requestData = JSON.parse(request.request_data);
              candidateId = requestData.candidate_id;
              hiringStageId = requestData.hiring_stage_id;
              console.log(
                ` Parsed candidate_id: ${candidateId}, hiring_stage_id: ${hiringStageId}`
              );
            } catch (e) {
              console.error(" Error parsing request_data:", e);
            }
          }

          const interviewStageRemarkModel = require("./interviewStageRemarkModel");
          await interviewStageRemarkModel.updateInterviewStageRemarkStatus(
            request.reference_id,
            {
              status: "R",
              updatedby: acted_by,
            }
          );
          console.log(
            ` Interview stage remark ${request.reference_id} rejected - process stopped`
          );
        } else if (request.request_type === "leave_request") {
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
        } else if (request.request_type === "job_posting") {
          await prisma.hrms_d_job_posting.update({
            where: { id: request.reference_id },
            data: {
              status: "R",
              updatedby: acted_by,
              updatedate: new Date(),
            },
          });
        } else if (request.request_type === "offer_letter") {
          await prisma.hrms_d_offer_letter.update({
            where: { id: request.reference_id },
            data: {
              status: "R",
              updatedby: acted_by,
              updatedate: new Date(),
            },
          });
        } else if (request.request_type === "appointment_letter") {
          await prisma.hrms_d_appointment_letter.update({
            where: { id: request.reference_id },
            data: {
              status: "R",
              updatedby: acted_by,
              updatedate: new Date(),
            },
          });
        } else if (request.request_type === "pay_component") {
          await prisma.hrms_m_pay_component.update({
            where: { id: request.reference_id },
            data: {
              status: "R",
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
        const request_detail = await getRequestDetailsByType(
          request.request_type,
          request.reference_id
        );
        const template = await generateEmailContent(
          request.request_type === "interview_stage"
            ? templateKeyMap.interviewRemarkRejected
            : templateKeyMap.requestRejected,
          {
            employee_name: requester.full_name,
            request_type: formatRequestType(request.request_type),
            remarks,
            company_name,
            request_detail,
            stage_name: stage_name || null,
          }
        );

        await sendEmail({
          to: requester.email,
          subject: template.subject,
          html: template.body,
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
        if (request.request_type === "interview_stage") {
          let candidateId = null;
          let hiringStageId = null;

          if (request.request_data) {
            try {
              const requestData = JSON.parse(request.request_data);
              candidateId = requestData.candidate_id;
              hiringStageId = requestData.hiring_stage_id;
              console.log(
                ` Parsed candidate_id: ${candidateId}, hiring_stage_id: ${hiringStageId}`
              );
            } catch (e) {
              console.error(" Error parsing request_data:", e);
            }
          }

          const interviewStageRemarkModel = require("./interviewStageRemarkModel");
          await interviewStageRemarkModel.updateInterviewStageRemarkStatus(
            request.reference_id,
            {
              status: "A",
              updatedby: acted_by,
            }
          );
          console.log(
            ` Interview stage remark ${request.reference_id} approved`
          );
        } else if (request.request_type === "leave_request") {
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
        } else if (request.request_type === "job_posting") {
          await prisma.hrms_d_job_posting.update({
            where: { id: request.reference_id },
            data: {
              status: "A",
              updatedby: acted_by,
              updatedate: new Date(),
            },
          });
        } else if (request.request_type === "offer_letter") {
          await prisma.hrms_d_offer_letter.update({
            where: { id: request.reference_id },
            data: {
              status: "A",
              updatedby: acted_by,
              updatedate: new Date(),
            },
          });
        } else if (request.request_type === "appointment_letter") {
          await prisma.hrms_d_appointment_letter.update({
            where: { id: request.reference_id },
            data: {
              status: "A",
              updatedby: acted_by,
              updatedate: new Date(),
            },
          });
        } else if (request.request_type === "pay_component") {
          await prisma.hrms_m_pay_component.update({
            where: { id: request.reference_id },
            data: {
              status: "A",
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
        const request_detail = await getRequestDetailsByType(
          request.request_type,
          request.reference_id
        );

        const template = await generateEmailContent(
          request.request_type === "interview_stage"
            ? templateKeyMap.interviewRemarkAccepted
            : templateKeyMap.requestAccepted,
          {
            employee_name: requester.full_name,
            request_type: formatRequestType(request.request_type),
            company_name,
            request_detail,
            stage_name: stage_name || null,
          }
        );

        await sendEmail({
          to: requester.email,
          subject: template.subject,
          html: template.body,
          createdby: acted_by,
          log_inst: request.log_inst,
        });
      }

      return {
        message: "All approvers have approved. Request is fully approved.",
      };
    }
    console.log("Email successfully sent to next approver.");

    const nextApproverUser = await prisma.hrms_d_employee.findUnique({
      where: { id: nextApprover.approver_id },
      select: { email: true, full_name: true },
    });
    let actingUser = null;
    if (acted_by) {
      actingUser = await prisma.hrms_d_employee.findUnique({
        where: { id: Number(acted_by) },
        select: { full_name: true },
      });
    }

    console.log("Evaluating next approver email condition...");
    console.log("nextApproverUser:", nextApproverUser);
    console.log("actingUser:", actingUser);

    if (nextApproverUser?.email && actingUser?.full_name) {
      const request_detail = await getRequestDetailsByType(
        request.request_type,
        request.reference_id
      );
      const template = await generateEmailContent(
        request.request_type === "interview_stage"
          ? templateKeyMap.notifyNextRemarkApprover
          : templateKeyMap.notifyNextApprover,
        {
          approver_name: nextApproverUser.full_name,
          previous_approver: actingUser.full_name,
          request_type: request.request_type,
          action: action === "A" ? "approved" : "rejected",
          company_name,
          request_detail,
          candidate_name: candidateName || null,
          stage_name: stage_name || null,
        }
      );
      console.log(
        `1Email Sent To Approver: ${nextApproverUser.email}, Subject: ${template.subject}`
      );

      await sendEmail({
        to: nextApproverUser.email,
        subject: template.subject,
        html: template.body,
        createdby: acted_by,
        log_inst: request.log_inst,
      });
      console.log("Email successfully sent to next approver.");
    }

    return {
      message: `Approval recorded successfully`,
    };
  } catch (error) {
    console.log("Email fail sent to next approver.", error);

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
  findRequestByRequestUsers,
  findRequestByRequestTypeAndReferenceId,
};

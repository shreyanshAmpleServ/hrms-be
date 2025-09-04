// const { PrismaClient } = require("@prisma/client");
// const CustomError = require("../../utils/CustomError");
// const prisma = new PrismaClient();

// // Serialize approval workflow data
// const serializeApprovalWorkFlowData = (data) => ({
//   request_type: data.request_type || "",
//   sequence: data.sequence ? Number(data.sequence) : 1,
//   approver_id: Number(data.approver_id),
//   is_active: data.is_active || "",
// });

// const createApprovalWorkFlow = async (dataArray) => {
//   try {
//     if (!Array.isArray(dataArray)) {
//       throw new CustomError("Input must be an array of data objects", 400);
//     }

//     const results = [];

//     for (const data of dataArray) {
//       const result = await prisma.hrms_d_approval_work_flow.create({
//         data: {
//           ...serializeApprovalWorkFlowData(data),
//           createdby: data.createdby || 1,
//           createdate: new Date(),
//           log_inst: data.log_inst ? Number(data.log_inst) : 1,
//         },
//         include: {
//           approval_work_approver: {
//             select: {
//               id: true,
//               employee_code: true,
//               full_name: true,
//             },
//           },
//         },
//       });

//       results.push(result);
//     }

//     return results;
//   } catch (error) {
//     throw new CustomError(`${error.message}`, 500);
//   }
// };

// const findApprovalWorkFlow = async (id) => {
//   try {
//     const reqData = await prisma.hrms_d_approval_work_flow.findUnique({
//       where: { workflow_id: parseInt(id) },
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
//     if (!reqData) {
//       throw new CustomError("Approval workflow not found", 404);
//     }
//     return reqData;
//   } catch (error) {
//     throw new CustomError(
//       `Error finding approval workflow by ID: ${error.message}`,
//       503
//     );
//   }
// };

// const updateApprovalWorkFlow = async (id, data) => {
//   try {
//     if (!id || isNaN(Number(id))) {
//       throw new CustomError("Invalid or missing ID for update", 400);
//     }

//     const updatedEntry = await prisma.hrms_d_approval_work_flow.update({
//       where: { id: parseInt(id) },
//       data: {
//         ...serializeApprovalWorkFlowData(data),
//         updatedby: data.updatedby || 1,
//         updatedate: new Date(),
//       },
//       include: {
//         approval_work_approver: {
//           select: {
//             id: true,
//             employee_code: true,
//             full_name: true,
//             profile_pic: true,
//             hrms_employee_department: {
//               select: {
//                 id: true,
//                 department_name: true,
//               },
//             },
//           },
//         },
//       },
//     });

//     return updatedEntry;
//   } catch (error) {
//     throw new CustomError(
//       `Error updating approval workflow: ${error.message}`,
//       500
//     );
//   }
// };
// const deleteApprovalWorkFlow = async (requestType) => {
//   try {
//     await prisma.hrms_d_approval_work_flow.deleteMany({
//       where: { request_type: requestType },
//     });
//   } catch (error) {
//     throw new CustomError(
//       `Error deleting approval workflow: ${error.message}`,
//       500
//     );
//   }
// };

// const deleteApprovalWorkFlows = async (ids) => {
//   try {
//     await prisma.hrms_d_approval_work_flow.deleteMany({
//       where: { id: { in: ids } },
//     });
//   } catch (error) {
//     throw new CustomError(
//       `Error deleting approval workflows: ${error.message}`,
//       500
//     );
//   }
// };

// // const getAllApprovalWorkFlow = async (
// //   search,
// //   page,
// //   size,
// //   startDate,
// //   endDate
// // ) => {
// //   try {
// //     size = size || 1000;
// //     page = !page || page == 0 ? 1 : page;
// //     const skip = (page - 1) * size;
// //     const filters = {};
// //     if (search) {
// //       filters.OR = [
// //         {
// //           request_type: { contains: search.toLowerCase(), mode: "insensitive" },
// //         },
// //         { is_active: { contains: search.toLowerCase(), mode: "insensitive" } },
// //       ];
// //     }
// //     if (startDate && endDate) {
// //       const start = new Date(startDate);
// //       const end = new Date(endDate);
// //       if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
// //         filters.createdate = { gte: start, lte: end };
// //       }
// //     }

// //     const workflows = await prisma.hrms_d_approval_work_flow.findMany({
// //       where: filters,
// //       skip,
// //       take: size,
// //       orderBy: [{ request_type: "asc" }, { sequence: "asc" }],
// //       include: {
// //         approval_work_approver: {
// //           select: {
// //             id: true,
// //             full_name: true,
// //             employee_code: true,
// //             profile_pic: true,
// //             hrms_employee_department: {
// //               select: {
// //                 id: true,
// //                 department_name: true,
// //               },
// //             },
// //           },
// //         },
// //       },
// //     });

// //     const totalCount = await prisma.hrms_d_approval_work_flow.count({
// //       where: filters,
// //     });

// //     const grouped = {};
// //     for (const wf of workflows) {
// //       const type = wf.request_type;
// //       if (!grouped[type]) {
// //         grouped[type] = {
// //           request_type: type,
// //           no_of_approvers: 0,
// //           is_active: wf.is_active,
// //           request_approval_request: [],
// //         };
// //       }

// //       grouped[type].request_approval_request.push({
// //         id: wf.id,
// //         request_type: wf.request_type,
// //         sequence: wf.sequence,
// //         approver_id: wf.approver_id,
// //         is_active: wf.is_active,
// //         createdate: wf.createdate,
// //         createdby: wf.createdby,
// //         updatedate: wf.updatedate,
// //         updatedby: wf.updatedby,
// //         log_inst: wf.log_inst,
// //         approval_work_approver: {
// //           id: wf.approval_work_approver?.id || null,
// //           name: wf.approval_work_approver?.full_name || null,
// //           employee_code: wf.approval_work_approver?.employee_code || null,
// //           profile_pic: wf.approval_work_approver?.profile_pic || null,
// //           department:
// //             wf.approval_work_approver?.hrms_employee_department
// //               ?.department_name || null,
// //         },
// //       });

// //       grouped[type].no_of_approvers += 1;
// //     }

// //     return {
// //       data: Object.values(grouped),
// //       currentPage: page,
// //       size: 1000,
// //       totalPages: Math.ceil(totalCount / size),
// //       totalCount,
// //     };
// //   } catch (error) {
// //     throw new CustomError("Error retrieving approval workflows", 503);
// //   }
// // };

// const getAllApprovalWorkFlow = async (
//   search,
//   page,
//   size,
//   startDate,
//   endDate
// ) => {
//   try {
//     size = size || 1000;
//     page = !page || page == 0 ? 1 : page;
//     const skip = (page - 1) * size;

//     const filters = {};
//     if (search) {
//       filters.request_type = {
//         contains: search.toLowerCase(),
//         mode: "insensitive",
//       };
//     }

//     if (startDate && endDate) {
//       const start = new Date(startDate);
//       const end = new Date(endDate);
//       if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
//         filters.createdate = { gte: start, lte: end };
//       }
//     }

//     const workflows = await prisma.hrms_d_approval_work_flow.findMany({
//       where: filters,
//       skip,
//       take: size,
//       orderBy: [{ request_type: "asc" }, { sequence: "asc" }],
//       include: {
//         approval_work_approver: {
//           select: {
//             id: true,
//             full_name: true,
//             employee_code: true,
//             profile_pic: true,
//             hrms_employee_department: {
//               select: {
//                 id: true,
//                 department_name: true,
//               },
//             },
//           },
//         },
//       },
//     });
//     const distinctRequestTypes =
//       await prisma.hrms_d_approval_work_flow.findMany({
//         where: filters,
//         select: { request_type: true },
//         distinct: ["request_type"],
//       });

//     const totalCount = distinctRequestTypes.length;

//     // const totalCount = await prisma.hrms_d_approval_work_flow.count({
//     //   where: filters,
//     // });

//     const grouped = {};
//     for (const wf of workflows) {
//       const type = wf.request_type;
//       if (!grouped[type]) {
//         grouped[type] = {
//           request_type: type,
//           no_of_approvers: 0,
//           is_active: wf.is_active,
//           request_approval_request: [],
//         };
//       }

//       grouped[type].request_approval_request.push({
//         id: wf.id,
//         request_type: wf.request_type,
//         sequence: wf.sequence,
//         approver_id: wf.approver_id,
//         is_active: wf.is_active,
//         createdate: wf.createdate,
//         createdby: wf.createdby,
//         updatedate: wf.updatedate,
//         updatedby: wf.updatedby,
//         log_inst: wf.log_inst,
//         approval_work_approver: {
//           id: wf.approval_work_approver?.id || null,
//           name: wf.approval_work_approver?.full_name || null,
//           employee_code: wf.approval_work_approver?.employee_code || null,
//           profile_pic: wf.approval_work_approver?.profile_pic || null,
//           department:
//             wf.approval_work_approver?.hrms_employee_department
//               ?.department_name || null,
//         },
//       });

//       grouped[type].no_of_approvers += 1;
//     }

//     const uniqueRequestTypesCount = Object.keys(grouped).length;

//     return {
//       data: Object.values(grouped),
//       currentPage: page,
//       size,
//       totalPages: Math.ceil(totalCount / size),
//       totalCount,
//       uniqueRequestTypesCount,
//     };
//   } catch (error) {
//     throw new CustomError("Error retrieving approval workflows", 503);
//   }
// };

// const getAllApprovalWorkFlowByRequest = async (request_type) => {
//   try {
//     const workflows = await prisma.hrms_d_approval_work_flow.findMany({
//       where: { request_type },
//       orderBy: { sequence: "asc" },
//       include: {
//         approval_work_approver: {
//           select: {
//             id: true,
//             full_name: true,
//             employee_code: true,
//             profile_pic: true,
//             hrms_employee_department: {
//               select: {
//                 id: true,
//                 department_name: true,
//               },
//             },
//           },
//         },
//       },
//     });

//     return workflows;
//   } catch (error) {
//     throw new CustomError(
//       `Error fetching workflows for request_type '${request_type}': ${error.message}`,
//       500
//     );
//   }
// };

// module.exports = {
//   createApprovalWorkFlow,
//   findApprovalWorkFlow,
//   updateApprovalWorkFlow,
//   deleteApprovalWorkFlow,
//   deleteApprovalWorkFlows,
//   getAllApprovalWorkFlow,
//   getAllApprovalWorkFlowByRequest,
// };

const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const prisma = new PrismaClient();

const serializeApprovalWorkFlowData = (data) => ({
  request_type: data.request_type || "",
  sequence: data.sequence ? Number(data.sequence) : 1,
  approver_id: Number(data.approver_id),
  department_id: data.department_id ? Number(data.department_id) : null,
});

const createApprovalWorkFlow = async (dataArray) => {
  try {
    if (!Array.isArray(dataArray)) {
      throw new CustomError("Input must be an array of data objects", 400);
    }

    const results = [];

    for (const data of dataArray) {
      const approver = await prisma.hrms_d_employee.findUnique({
        where: { id: Number(data.approver_id) },
        select: {
          id: true,
          full_name: true,
          department_id: true,
          hrms_employee_department: {
            select: { department_name: true },
          },
        },
      });

      if (!approver) {
        throw new CustomError(
          `Approver with ID ${data.approver_id} not found`,
          400
        );
      }

      if (
        data.department_id &&
        approver.department_id !== Number(data.department_id)
      ) {
        const department = await prisma.hrms_m_department_master.findUnique({
          where: { id: Number(data.department_id) },
          select: { department_name: true },
        });

        throw new CustomError(
          `Approver ${approver.full_name} (${approver.hrms_employee_department?.department_name}) does not belong to ${department?.department_name} department`,
          400
        );
      }

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
              hrms_employee_department: {
                select: {
                  id: true,
                  department_name: true,
                },
              },
            },
          },
          approval_work_department: {
            select: {
              id: true,
              department_name: true,
            },
          },
        },
      });

      console.log(
        ` Created ${
          data.department_id ? "Department-Specific" : "Global"
        } workflow: ${data.request_type} → ${approver.full_name}`
      );
      results.push(result);
    }

    return results;
  } catch (error) {
    throw new CustomError(`${error.message}`, 500);
  }
};

const findApprovalWorkFlow = async (id) => {
  try {
    const reqData = await prisma.hrms_d_approval_work_flow.findUnique({
      where: { id: parseInt(id) },
      include: {
        approval_work_approver: {
          select: {
            id: true,
            employee_code: true,
            full_name: true,
            hrms_employee_department: {
              select: {
                id: true,
                department_name: true,
              },
            },
          },
        },
        approval_work_department: {
          select: {
            id: true,
            department_name: true,
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
    if (!id || isNaN(Number(id))) {
      throw new CustomError("Invalid or missing ID for update", 400);
    }

    if (data.approver_id) {
      const approver = await prisma.hrms_d_employee.findUnique({
        where: { id: Number(data.approver_id) },
        select: {
          department_id: true,
          full_name: true,
          hrms_employee_department: {
            select: { department_name: true },
          },
        },
      });

      if (!approver) {
        throw new CustomError(
          `Approver with ID ${data.approver_id} not found`,
          400
        );
      }

      if (
        data.department_id &&
        approver.department_id !== Number(data.department_id)
      ) {
        throw new CustomError(
          `Approver ${approver.full_name} does not belong to the specified department`,
          400
        );
      }
    }

    const updatedEntry = await prisma.hrms_d_approval_work_flow.update({
      where: { id: parseInt(id) },
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
            profile_pic: true,
            hrms_employee_department: {
              select: {
                id: true,
                department_name: true,
              },
            },
          },
        },
        approval_work_department: {
          select: {
            id: true,
            department_name: true,
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
    const result = await prisma.hrms_d_approval_work_flow.deleteMany({
      where: { request_type: requestType },
    });
    console.log(` Deleted ${result.count} workflows for ${requestType}`);
  } catch (error) {
    throw new CustomError(
      `Error deleting approval workflow: ${error.message}`,
      500
    );
  }
};

const deleteApprovalWorkFlows = async (ids) => {
  try {
    const result = await prisma.hrms_d_approval_work_flow.deleteMany({
      where: { id: { in: ids } },
    });
    console.log(` Deleted ${result.count} workflows by IDs`);
  } catch (error) {
    throw new CustomError(
      `Error deleting approval workflows: ${error.message}`,
      500
    );
  }
};

const getAllApprovalWorkFlow = async (
  search,
  page,
  size,
  startDate,
  endDate,
  department_id
) => {
  try {
    size = size || 1000;
    page = !page || page == 0 ? 1 : page;
    const skip = (page - 1) * size;

    const filters = {};

    if (search) {
      filters.request_type = {
        contains: search.toLowerCase(),
        mode: "insensitive",
      };
    }

    if (department_id !== undefined) {
      if (
        department_id === "global" ||
        department_id === "null" ||
        department_id === null
      ) {
        filters.department_id = null;
      } else {
        filters.department_id = Number(department_id);
      }
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
      orderBy: [
        { request_type: "asc" },
        { department_id: "asc" },
        { sequence: "asc" },
      ],
      include: {
        approval_work_approver: {
          select: {
            id: true,
            full_name: true,
            employee_code: true,
            profile_pic: true,
            hrms_employee_department: {
              select: {
                id: true,
                department_name: true,
              },
            },
          },
        },
        approval_work_department: {
          select: {
            id: true,
            department_name: true,
          },
        },
      },
    });

    const totalCount = await prisma.hrms_d_approval_work_flow.count({
      where: filters,
    });

    const grouped = {};

    for (const wf of workflows) {
      const type = wf.request_type;
      const deptId = wf.department_id;
      const key = `${type}_${deptId || "global"}`;

      if (!grouped[key]) {
        grouped[key] = {
          request_type: type,
          department_id: deptId,
          department_name:
            wf.approval_work_department?.department_name ||
            "Global (All Departments)",
          is_global: deptId === null,
          no_of_approvers: 0,
          is_active: wf.is_active,
          request_approval_request: [],
        };
      }

      grouped[key].request_approval_request.push({
        id: wf.id,
        request_type: wf.request_type,
        sequence: wf.sequence,
        approver_id: wf.approver_id,
        department_id: wf.department_id,
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
          profile_pic: wf.approval_work_approver?.profile_pic || null,
          department:
            wf.approval_work_approver?.hrms_employee_department
              ?.department_name || null,
        },
      });

      grouped[key].no_of_approvers += 1;
    }

    return {
      data: Object.values(grouped),
      currentPage: page,
      size,
      totalPages: Math.ceil(totalCount / size),
      totalCount,
      summary: {
        total_workflows: Object.keys(grouped).length,
        global_workflows: Object.values(grouped).filter((g) => g.is_global)
          .length,
        department_workflows: Object.values(grouped).filter((g) => !g.is_global)
          .length,
      },
    };
  } catch (error) {
    throw new CustomError("Error retrieving approval workflows", 503);
  }
};

const getAllApprovalWorkFlowByRequest = async (
  request_type,
  department_id = null
) => {
  try {
    let workflows;

    if (department_id) {
      workflows = await prisma.hrms_d_approval_work_flow.findMany({
        where: {
          request_type,
          department_id: Number(department_id),
          is_active: "Y",
        },
        orderBy: { sequence: "asc" },
        include: {
          approval_work_approver: {
            select: {
              id: true,
              full_name: true,
              employee_code: true,
              profile_pic: true,
              hrms_employee_department: {
                select: {
                  id: true,
                  department_name: true,
                },
              },
            },
          },
          approval_work_department: {
            select: {
              id: true,
              department_name: true,
            },
          },
        },
      });

      if (!workflows || workflows.length === 0) {
        console.log(
          `No department-specific workflow for ${request_type}, checking global...`
        );
        workflows = await prisma.hrms_d_approval_work_flow.findMany({
          where: {
            request_type,
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
                profile_pic: true,
                hrms_employee_department: {
                  select: {
                    id: true,
                    department_name: true,
                  },
                },
              },
            },
          },
        });
      }
    } else {
      workflows = await prisma.hrms_d_approval_work_flow.findMany({
        where: {
          request_type,
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
              profile_pic: true,
              hrms_employee_department: {
                select: {
                  id: true,
                  department_name: true,
                },
              },
            },
          },
        },
      });
    }

    return workflows;
  } catch (error) {
    throw new CustomError(
      `Error fetching workflows for request_type '${request_type}': ${error.message}`,
      500
    );
  }
};

const getDepartmentsWithWorkflows = async (request_type) => {
  try {
    const departments = await prisma.hrms_d_approval_work_flow.findMany({
      where: {
        request_type,
        is_active: "Y",
      },
      select: {
        department_id: true,
        approval_work_department: {
          select: {
            id: true,
            department_name: true,
          },
        },
      },
      distinct: ["department_id"],
    });

    return departments.map((d) => ({
      department_id: d.department_id,
      department_name: d.department_id
        ? d.approval_work_department?.department_name
        : "Global (All Departments)",
      is_global: d.department_id === null,
    }));
  } catch (error) {
    throw new CustomError(
      `Error fetching departments with workflows: ${error.message}`,
      500
    );
  }
};

module.exports = {
  createApprovalWorkFlow,
  findApprovalWorkFlow,
  updateApprovalWorkFlow,
  deleteApprovalWorkFlow,
  deleteApprovalWorkFlows,
  getAllApprovalWorkFlow,
  getAllApprovalWorkFlowByRequest,
  getDepartmentsWithWorkflows,
};

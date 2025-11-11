const { PrismaClient } = require("@prisma/client");
const { evaluateConditions } = require("./conditionEvaluator");
const { executeActions } = require("./actionExecutor");
const prisma = new PrismaClient();
require("./consoleLogs");

async function updateLogWithRetry(logId, data, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await prisma.hrms_d_alert_log.update({
        where: { id: logId },
        data: data,
      });
    } catch (error) {
      const isWriteConflict =
        error.message?.includes("write conflict") ||
        error.message?.includes("deadlock") ||
        error.code === "P2034";

      if (isWriteConflict && attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 100; // 100ms, 200ms, 400ms
        console.log(
          `[Retry] Log update failed, retrying in ${delay}ms (attempt ${
            attempt + 1
          }/${maxRetries})`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
}
// const runWorkflow = async (workflowId, workflow) => {
//   const log = await prisma.hrms_d_alert_log.create({
//     data: {
//       workflow_id: workflowId,
//       status: "RUNNING",
//       details: JSON.stringify({ started_at: new Date().toISOString() }),
//     },
//   });

//   try {
//     const employees = await getTargetEmployees(workflow);
//     const eligible = employees.filter((emp) =>
//       evaluateConditions(emp, workflow.conditions)
//     );

//     console.log(
//       `${eligible.length} employees are eligible for workflow ${workflowId}`
//     );

//     if (eligible.length > 0) {
//       console.log(
//         `   Eligible employees: ${eligible
//           .map((emp) => `${emp.full_name} (${emp.employee_code})`)
//           .join(", ")}`
//       );
//     }

//     let actionResults = [];
//     if (eligible.length > 0) {
//       actionResults = await executeActions(eligible, workflow.actions);
//       console.log(
//         ` Actions executed for ${eligible.length} eligible employees`
//       );
//     } else {
//       console.log(` No eligible employees found, skipping actions`);
//       actionResults = [
//         {
//           type: "Email",
//           status: "SKIPPED",
//           reason: "No eligible employees",
//         },
//       ];
//     }

//     await prisma.hrms_d_alert_log.update({
//       where: { id: log.id },
//       data: {
//         status: "COMPLETED",
//         details: JSON.stringify({
//           ...JSON.parse(log.details),
//           completed_at: new Date().toISOString(),
//           eligible_count: eligible.length,
//           total_employees: employees.length,
//           action_results: actionResults,
//         }),
//       },
//     });

//     // console.log(` Workflow ${workflowId} completed successfully`);
//     return { eligible_count: eligible.length, action_results: actionResults };
//   } catch (error) {
//     console.error(`[error] Workflow ${workflowId} failed: ${error.message}`);

//     await prisma.hrms_d_alert_log.update({
//       where: { id: log.id },
//       data: {
//         status: "FAILED",
//         details: JSON.stringify({
//           ...JSON.parse(log.details || "{}"),
//           error: error.message,
//           failed_at: new Date().toISOString(),
//         }),
//       },
//     });

//     throw error;
//   }
// };

const runWorkflow = async (workflowId, workflow) => {
  let log;

  try {
    // Create log with retry
    log = await prisma.hrms_d_alert_log.create({
      data: {
        workflow_id: workflowId,
        status: "RUNNING",
        details: JSON.stringify({ started_at: new Date().toISOString() }),
      },
    });
  } catch (error) {
    console.error(
      `[Error] Failed to create log for workflow ${workflowId}: ${error.message}`
    );
    throw error;
  }

  try {
    const employees = await getTargetEmployees(workflow);
    const eligible = employees.filter((emp) =>
      evaluateConditions(emp, workflow.conditions)
    );

    console.log(
      `${eligible.length} employees are eligible for workflow ${workflowId}`
    );

    if (eligible.length > 0) {
      console.log(
        `   Eligible employees: ${eligible
          .map((emp) => `${emp.full_name} (${emp.employee_code})`)
          .join(", ")}`
      );
    }

    let actionResults = [];
    if (eligible.length > 0) {
      actionResults = await executeActions(eligible, workflow.actions);
      console.log(
        ` Actions executed for ${eligible.length} eligible employees`
      );
    } else {
      console.log(` No eligible employees found, skipping actions`);
      actionResults = [
        {
          type: "Email",
          status: "SKIPPED",
          reason: "No eligible employees",
        },
      ];
    }

    // Update log with retry logic
    await updateLogWithRetry(log.id, {
      status: "COMPLETED",
      details: JSON.stringify({
        started_at: JSON.parse(log.details).started_at,
        completed_at: new Date().toISOString(),
        eligible_count: eligible.length,
        total_employees: employees.length,
        action_results: actionResults,
      }),
    });

    return { eligible_count: eligible.length, action_results: actionResults };
  } catch (error) {
    console.error(`[Error] Workflow ${workflowId} failed: ${error.message}`);

    // Attempt to update log status to FAILED with retry
    if (log?.id) {
      try {
        await updateLogWithRetry(log.id, {
          status: "FAILED",
          details: JSON.stringify({
            started_at: JSON.parse(log.details || "{}").started_at,
            error: error.message,
            error_stack: error.stack,
            failed_at: new Date().toISOString(),
          }),
        });
      } catch (updateError) {
        console.error(
          `[Error] Failed to update log status to FAILED: ${updateError.message}`
        );
      }
    }

    throw error;
  }
};

async function getTargetEmployees(workflow) {
  const today = new Date().toISOString().split("T")[0];

  const commonIncludes = {
    hrms_employee_department: true,
    hrms_employee_designation: true,
    user_employee: {
      include: {
        hrms_d_user_role: {
          include: {
            hrms_m_role: true,
          },
        },
      },
    },
    employee_shift_id: {
      include: {
        shift_department_id: true,
      },
    },
    hrms_daily_attendance_employee: {
      where: {
        attendance_date: {
          gte: new Date(today),
          lt: new Date(new Date(today).getTime() + 24 * 60 * 60 * 1000),
        },
      },
      orderBy: {
        attendance_date: "desc",
      },
    },
    w_employee: true,
    contracted_employee: true,
    document_upload_employee: {
      where: {
        is_active: "Y",
      },
      include: {
        document_type: true,
      },
    },
    document_upload_employee: {
      where: {
        is_mandatory: "Y",
        expiry_date: {
          not: null,
        },
      },
    },
  };

  const baseWhere = {
    status: "Active",
  };

  if (
    workflow.target_type === "All" ||
    !workflow.target_type ||
    workflow.target_type === ""
  ) {
    //  console.log(` Targeting ALL active employees`);

    const employees = await prisma.hrms_d_employee.findMany({
      include: commonIncludes,
      where: baseWhere,
    });

    // console.log(` Found ${employees.length} total active employees`);
    logEmployeesAttendance(employees);
    return employees;
  }

  if (workflow.target_type === "Role" && workflow.target) {
    const roles = workflow.target.split(",").map((r) => r.trim());
    // console.log(` Targeting roles by name: ${roles.join(", ")}`);

    const employees = await prisma.hrms_d_employee.findMany({
      include: commonIncludes,
      where: {
        ...baseWhere,
        user_employee: {
          some: {
            hrms_d_user_role: {
              some: {
                hrms_m_role: {
                  role_name: { in: roles },
                },
              },
            },
          },
        },
      },
    });

    // console.log(` Found ${employees.length} employees with target roles`);
    logEmployeesAttendance(employees);
    return employees;
  } else if (workflow.target_type === "Department" && workflow.target) {
    const departmentIds = workflow.target
      .split(",")
      .map((d) => parseInt(d.trim()));
    // console.log(` Targeting departments by ID: ${departmentIds.join(", ")}`);

    const employees = await prisma.hrms_d_employee.findMany({
      include: commonIncludes,
      where: {
        ...baseWhere,
        department_id: { in: departmentIds },
      },
    });

    // console.log(` Found ${employees.length} employees in target departments`);
    logEmployeesAttendance(employees);
    return employees;
  } else if (workflow.target_type === "Designation" && workflow.target) {
    const designationIds = workflow.target
      .split(",")
      .map((d) => parseInt(d.trim()));
    // console.log(` Targeting designations by ID: ${designationIds.join(", ")}`);

    const employees = await prisma.hrms_d_employee.findMany({
      include: commonIncludes,
      where: {
        ...baseWhere,
        designation_id: { in: designationIds },
      },
    });

    // console.log(` Found ${employees.length} employees in target designations`);
    logEmployeesAttendance(employees);
    return employees;
  } else if (workflow.target_type === "Employee" && workflow.target) {
    const employeeIds = workflow.target
      .split(",")
      .map((e) => parseInt(e.trim()));
    // console.log(
    //   ` Targeting individual employees by ID: ${employeeIds.join(", ")}`
    // );

    const employees = await prisma.hrms_d_employee.findMany({
      include: commonIncludes,
      where: {
        ...baseWhere,
        id: { in: employeeIds },
      },
    });

    // console.log(` Found ${employees.length} individual target employees`);
    logEmployeesAttendance(employees);
    return employees;
  }

  // console.log(` No valid targeting found, returning empty array`);
  return [];
}

function logEmployeesAttendance(employees) {
  // console.log(` Found ${employees.length} employees for workflow evaluation`);
  // employees.forEach((emp) => {
  //   const todayAtt = emp.hrms_daily_attendance_employee?.[0];
  //   const shift = emp.employee_shift_id;
  //   console.log(` ${emp.full_name}:
  //     Shift: ${
  //       shift
  //         ? `${shift.shift_name} (${shift.start_time}-${shift.end_time})`
  //         : "No shift assigned"
  //     }
  //     Attendance: ${
  //       todayAtt
  //         ? `${todayAtt.status} (In: ${
  //             todayAtt.check_in_time || "None"
  //           }, Out: ${todayAtt.check_out_time || "None"})`
  //         : "No record today"
  //     }`);
  // });
  // console.log(
  //   ` Found ${employees.length} target employees for workflow evaluation`
  // );
}

module.exports = {
  runWorkflow,
  getTargetEmployees,
};

const { PrismaClient } = require("@prisma/client");
const { evaluateConditions } = require("./conditionEvaluator");
const { executeActions } = require("./actionExecutor");
const logger = require("./../Comman/logger");
const prisma = new PrismaClient();

const runWorkflow = async (workflowId, workflow) => {
  const log = await prisma.hrms_d_alert_log.create({
    data: {
      workflow_id: workflowId,
      status: "RUNNING",
      details: JSON.stringify({ started_at: new Date().toISOString() }),
    },
  });

  try {
    const employees = await getTargetEmployees(workflow);
    const eligible = employees.filter((emp) =>
      evaluateConditions(emp, workflow.conditions)
    );
    const actionResults = await executeActions(eligible, workflow.actions);
    await prisma.hrms_d_alert_log.update({
      where: { id: log.id },
      data: {
        status: "COMPLETED",
        details: JSON.stringify({
          ...JSON.parse(log.details || "{}"),
          completed_at: new Date().toISOString(),
          employees: eligible.map((e) => e.id),
          action_results: actionResults,
        }),
      },
    });
  } catch (err) {
    await prisma.hrms_d_alert_log.update({
      where: { id: log.id },
      data: {
        status: "FAILED",
        details: JSON.stringify({
          ...JSON.parse(log.details || "{}"),
          completed_at: new Date().toISOString(),
          error_message: err.message,
        }),
      },
    });
    logger.error(`Workflow ${workflowId} failed: ${err.message}`);
    throw err;
  }
};

async function getTargetEmployees(workflow) {
  let where = { status: "Active" };

  if (workflow.target_type === "Role" && workflow.target) {
    const roles = workflow.target.split(",").map((r) => r.trim());

    const employees = await prisma.hrms_d_employee.findMany({
      include: {
        user_employee: {
          include: {
            hrms_d_user_role: {
              include: {
                hrms_m_role: true,
              },
            },
          },
        },
      },
      where: {
        status: "Active",
        user_employee: {
          hrms_d_user_role: {
            some: {
              hrms_m_role: {
                role_name: { in: roles },
              },
            },
          },
        },
      },
    });

    return employees;
  }
  return await prisma.hrms_d_employee.findMany({ where });
}

module.exports = {
  runWorkflow,
};

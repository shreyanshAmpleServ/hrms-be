const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const prisma = new PrismaClient();

// Serialize workflow data for database
const serializeWorkflowData = (data) => ({
  name: data.name,
  description: data.description,
  target_type: data.target_type,
  target: data.target,
  schedule_cron: data.schedule_cron,
  is_active: data.is_active,
  condition_type: data.condition_type,
  condition_op: data.condition_op,
  condition_value: data.condition_value,
  conditions: JSON.stringify(data.conditions || []),
  actions: JSON.stringify(data.actions || []),
  createdby: data.createdby,
  createdate: new Date(),
  log_inst: data.log_inst || 1,
  updatedby: data.updatedby,
  updatedate: data.updatedate && new Date(data.updatedate),
});

const createAlertWorkflow = async (data) => {
  try {
    const reqData = await prisma.hrms_d_alert_workflow.create({
      data: {
        ...serializeWorkflowData(data),
        createdby: data.createdby || 1,
        createdate: new Date(),
        log_inst: data.log_inst || 1,
      },
      include: { alert_workflow_alert_logs: true },
    });

    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error creating alert workflow: ${error.message}`,
      500
    );
  }
};

const getAlertWorkflowById = async (id) => {
  try {
    const workflow = await prisma.hrms_d_alert_workflow.findUnique({
      where: { id: parseInt(id) },
      include: { alert_workflow_alert_logs: true },
    });
    if (!workflow) throw new CustomError("Workflow not found", 404);
    workflow.conditions = JSON.parse(workflow.conditions || "[]");
    workflow.actions = JSON.parse(workflow.actions || "[]");
    return workflow;
  } catch (error) {
    throw new CustomError(error.message, 503);
  }
};

const updateAlertWorkflow = async (id, data) => {
  try {
    const updatedEntry = await prisma.hrms_d_alert_workflow.update({
      where: { id: parseInt(id) },
      include: { alert_workflow_alert_logs: true },

      data: {
        ...serializeWorkflowData({
          ...data,
          updatedby: data.updatedby || 1,
          updatedate: new Date(),
        }),
      },
    });
    return updatedEntry;
  } catch (error) {
    throw new CustomError(error.message, 500);
  }
};

const deleteAlertWorkflow = async (id) => {
  try {
    await prisma.hrms_d_alert_workflow.delete({ where: { id: parseInt(id) } });
  } catch (error) {
    throw new CustomError(error.message, 500);
  }
};
const getAlertWorkflows = async (search, page, size, startDate, endDate) => {
  page = !page || page == 0 ? 1 : page;
  size = size || 10;
  const skip = (page - 1) * size;
  const filters = {};

  if (search) {
    filters.OR = [
      { name: { contains: search.toLowerCase() } },
      { description: { contains: search.toLowerCase() } },
      { target: { contains: search.toLowerCase() } },
      { target_type: { contains: search.toLowerCase() } },
    ];
  }

  if (startDate && endDate) {
    filters.AND = [
      { createdate: { gte: new Date(startDate) } },
      { createdate: { lte: new Date(endDate) } },
    ];
  }

  try {
    const workflows = await prisma.hrms_d_alert_workflow.findMany({
      where: filters,
      skip,
      take: size,
      include: { alert_workflow_alert_logs: true },
      orderBy: [{ createdate: "desc" }, { updatedate: "desc" }],
    });
    workflows.forEach((w) => {
      w.conditions = JSON.parse(w.conditions || "[]");
      w.actions = JSON.parse(w.actions || "[]");
    });
    const totalCount = await prisma.hrms_d_alert_workflow.count({
      where: filters,
    });
    return {
      data: workflows,
      currentPage: page,
      size,
      totalPages: Math.ceil(totalCount / size),
      totalCount,
    };
  } catch (error) {
    throw new CustomError(error.message, 503);
  }
};

module.exports = {
  createAlertWorkflow,
  getAlertWorkflowById,
  updateAlertWorkflow,
  deleteAlertWorkflow,
  getAlertWorkflows,
};

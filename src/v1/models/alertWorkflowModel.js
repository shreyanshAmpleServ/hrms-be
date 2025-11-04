const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");

// Configure PrismaClient with optimized settings
// Note: Connection pool settings should be in DATABASE_URL:
// postgresql://user:password@host:port/database?connection_limit=20&pool_timeout=20
// const prisma = new PrismaClient({
//   log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
// });

let prisma;

const getPrismaClient = () => {
  if (!prisma) {
    prisma = new PrismaClient({
      log:
        process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });

    const cleanup = async () => {
      await prisma.$disconnect();
    };

    process.on("beforeExit", cleanup);
    process.on("SIGINT", cleanup);
    process.on("SIGTERM", cleanup);
  }
  return prisma;
};

prisma = getPrismaClient();

// Retry wrapper for database operations
const withRetry = async (operation, retries = 3, baseDelay = 1000) => {
  let lastError;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      const isRetryable =
        error.message &&
        (error.message.includes("connection pool") ||
          error.message.includes("timeout") ||
          error.code === "P2024");

      if (isRetryable && attempt < retries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      break;
    }
  }

  if (lastError.message && lastError.message.includes("connection pool")) {
    throw new CustomError(
      "Database connection pool exhausted. Please try again later.",
      503
    );
  }
  throw lastError;
};

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
    if (error.message && error.message.includes("connection pool")) {
      throw new CustomError(
        `Database connection pool exhausted. Please try again later.`,
        503
      );
    }
    throw new CustomError(
      `Error creating alert workflow: ${error.message}`,
      500
    );
  }
};

const getAlertWorkflowById = async (id) => {
  let retries = 3;
  let lastError;

  while (retries > 0) {
    try {
      const workflow = await prisma.hrms_d_alert_workflow.findUnique({
        where: { id: parseInt(id) },
      });

      if (!workflow) {
        throw new CustomError("Workflow not found", 404);
      }

      workflow.conditions = JSON.parse(workflow.conditions || "[]");
      workflow.actions = JSON.parse(workflow.actions || "[]");
      return workflow;
    } catch (error) {
      lastError = error;

      if (
        error.message &&
        error.message.includes("connection pool") &&
        retries > 1
      ) {
        retries--;
        // Wait before retrying (exponential backoff)
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * (4 - retries))
        );
        continue;
      }

      throw new CustomError(
        error.message || "Error fetching workflow",
        error.statusCode || 503
      );
    }
  }

  throw new CustomError(
    lastError?.message || "Failed to fetch workflow after retries",
    503
  );
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
    if (error.message && error.message.includes("connection pool")) {
      throw new CustomError(
        `Database connection pool exhausted. Please try again later.`,
        503
      );
    }
    throw new CustomError(error.message, 500);
  }
};

const deleteAlertWorkflow = async (id) => {
  try {
    await prisma.hrms_d_alert_workflow.delete({ where: { id: parseInt(id) } });
  } catch (error) {
    if (error.message && error.message.includes("connection pool")) {
      throw new CustomError(
        `Database connection pool exhausted. Please try again later.`,
        503
      );
    }
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
    if (error.message && error.message.includes("connection pool")) {
      throw new CustomError(
        `Database connection pool exhausted. Please try again later.`,
        503
      );
    }
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

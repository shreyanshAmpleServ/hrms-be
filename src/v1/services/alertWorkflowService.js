// const alertWorkflowModel = require("../models/alertWorkflowModel.js");
// const { runWorkflow } = require("../../utils/alertWorkflowRunner.js");
// const cron = require("node-cron");
// const CustomError = require("../../utils/CustomError");

// const jobs = {};

// const safeJsonParse = (data) => {
//   if (typeof data === "object" && data !== null) {
//     return data;
//   }

//   if (typeof data === "string") {
//     if (!data.trim()) return [];

//     try {
//       return JSON.parse(data);
//     } catch (e) {
//       console.error("JSON parse error:", e.message, "Data:", data);
//       return [];
//     }
//   }

//   return [];
// };

// const createAlertWorkflow = async (data) => {
//   const workflow = await alertWorkflowModel.createAlertWorkflow(data);
//   if (workflow.is_active === "Y" && workflow.schedule_cron) {
//     scheduleCron(workflow.id, workflow.schedule_cron);
//   }
//   return workflow;
// };

// const getAllAlertWorkflows = async (search, page, size, startDate, endDate) => {
//   return await alertWorkflowModel.getAlertWorkflows(
//     search,
//     page,
//     size,
//     startDate,
//     endDate
//   );
// };

// const getAlertWorkflowById = async (id) => {
//   return await alertWorkflowModel.getAlertWorkflowById(id);
// };

// const updateAlertWorkflow = async (id, data) => {
//   if (jobs[id]) {
//     console.log(` Stopping cron job for workflow ${id}`);
//     jobs[id].stop();
//     delete jobs[id];
//   }

//   const workflow = await alertWorkflowModel.updateAlertWorkflow(id, data);

//   if (workflow.is_active === "Y" && workflow.schedule_cron) {
//     console.log(` Restarting cron job for workflow ${id}`);
//     scheduleCron(workflow.id, workflow.schedule_cron);
//   } else {
//     console.log(` Workflow ${id} is paused - cron job not scheduled`);
//   }

//   return workflow;
// };

// const deleteAlertWorkflow = async (id) => {
//   if (jobs[id]) {
//     console.log(` Stopping cron job for workflow ${id} before deletion`);
//     jobs[id].stop();
//     delete jobs[id];
//   }
//   return await alertWorkflowModel.deleteAlertWorkflow(id);
// };

// const runAlertWorkflow = async (workflowId) => {
//   try {
//     const workflow = await getAlertWorkflowById(workflowId);
//     if (!workflow) throw new CustomError("Workflow not found", 404);

//     if (workflow.is_active !== "Y") {
//       throw new CustomError("Workflow is paused and cannot be executed", 400);
//     }

//     const parsedWorkflow = {
//       ...workflow,
//       conditions: safeJsonParse(workflow.conditions),
//       actions: safeJsonParse(workflow.actions),
//     };

//     await runWorkflow(workflow.id, parsedWorkflow);
//   } catch (error) {
//     console.error(`Manual workflow execution failed:`, error);
//     throw error;
//   }
// };

// const init = async () => {
//   try {
//     console.log("[info] Initializing alert workflows...");
//     const result = await alertWorkflowModel.getAlertWorkflows();
//     const workflows = result.data || result;

//     const activeWorkflows = workflows.filter(
//       (w) => w.is_active === "Y" && w.schedule_cron
//     );

//     console.log(
//       `[info] Found ${activeWorkflows.length} active workflows to schedule`
//     );

//     activeWorkflows.forEach((w) => {
//       console.log(
//         `[info] Scheduling workflow ${w.id}: "${w.name}" with cron "${w.schedule_cron}"`
//       );
//       scheduleCron(w.id, w.schedule_cron);
//     });

//     console.log("[info] Alert workflow initialization completed");
//   } catch (error) {
//     console.error("[error] Failed to initialize alert workflows:", error);
//   }
// };

// function scheduleCron(workflowId, cronPattern) {
//   try {
//     if (!cronPattern) {
//       console.warn(
//         `[warn] No cron pattern provided for workflow ${workflowId}`
//       );
//       return;
//     }

//     if (jobs[workflowId]) {
//       jobs[workflowId].stop();
//       delete jobs[workflowId];
//     }

//     jobs[workflowId] = cron.schedule(
//       cronPattern,
//       async () => {
//         try {
//           const workflow = await getAlertWorkflowById(workflowId);

//           if (!workflow) {
//             console.error(
//               `[error] Workflow ${workflowId} not found during cron execution`
//             );
//             if (jobs[workflowId]) {
//               jobs[workflowId].stop();
//               jobs[workflowId].stop();
//               delete jobs[workflowId];
//             }
//             return;
//           }

//           if (workflow.is_active !== "Y") {
//             console.log(
//               `Workflow ${workflowId} is paused - skipping execution`
//             );
//             if (jobs[workflowId]) {
//               console.log(
//                 `Stopping cron job for paused workflow ${workflowId}`
//               );
//               jobs[workflowId].stop();
//               delete jobs[workflowId];
//             }
//             return;
//           }

//           console.log(
//             ` Cron job triggered for workflow ${workflowId} at ${new Date().toISOString()}`
//           );

//           const parsedWorkflow = {
//             ...workflow,
//             conditions: safeJsonParse(workflow.conditions),
//             actions: safeJsonParse(workflow.actions),
//           };

//           await runWorkflow(workflowId, parsedWorkflow);
//           console.log(` Cron job completed for workflow ${workflowId}`);
//         } catch (err) {
//           console.error(
//             ` Cron for workflow ${workflowId} failed:`,
//             err.message
//           );
//         }
//       },
//       {
//         scheduled: true,
//         timezone: "Asia/Kolkata",
//       }
//     );

//     console.log(
//       `[info] Cron job scheduled for workflow ${workflowId} with pattern: ${cronPattern}`
//     );
//   } catch (error) {
//     console.error(
//       `[error] Failed to schedule cron for workflow ${workflowId}:`,
//       error
//     );
//   }
// }

// function startScheduler() {
//   console.log("[info] Starting alert workflow scheduler...");
//   init();
// }

// const stopAllJobs = () => {
//   console.log("[info] Stopping all scheduled jobs...");
//   Object.keys(jobs).forEach((workflowId) => {
//     if (jobs[workflowId]) {
//       jobs[workflowId].stop();
//       delete jobs[workflowId];
//     }
//   });
//   console.log("[info] All scheduled jobs stopped");
// };

// process.on("SIGINT", () => {
//   console.log("[info] SIGINT received - shutting down gracefully");
//   stopAllJobs();
//   process.exit(0);
// });

// process.on("SIGTERM", () => {
//   console.log("[info] SIGTERM received - shutting down gracefully");
//   stopAllJobs();
//   process.exit(0);
// });

// module.exports = {
//   createAlertWorkflow,
//   getAllAlertWorkflows,
//   getAlertWorkflowById,
//   updateAlertWorkflow,
//   deleteAlertWorkflow,
//   runAlertWorkflow,
//   init,
//   startScheduler,
//   stopAllJobs,
// };

const alertWorkflowModel = require("../models/alertWorkflowModel");
const logger = require("../../Comman/logger");
const cron = require("node-cron");

const scheduledJobs = new Map();

const startScheduler = async () => {
  try {
    logger.info("Initializing alert workflows from tenant database...");

    await init();

    logger.info(" Alert workflow scheduler initialized");
  } catch (error) {
    logger.error(" Failed to start scheduler:", error);
    throw error;
  }
};

const init = async () => {
  try {
    logger.info(" Fetching active workflows...");

    const workflows = await alertWorkflowModel.getAlertWorkflows(null, 1, 1000);

    logger.info(
      ` Found ${workflows.data.length} active workflows to schedule`
    );

    for (const workflow of workflows.data) {
      try {
        await scheduleWorkflow(workflow);
        logger.info(
          ` Scheduled workflow ${workflow.id}: "${workflow.name}" with cron "${workflow.schedule_cron}"`
        );
      } catch (error) {
        logger.error(
          ` Failed to schedule workflow ${workflow.id}:`,
          error.message
        );
      }
    }

    logger.info(" Alert workflow initialization completed");
  } catch (error) {
    logger.error("Failed to initialize alert workflows:", error);
    throw error;
  }
};

const scheduleWorkflow = async (workflow) => {
  if (scheduledJobs.has(workflow.id)) {
    scheduledJobs.get(workflow.id).stop();
    scheduledJobs.delete(workflow.id);
  }

  if (!workflow.schedule_cron) {
    logger.warn(` Workflow ${workflow.id} has no cron expression, skipping`);
    return;
  }

  if (!cron.validate(workflow.schedule_cron)) {
    logger.error(
      ` Invalid cron expression for workflow ${workflow.id}: "${workflow.schedule_cron}"`
    );
    return;
  }

  const job = cron.schedule(
    workflow.schedule_cron,
    async () => {
      try {
        logger.info(` Executing workflow ${workflow.id}: "${workflow.name}"`);
        await executeWorkflow(workflow);
        logger.info(` Workflow ${workflow.id} executed successfully`);
      } catch (error) {
        logger.error(
          ` Workflow ${workflow.id} execution failed:`,
          error.message
        );
      }
    },
    {
      scheduled: true,
      timezone: "Asia/Kolkata", 
    }
  );

  scheduledJobs.set(workflow.id, job);
  logger.info(
    `Cron job scheduled for workflow ${workflow.id} with pattern: ${workflow.schedule_cron}`
  );
};

const executeWorkflow = async (workflow) => {


  logger.info(` Processing workflow: ${workflow.name}`);

  
};

const stopScheduler = () => {
  logger.info(" Stopping all scheduled workflows...");

  scheduledJobs.forEach((job, workflowId) => {
    job.stop();
    logger.info(` Stopped workflow ${workflowId}`);
  });

  scheduledJobs.clear();
  logger.info(" All workflows stopped");
};

module.exports = {
  startScheduler,
  stopScheduler,
  scheduleWorkflow,
  executeWorkflow,
  init,
};

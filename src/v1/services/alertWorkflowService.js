// // const alertWorkflowModel = require("../models/alertWorkflowModel.js");
// // const { runWorkflow } = require("../../utils/alertWorkflowRunner.js");
// // const cron = require("node-cron");
// // const jobs = {};

// // const createAlertWorkflow = async (data) => {
// //   const workflow = await alertWorkflowModel.createAlertWorkflow(data);
// //   if (workflow.is_active === "Y" && workflow.schedule_cron) {
// //     scheduleCron(workflow.id, workflow.schedule_cron);
// //   }
// //   return workflow;
// // };

// // const getAllAlertWorkflows = async (search, page, size, startDate, endDate) => {
// //   return await alertWorkflowModel.getAlertWorkflows(
// //     search,
// //     page,
// //     size,
// //     startDate,
// //     endDate
// //   );
// // };

// // const getAlertWorkflowById = async (id) => {
// //   return await alertWorkflowModel.getAlertWorkflowById(id);
// // };

// // const updateAlertWorkflow = async (id, data) => {
// //   if (jobs[id]) {
// //     jobs[id].stop();
// //     delete jobs[id];
// //   }
// //   const workflow = await alertWorkflowModel.updateAlertWorkflow(id, data);
// //   if (workflow.is_active === "Y" && workflow.schedule_cron) {
// //     scheduleCron(workflow.id, workflow.schedule_cron);
// //   }
// //   return workflow;
// // };

// // const deleteAlertWorkflow = async (id) => {
// //   if (jobs[id]) {
// //     jobs[id].stop();
// //     delete jobs[id];
// //   }
// //   return await alertWorkflowModel.deleteAlertWorkflow(id);
// // };

// // const runAlertWorkflow = async (workflowId) => {
// //   const workflow = await getAlertWorkflowById(workflowId);
// //   if (!workflow) throw new CustomError("Workflow not found", 404);
// //   await runWorkflow(workflow.id, workflow); // runWorkflow is your execution engine
// // };

// // // Schedule all active workflows on app start
// // const init = async () => {
// //   const workflows = await alertWorkflowModel.getAlertWorkflows();
// //   workflows
// //     .filter((w) => w.is_active === "Y" && w.schedule_cron)
// //     .forEach((w) => scheduleCron(w.id, w.schedule_cron));
// // };

// // // Internal helper to schedule/unschedule a cron job for a workflow
// // function scheduleCron(workflowId, cronPattern) {
// //   if (!cronPattern) return;
// //   if (jobs[workflowId]) jobs[workflowId].stop();
// //   jobs[workflowId] = cron.schedule(cronPattern, async () => {
// //     try {
// //       await runWorkflow(workflowId, await getAlertWorkflowById(workflowId));
// //     } catch (err) {
// //       console.error(`Cron for workflow ${workflowId} failed:`, err);
// //     }
// //   });
// // }

// // module.exports = {
// //   createAlertWorkflow,
// //   getAllAlertWorkflows,
// //   getAlertWorkflowById,
// //   updateAlertWorkflow,
// //   deleteAlertWorkflow,
// //   runAlertWorkflow,
// //   init,
// // };

// const alertWorkflowModel = require("../models/alertWorkflowModel.js");
// const { runWorkflow } = require("../../utils/alertWorkflowRunner.js");
// const cron = require("node-cron");
// const { PrismaClient } = require("@prisma/client");
// const CustomError = require("../../utils/CustomError");

// const prisma = new PrismaClient();
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
//     jobs[id].stop();
//     delete jobs[id];
//   }
//   const workflow = await alertWorkflowModel.updateAlertWorkflow(id, data);
//   if (workflow.is_active === "Y" && workflow.schedule_cron) {
//     scheduleCron(workflow.id, workflow.schedule_cron);
//   }
//   return workflow;
// };

// const deleteAlertWorkflow = async (id) => {
//   if (jobs[id]) {
//     jobs[id].stop();
//     delete jobs[id];
//   }
//   return await alertWorkflowModel.deleteAlertWorkflow(id);
// };

// const runAlertWorkflow = async (workflowId) => {
//   try {
//     const workflow = await getAlertWorkflowById(workflowId);
//     if (!workflow) throw new CustomError("Workflow not found", 404);

//     const parsedWorkflow = {
//       ...workflow,
//       conditions: safeJsonParse(workflow.conditions),
//       actions: safeJsonParse(workflow.actions),
//     };

//     // console.log(` Running workflow ${workflowId} manually`);
//     await runWorkflow(workflow.id, parsedWorkflow);
//     // console.log(` Workflow ${workflowId} completed successfully`);
//   } catch (error) {
//     console.error(`Manual workflow execution failed:`, error);
//     throw error;
//   }
// };

// const init = async () => {
//   try {
//     // console.log(" Initializing alert workflows...");
//     const result = await alertWorkflowModel.getAlertWorkflows();
//     const workflows = result.data || result;

//     const activeWorkflows = workflows.filter(
//       (w) => w.is_active === "Y" && w.schedule_cron
//     );
//     // console.log(
//     //   ` Found ${activeWorkflows.length} active workflows to schedule`
//     // );

//     activeWorkflows.forEach((w) => {
//       // console.log(
//       //   ` Scheduling workflow ${w.id}: "${w.name}" with cron "${w.schedule_cron}"`
//       // );
//       scheduleCron(w.id, w.schedule_cron);
//     });

//     // console.log(" Alert workflow initialization completed");
//   } catch (error) {
//     console.error("Failed to initialize alert workflows:", error);
//   }
// };

// function scheduleCron(workflowId, cronPattern) {
//   try {
//     if (!cronPattern) {
//       console.warn(`No cron pattern provided for workflow ${workflowId}`);
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
//           // console.log(
//           //   ` Cron job triggered for workflow ${workflowId} at ${new Date().toISOString()}`
//           // );

//           const workflow = await getAlertWorkflowById(workflowId);
//           if (!workflow) {
//             console.error(
//               ` Workflow ${workflowId} not found during cron execution`
//             );
//             return;
//           }

//           const parsedWorkflow = {
//             ...workflow,
//             conditions: safeJsonParse(workflow.conditions),
//             actions: safeJsonParse(workflow.actions),
//           };

//           // console.log(` Parsed workflow data:`, {
//           //   conditions: parsedWorkflow.conditions,
//           //   actions: parsedWorkflow.actions,
//           // });

//           await runWorkflow(workflowId, parsedWorkflow);
//           // console.log(
//           //   ` Cron job completed successfully for workflow ${workflowId}`
//           // );
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

//     // console.log(
//     //   ` Cron job scheduled for workflow ${workflowId} with pattern: ${cronPattern}`
//     // );
//   } catch (error) {
//     console.error(
//       ` Failed to schedule cron for workflow ${workflowId}:`,
//       error
//     );
//   }
// }

// function startScheduler() {
//   // console.log(" Starting alert workflow scheduler...");
//   init();
// }

// const stopAllJobs = () => {
//   console.log(" Stopping all scheduled jobs...");
//   Object.keys(jobs).forEach((workflowId) => {
//     if (jobs[workflowId]) {
//       jobs[workflowId].stop();
//       delete jobs[workflowId];
//     }
//   });
//   console.log("All scheduled jobs stopped");
// };

// process.on("SIGINT", () => {
//   stopAllJobs();
//   process.exit(0);
// });

// process.on("SIGTERM", () => {
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

const alertWorkflowModel = require("../models/alertWorkflowModel.js");
const { runWorkflow } = require("../../utils/alertWorkflowRunner.js");
const cron = require("node-cron");
const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");

const prisma = new PrismaClient();
const jobs = {};

const safeJsonParse = (data) => {
  if (typeof data === "object" && data !== null) {
    return data;
  }

  if (typeof data === "string") {
    if (!data.trim()) return [];

    try {
      return JSON.parse(data);
    } catch (e) {
      console.error("JSON parse error:", e.message, "Data:", data);
      return [];
    }
  }

  return [];
};

const createAlertWorkflow = async (data) => {
  const workflow = await alertWorkflowModel.createAlertWorkflow(data);
  if (workflow.is_active === "Y" && workflow.schedule_cron) {
    scheduleCron(workflow.id, workflow.schedule_cron);
  }
  return workflow;
};

const getAllAlertWorkflows = async (search, page, size, startDate, endDate) => {
  return await alertWorkflowModel.getAlertWorkflows(
    search,
    page,
    size,
    startDate,
    endDate
  );
};

const getAlertWorkflowById = async (id) => {
  return await alertWorkflowModel.getAlertWorkflowById(id);
};

const updateAlertWorkflow = async (id, data) => {
  if (jobs[id]) {
    console.log(` Stopping cron job for workflow ${id}`);
    jobs[id].stop();
    delete jobs[id];
  }

  const workflow = await alertWorkflowModel.updateAlertWorkflow(id, data);

  if (workflow.is_active === "Y" && workflow.schedule_cron) {
    console.log(` Restarting cron job for workflow ${id}`);
    scheduleCron(workflow.id, workflow.schedule_cron);
  } else {
    console.log(` Workflow ${id} is paused - cron job not scheduled`);
  }

  return workflow;
};

const deleteAlertWorkflow = async (id) => {
  if (jobs[id]) {
    console.log(` Stopping cron job for workflow ${id} before deletion`);
    jobs[id].stop();
    delete jobs[id];
  }
  return await alertWorkflowModel.deleteAlertWorkflow(id);
};

const runAlertWorkflow = async (workflowId) => {
  try {
    const workflow = await getAlertWorkflowById(workflowId);
    if (!workflow) throw new CustomError("Workflow not found", 404);

    if (workflow.is_active !== "Y") {
      throw new CustomError("Workflow is paused and cannot be executed", 400);
    }

    const parsedWorkflow = {
      ...workflow,
      conditions: safeJsonParse(workflow.conditions),
      actions: safeJsonParse(workflow.actions),
    };

    await runWorkflow(workflow.id, parsedWorkflow);
  } catch (error) {
    console.error(`Manual workflow execution failed:`, error);
    throw error;
  }
};

const init = async () => {
  try {
    console.log("[info] Initializing alert workflows...");
    const result = await alertWorkflowModel.getAlertWorkflows();
    const workflows = result.data || result;

    const activeWorkflows = workflows.filter(
      (w) => w.is_active === "Y" && w.schedule_cron
    );

    console.log(
      `[info] Found ${activeWorkflows.length} active workflows to schedule`
    );

    activeWorkflows.forEach((w) => {
      console.log(
        `[info] Scheduling workflow ${w.id}: "${w.name}" with cron "${w.schedule_cron}"`
      );
      scheduleCron(w.id, w.schedule_cron);
    });

    console.log("[info] Alert workflow initialization completed");
  } catch (error) {
    console.error("[error] Failed to initialize alert workflows:", error);
  }
};

function scheduleCron(workflowId, cronPattern) {
  try {
    if (!cronPattern) {
      console.warn(
        `[warn] No cron pattern provided for workflow ${workflowId}`
      );
      return;
    }

    if (jobs[workflowId]) {
      jobs[workflowId].stop();
      delete jobs[workflowId];
    }

    jobs[workflowId] = cron.schedule(
      cronPattern,
      async () => {
        try {
          const workflow = await getAlertWorkflowById(workflowId);

          if (!workflow) {
            console.error(
              `[error] Workflow ${workflowId} not found during cron execution`
            );
            if (jobs[workflowId]) {
              jobs[workflowId].stop();
              jobs[workflowId].stop();
              delete jobs[workflowId];
            }
            return;
          }

          if (workflow.is_active !== "Y") {
            console.log(
              `Workflow ${workflowId} is paused - skipping execution`
            );
            if (jobs[workflowId]) {
              console.log(
                `Stopping cron job for paused workflow ${workflowId}`
              );
              jobs[workflowId].stop();
              delete jobs[workflowId];
            }
            return;
          }

          console.log(
            ` Cron job triggered for workflow ${workflowId} at ${new Date().toISOString()}`
          );

          const parsedWorkflow = {
            ...workflow,
            conditions: safeJsonParse(workflow.conditions),
            actions: safeJsonParse(workflow.actions),
          };

          await runWorkflow(workflowId, parsedWorkflow);
          console.log(` Cron job completed for workflow ${workflowId}`);
        } catch (err) {
          console.error(
            ` Cron for workflow ${workflowId} failed:`,
            err.message
          );
        }
      },
      {
        scheduled: true,
        timezone: "Asia/Kolkata",
      }
    );

    console.log(
      `[info] Cron job scheduled for workflow ${workflowId} with pattern: ${cronPattern}`
    );
  } catch (error) {
    console.error(
      `[error] Failed to schedule cron for workflow ${workflowId}:`,
      error
    );
  }
}

function startScheduler() {
  console.log("[info] Starting alert workflow scheduler...");
  init();
}

const stopAllJobs = () => {
  console.log("[info] Stopping all scheduled jobs...");
  Object.keys(jobs).forEach((workflowId) => {
    if (jobs[workflowId]) {
      jobs[workflowId].stop();
      delete jobs[workflowId];
    }
  });
  console.log("[info] All scheduled jobs stopped");
};

process.on("SIGINT", () => {
  console.log("[info] SIGINT received - shutting down gracefully");
  stopAllJobs();
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("[info] SIGTERM received - shutting down gracefully");
  stopAllJobs();
  process.exit(0);
});

module.exports = {
  createAlertWorkflow,
  getAllAlertWorkflows,
  getAlertWorkflowById,
  updateAlertWorkflow,
  deleteAlertWorkflow,
  runAlertWorkflow,
  init,
  startScheduler,
  stopAllJobs,
};

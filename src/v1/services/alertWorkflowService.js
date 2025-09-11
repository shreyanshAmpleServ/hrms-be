const alertWorkflowModel = require("../models/alertWorkflowModel.js");
const { runWorkflow } = require("../../utils/alertWorkflowRunner.js");
const cron = require("node-cron");
const jobs = {};

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
    jobs[id].stop();
    delete jobs[id];
  }
  const workflow = await alertWorkflowModel.updateAlertWorkflow(id, data);
  if (workflow.is_active === "Y" && workflow.schedule_cron) {
    scheduleCron(workflow.id, workflow.schedule_cron);
  }
  return workflow;
};

const deleteAlertWorkflow = async (id) => {
  if (jobs[id]) {
    jobs[id].stop();
    delete jobs[id];
  }
  return await alertWorkflowModel.deleteAlertWorkflow(id);
};

const runAlertWorkflow = async (workflowId) => {
  const workflow = await getAlertWorkflowById(workflowId);
  if (!workflow) throw new CustomError("Workflow not found", 404);
  await runWorkflow(workflow.id, workflow);
};

const init = async () => {
  const workflows = await alertWorkflowModel.getAlertWorkflows();
  workflows
    .filter((w) => w.is_active === "Y" && w.schedule_cron)
    .forEach((w) => scheduleCron(w.id, w.schedule_cron));
};

// Internal helper to schedule/unschedule a cron job for a workflow
// function scheduleCron(workflowId, cronPattern) {
//   if (!cronPattern) return;
//   if (jobs[workflowId]) jobs[workflowId].stop();
//   jobs[workflowId] = cron.schedule(cronPattern, async () => {
//     try {
//       await runWorkflow(workflowId, await getAlertWorkflowById(workflowId));
//     } catch (err) {
//       console.error(`Cron for workflow ${workflowId} failed:`, err);
//     }
//   });
// }

function startScheduler() {
  prisma.hrms_d_alert_workflow
    .findMany({
      where: { is_active: "Y", schedule_cron: { not: null } },
    })
    .then((workflows) => {
      workflows.forEach((wf) => {
        cron.schedule(wf.schedule_cron, () => {
          require("../../utils/alertWorkflowRunner.js")
            .runWorkflow(wf.id, wf)
            .catch(console.error);
        });
      });
    });
}

module.exports = {
  createAlertWorkflow,
  getAllAlertWorkflows,
  getAlertWorkflowById,
  updateAlertWorkflow,
  deleteAlertWorkflow,
  runAlertWorkflow,
  init,
};

// src/services/cronOrchestrator.js
const prisma = require("../../prisma/client");
const CustomError = require("../../utils/CustomError");
const { getAlertWorkflowById } = require("../models/alertWorkflowModel.js");

class CronOrchestrator {
  constructor() {
    this.maxConcurrentWorkflows = 3;
    this.executingWorkflows = new Set();
    this.workflowQueue = [];
  }

  async executeWorkflowWithConnectionManagement(workflowId) {
    while (this.executingWorkflows.size >= this.maxConcurrentWorkflows) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    this.executingWorkflows.add(workflowId);

    try {
      const workflow = await this.getWorkflowWithRetry(workflowId);
      if (!workflow) {
        console.warn(`Workflow ${workflowId} not found`);
        return;
      }

      await this.processWorkflow(workflow);
      console.log(`Workflow ${workflowId} completed successfully`);
    } catch (error) {
      console.error(`Cron for workflow ${workflowId} failed:`, error.message);
    } finally {
      this.executingWorkflows.delete(workflowId);
      await prisma.$queryRaw`SELECT 1`;
    }
  }

  async getWorkflowWithRetry(workflowId, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const workflow = await Promise.race([
          getAlertWorkflowById(workflowId),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Query timeout")), 8000)
          ),
        ]);
        return workflow;
      } catch (error) {
        if (attempt < maxRetries) {
          const backoffTime = 1000 * Math.pow(2, attempt - 1); // Exponential backoff
          console.warn(
            `Workflow ${workflowId} query failed (attempt ${attempt}), retrying in ${backoffTime}ms:`,
            error.message
          );
          await new Promise((resolve) => setTimeout(resolve, backoffTime));
        } else {
          throw new CustomError(
            `Failed to fetch workflow ${workflowId} after ${maxRetries} attempts`,
            503
          );
        }
      }
    }
  }

  async processWorkflow(workflow) {
    const conditions = JSON.parse(workflow.conditions || "[]");
    const actions = JSON.parse(workflow.actions || "[]");
    console.log(`Processing workflow: ${workflow.name}`);
  }
}

module.exports = new CronOrchestrator();

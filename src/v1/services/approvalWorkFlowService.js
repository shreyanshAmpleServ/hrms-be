const approvalWorkFlowModel = require("../models/approvalWorkFlowModel.js");
// const {
//   DEFAULT_WORKFLOW_TYPES,
//   DEFAULT_CREATOR_CONFIG,
// } = require("../../config/defaultWorkflows.js");
// const path = require("path");

// const BACKUP_DIR = path.join(__dirname, "../backups");
// const BACKUP_FILE = path.join(BACKUP_DIR, "approval_workflows_backup.json");

// const ensureBackupDir = async () => {
//   try {
//     await fs.access(BACKUP_DIR);
//   } catch {
//     await fs.mkdir(BACKUP_DIR, { recursive: true });
//   }
// };

// // Create backup of all workflow
// const createBackup = async () => {
//   try {
//     await ensureBackupDir();

//     const allWorkflows = await approvalWorkFlowModel.getAllApprovalWorkFlow(
//       null,
//       1,
//       10000,
//       null,
//       null
//     );

//     const backupData = {
//       timestamp: new Date().toISOString(),
//       version: "1.0",
//       data: allWorkflows.data || [],
//       totalCount: allWorkflows.totalCount || 0,
//     };

//     await fs.writeFile(BACKUP_FILE, JSON.stringify(backupData, null, 2));
//     console.log(` Backup created successfully at ${BACKUP_FILE}`);
//     return true;
//   } catch (error) {
//     console.error(" Error creating backup:", error);
//     return false;
//   }
// };

// // Initialize default workflow types (keys only) when database is empty
// const initializeDefaultWorkflowTypes = async () => {
//   try {
//     console.log(" Initializing default approval workflow types...");

//     let totalCreated = 0;

//     for (const workflowType of DEFAULT_WORKFLOW_TYPES) {
//       const workflowToCreate = [
//         {
//           request_type: workflowType,
//           sequence: 1,
//           approver_id: DEFAULT_CREATOR_CONFIG.default_approver_id,
//           is_active: DEFAULT_CREATOR_CONFIG.is_active,
//           createdby: DEFAULT_CREATOR_CONFIG.createdby,
//           log_inst: DEFAULT_CREATOR_CONFIG.log_inst,
//         },
//       ];

//       try {
//         const createdWorkflows =
//           await approvalWorkFlowModel.createApprovalWorkFlow(workflowToCreate);
//         totalCreated += createdWorkflows.length;
//         console.log(` Created workflow type: ${workflowType}`);
//       } catch (error) {
//         console.error(
//           ` Error creating workflow type ${workflowType}:`,
//           error.message
//         );
//       }
//     }

//     console.log(
//       ` Default workflow types initialization completed! Total created: ${totalCreated}`
//     );
//     console.log(
//       ` Note: All workflows created with placeholder approver ID ${DEFAULT_CREATOR_CONFIG.default_approver_id}`
//     );
//     console.log(
//       ` You can now assign specific approvers through your application interface`
//     );

//     // Create initial backup after setting up defaults
//     await createBackup();

//     return {
//       success: true,
//       totalCreated,
//       workflowTypes: DEFAULT_WORKFLOW_TYPES,
//       message: "Default workflow types created with placeholder approvers",
//     };
//   } catch (error) {
//     console.error(" Error initializing default workflow types:", error);
//     return { success: false, error: error.message };
//   }
// };

// // Restore data from backup file
// const restoreFromBackup = async () => {
//   try {
//     const backupExists = await fs
//       .access(BACKUP_FILE)
//       .then(() => true)
//       .catch(() => false);

//     if (!backupExists) {
//       console.log(
//         " No backup file found, initializing with default workflow types..."
//       );
//       return await initializeDefaultWorkflowTypes();
//     }

//     const backupContent = await fs.readFile(BACKUP_FILE, "utf-8");
//     const backupData = JSON.parse(backupContent);

//     if (!backupData.data || !Array.isArray(backupData.data)) {
//       console.log(
//         " Invalid backup data format, falling back to default workflow types"
//       );
//       return await initializeDefaultWorkflowTypes();
//     }

//     console.log(
//       ` Restoring data from backup created at ${backupData.timestamp}`
//     );

//     let totalRestored = 0;

//     for (const requestTypeData of backupData.data) {
//       if (
//         requestTypeData.request_approval_request &&
//         requestTypeData.request_approval_request.length > 0
//       ) {
//         const workflowsToCreate = requestTypeData.request_approval_request.map(
//           (workflow) => ({
//             request_type: workflow.request_type,
//             sequence: workflow.sequence,
//             approver_id: workflow.approver_id,
//             is_active: workflow.is_active || "Y",
//             createdby: workflow.createdby || DEFAULT_CREATOR_CONFIG.createdby,
//             log_inst: workflow.log_inst || DEFAULT_CREATOR_CONFIG.log_inst,
//           })
//         );

//         try {
//           const created = await approvalWorkFlowModel.createApprovalWorkFlow(
//             workflowsToCreate
//           );
//           totalRestored += created.length;
//           console.log(
//             `Restored ${created.length} workflows for ${requestTypeData.request_type}`
//           );
//         } catch (error) {
//           console.error(
//             ` Error restoring ${requestTypeData.request_type}:`,
//             error.message
//           );
//         }
//       }
//     }

//     console.log(
//       ` Data restored successfully from backup! Total restored: ${totalRestored}`
//     );
//     return { success: true, totalRestored, source: "backup" };
//   } catch (error) {
//     console.error(" Error restoring from backup:", error);
//     console.log("Falling back to default workflow types...");
//     return await initializeDefaultWorkflowTypes();
//   }
// };

// // Check if database is empty and restore if needed
// const checkAndRestoreIfEmpty = async () => {
//   try {
//     const result = await approvalWorkFlowModel.getAllApprovalWorkFlow(
//       null,
//       1,
//       1,
//       null,
//       null
//     );

//     if (!result.data || result.data.length === 0 || result.totalCount === 0) {
//       console.log(" Database appears to be empty, initiating restoration...");
//       const restoreResult = await restoreFromBackup();

//       if (restoreResult.success) {
//         console.log(
//           `Successfully restored workflow types from ${
//             restoreResult.source || "defaults"
//           }`
//         );
//       } else {
//         console.error(" Failed to restore workflow types");
//       }

//       return restoreResult;
//     }

//     return {
//       success: true,
//       message: "Database has data, no restoration needed",
//     };
//   } catch (error) {
//     console.error("Error checking database status:", error);
//     return { success: false, error: error.message };
//   }
// };
const createApprovalWorkFlow = async (data) => {
  return await approvalWorkFlowModel.createApprovalWorkFlow(data);
};

const findApprovalWorkFlow = async (request_id) => {
  return await approvalWorkFlowModel.findApprovalWorkFlow(request_id);
};

const updateApprovalWorkFlow = async (id, data) => {
  return await approvalWorkFlowModel.updateApprovalWorkFlow(id, data);
};

const deleteApprovalWorkFlow = async (requestType) => {
  return await approvalWorkFlowModel.deleteApprovalWorkFlow(requestType);
};

const deleteApprovalWorkFlows = async (ids) => {
  return await approvalWorkFlowModel.deleteApprovalWorkFlows(ids);
};

const getAllApprovalWorkFlowByRequest = async (requestType) => {
  return await approvalWorkFlowModel.getAllApprovalWorkFlowByRequest(
    requestType
  );
};

const getAllApprovalWorkFlow = async (
  search,
  page,
  size,
  startDate,
  endDate
) => {
  return await approvalWorkFlowModel.getAllApprovalWorkFlow(
    search,
    page,
    size,
    startDate,
    endDate
  );
};

module.exports = {
  createApprovalWorkFlow,
  findApprovalWorkFlow,
  updateApprovalWorkFlow,
  deleteApprovalWorkFlow,
  deleteApprovalWorkFlows,
  getAllApprovalWorkFlow,
  getAllApprovalWorkFlowByRequest,
};

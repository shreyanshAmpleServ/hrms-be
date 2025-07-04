const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * @param {Object} options
 * @param {number} options.employee_id - ID of the user performing the action.
 * @param {string} options.module - Name of the module (e.g., "Probation", "Leave").
 * @param {string} options.action_type - Action performed (e.g., "CREATE", "UPDATE", "DELETE").
 * @param {string} options.activity - Human-readable summary of the activity.
 * @param {number} [options.reference_id] - Related entity ID.
 * @param {string} [options.description] - Additional context/details.
 */
const logActivity = async ({
  employee_id,
  module,
  action_type,
  activity,
  reference_id = null,
  description = null,
}) => {
  try {
    await prisma.hrms_d_activity_log.create({
      data: {
        employee_id,
        module,
        action_type,
        activity,
        reference_id,
        description,
      },
    });
  } catch (error) {
    console.error("Activity Logger Error:", error.message);
  }
};

module.exports = { logActivity };

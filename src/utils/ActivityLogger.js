// // const { prisma } = require("../../utils/prismaProxy");
// //

// // /**
// //  * @param {Object} options
// //  * @param {number} options.employee_id - ID of the user performing the action.
// //  * @param {string} options.module - Name of the module (e.g., "Probation", "Leave").
// //  * @param {string} options.action_type - Action performed (e.g., "CREATE", "UPDATE", "DELETE").
// //  * @param {string} options.activity - Human-readable summary of the activity.
// //  * @param {number} [options.reference_id] - Related entity ID.
// //  * @param {string} [options.description] - Additional context/details.
// //  */
// // const logActivity = async ({
// //   employee_id,
// //   module,
// //   action_type,
// //   activity,
// //   reference_id = null,
// //   description = null,
// // }) => {
// //   try {
// //     await prisma.hrms_d_activity_log.create({
// //       data: {
// //         employee_id,
// //         module,
// //         action_type,
// //         activity,
// //         reference_id,
// //         description,
// //       },
// //     });
// //   } catch (error) {
// //     console.error("Activity Logger Error:", error.message);
// //   }
// // };

// // module.exports = { logActivity };

// const { prisma } = require("../../utils/prismaProxy");
//

// /**
//  * @param {Object} options
//  */
// const logActivity = async ({
//   employee_id,
//   module,
//   action_type,
//   activity,
//   reference_id = null,
//   description = null,
// }) => {
//   try {
//     console.log("Logging activity >>>", {
//       employee_id,
//       module,
//       action_type,
//       activity,
//       reference_id,
//       description,
//     });

//     const result = await prisma.hrms_d_activity_log.create({
//       data: {
//         employee_id,
//         module,
//         action_type,
//         activity,
//         reference_id,
//         description,
//       },
//     });

//     console.log("Activity log inserted successfully:", result);
//   } catch (error) {
//     console.error("Activity Logger Error:", error);
//   }
// };

// module.exports = { logActivity };
const { prisma } = require("../../utils/prismaProxy");

const logActivity = async ({
  employee_id,
  module,
  activity,
  reference_id = null,
  description = null,
  action_type = "POST",
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
    console.log("📥 logActivity called with:", {
      employee_id,
      module,
      action_type,
      activity,
      reference_id,
    });
  } catch (error) {
    console.error("Activity Logger Error:", error.message);
  }
};

module.exports = { logActivity };

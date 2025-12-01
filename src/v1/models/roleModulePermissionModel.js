const { prisma } = require("../../utils/prismaProxy.js");
const CustomError = require("../../utils/CustomError");

// Serialize `permissions` before saving it
const serializePermission = (data) => {
  if (data.permissions) {
    data.permissions = JSON.stringify(data.permissions);
  }
  return data;
};

// Parse `permissions` after retrieving it
const parsePermissions = (data) => {
  if (data && data.permissions) {
    data.permissions = JSON.parse(data.permissions);
  }
  return data;
};

// const validateModuleIds = async (permissions) => {
//   const moduleIds = permissions.map((perm) => perm.moduleId);
//   const existingModules = await prisma.hrms_m_module.findMany({
//     where: { id: { in: moduleIds } },
//     select: { id: true },
//   });

//   const validModuleIds = new Set(existingModules.map((m) => m.id));

//   return permissions.every((perm) => validModuleIds.has(perm.moduleId));
// };

// Function to create role permissions

// const createPermission = async (reqBody) => {
//   const {role_id,permissions, ...data} = reqBody
//   try {
//     // Validate permissions format
//     if (
//       !Array.isArray(permissions) ||
//       !permissions.every(
//         (perm) =>
//           typeof perm.module_id === "number" &&
//           perm.permissions &&
//           ["view", "update", "create", "delete"].every((key) =>
//             typeof perm.permissions[key] === "boolean"
//           )
//       )
//     ) {
//       throw new Error("Invalid permissions format");
//     }

//     // // Validate module IDs exist in `hrms_m_module`
//     // const isValidModules = await validateModuleIds(permissions);
//     // if (!isValidModules) {
//     //   throw new Error("One or more moduleIds are invalid");
//     // }

//     // Store as JSON
//     const newPermission = await prisma.hrms_d_role_permissions.create({
//       data: {
//         ...data,
//         role_id,
//         permissions: JSON.stringify(permissions), // Convert JSON to string
//         is_active: "Y",
//         log_inst: 1,
//         createdate: new Date(),
//         updatedate: new Date(),
//         createdby : 1,
//       },
//     });
//     console.log("Created Data ", newPermission)
//    // Default permissions (all false)
//    const formattedPermissions ={...newPermission ,
//     permissions: JSON.parse(newPermission.permissions)
//    }
//   // return {
//   //   role_id : role_id || null,
//   //   permissions: formattedPermissions,
//   // };
//     return formattedPermissions;
//   } catch (error) {
//     console.error("Error creating role permissions:", error);
//     throw new Error(`Failed to create role permissions: ${error.message}`);
//   }
// };
const createPermission = async (reqBody) => {
  const { role_id, permissions, ...data } = reqBody;
  try {
    // Validate permissions format
    if (
      !Array.isArray(permissions) ||
      !permissions.every(
        (perm) =>
          typeof perm.module_id === "number" &&
          perm.permissions &&
          ["view", "update", "create", "delete"].every(
            (key) => typeof perm.permissions[key] === "boolean"
          )
      )
    ) {
      throw new Error("Invalid permissions format");
    }
    // // Validate module IDs exist in `hrms_m_module`
    // const isValidModules = await validateModuleIds(permissions);
    // if (!isValidModules) {
    //   throw new Error("One or more moduleIds are invalid");
    // }

    // Check if permissions already exist for this role_id
    const existingPermission = await prisma.hrms_d_role_permissions.findFirst({
      where: { role_id },
    });

    let updatedPermission;
    if (existingPermission) {
      // If exists, update the entry
      updatedPermission = await prisma.hrms_d_role_permissions.update({
        where: { id: existingPermission.id },
        data: {
          permissions: JSON.stringify(permissions), // Update JSON data
          updatedate: new Date(), // Update timestamp
          updatedby: 1,
        },
      });
    } else {
      // If not, create a new entry
      updatedPermission = await prisma.hrms_d_role_permissions.create({
        data: {
          ...data,
          role_id,
          permissions: JSON.stringify(permissions), // Store JSON as a string
          is_active: "Y",
          log_inst: 1,
          createdate: new Date(),
          updatedate: new Date(),
          createdby: 1,
        },
      });
    }

    console.log("Updated Data", updatedPermission);

    // Parse JSON before returning
    return {
      ...updatedPermission,
      permissions: JSON.parse(updatedPermission.permissions),
    };
  } catch (error) {
    console.error("Error creating/updating role permissions:", error);
    throw new Error(
      `Failed to create/update role permissions: ${error.message}`
    );
  }
};

const findContactById = async (id) => {
  try {
    const contact = await prisma.hrms_d_role_permissions.findUnique({
      where: { id: parseInt(id) },
      include: {
        company_details: true,
        owner_details: true,
        deal_details: true,
        source_details: true,
        industry_details: true,
        contact_State: {
          select: {
            id: true,
            name: true,
          },
        },
        contact_Country: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });
    return parsePermissions(contact);
  } catch (error) {
    throw new CustomError("Error finding contact by ID", 503);
  }
};

const updateContact = async (id, data) => {
  try {
    // Add a date field with the current timestamp
    const updatedData = {
      ...data,
      updatedate: new Date(), // Add or update the date field
    };
    const serializedData = serializePermission(updatedData);
    const contact = await prisma.hrms_d_role_permissions.update({
      where: { id: parseInt(id) },
      data: {
        ...serializedData,
        updatedate: new Date(),
      },
      include: {
        contact_State: {
          select: {
            id: true,
            name: true,
          },
        },
        contact_Country: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });
    return parsePermissions(contact);
  } catch (error) {
    console.log("Update Contact Error : ", error);
    throw new CustomError(`Error updating contact: ${error.message}`, 500);
  }
};

const deleteContact = async (id) => {
  try {
    // Delete dependent rows in crms_d_deal_contacts
    await prisma.dealContacts.deleteMany({
      where: { contactId: parseInt(id) },
    });

    await prisma.hrms_d_role_permissions.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    if (error.code === "P2003") {
      throw new CustomError(
        "This record is connected to other data. Please remove that first.",
        400
      );
    } else {
      throw new CustomError(error.meta.constraint, 500);
    }
  }
};

const getAllPermission = async (id) => {
  const role_id = Number(id);

  try {
    // Check if permissions already exist for this role_id
    let savedPermissions = await prisma.hrms_d_role_permissions.findFirst({
      where: { role_id },
      // include: { crms_m_roles: true }, // Fetch role details
    });

    // Ensure modules are seeded by checking count first
    const moduleCount = await prisma.hrms_m_module.count();
    if (moduleCount === 0) {
      // Import and seed modules
      const mockModules = require("../../mock/module.mock.js");
      for (const moduleData of mockModules) {
        await prisma.hrms_m_module.create({
          data: {
            module_name: moduleData.module_name,
            description: moduleData.description || "",
            is_active: moduleData.is_active || "Y",
            log_inst: moduleData.log_inst || 1,
            createdby: 1,
            createdate: new Date(),
            updatedate: new Date(),
            updatedby: 1,
          },
        });
      }
    }

    // Fetch all modules
    const allModules = await prisma.hrms_m_module.findMany({
      select: {
        id: true,
        module_name: true,
      },
    });

    // Parse permissions if they exist
    savedPermissions = savedPermissions
      ? parsePermissions(savedPermissions)
      : null;

    // If permissions exist, use them; otherwise, start fresh
    let existingPermissions = [];
    if (savedPermissions && savedPermissions.permissions) {
      if (Array.isArray(savedPermissions.permissions)) {
        // Already in array format
        existingPermissions = savedPermissions.permissions;
      } else if (
        typeof savedPermissions.permissions === "object" &&
        savedPermissions.permissions !== null
      ) {
        // Convert object (keyed by module_id) to array format
        // Object format: { 1: { module_id: 1, module_name: "...", view: true, ... }, 2: {...} }
        // Array format: [{ module_id: 1, module_name: "...", permissions: { view: true, ... } }, ...]
        existingPermissions = Object.values(savedPermissions.permissions).map(
          (perm) => {
            // If the permission object has the structure from seeder (flat structure)
            if (perm.module_id && perm.module_name) {
              return {
                module_id: perm.module_id,
                module_name: perm.module_name,
                permissions: {
                  view: perm.view || false,
                  create: perm.create || false,
                  update: perm.update || false,
                  delete: perm.delete || false,
                  approve: perm.approve || false,
                  reject: perm.reject || false,
                },
              };
            }
            // If already in array format structure
            return perm;
          }
        );
      }
    }

    // Ensure all modules are included, keeping existing ones and adding new ones
    const updatedPermissions = allModules.map((module) => {
      const existingModulePermission = existingPermissions.find(
        (perm) =>
          perm.module_id === module.id &&
          perm.module_name === module?.module_name
      );
      const existingModuleChange = existingPermissions.find(
        (perm) =>
          perm.module_id === module.id &&
          perm.module_name !== module?.module_name
      );

      return existingModulePermission
        ? existingModulePermission // Keep existing permissions
        : existingModuleChange
        ? {
            module_id: module.id,
            module_name: module.module_name,
            permissions: existingModuleChange?.permissions,
          }
        : {
            module_id: module.id,
            module_name: module.module_name,
            permissions: {
              view: false,
              update: false,
              create: false,
              delete: false,
            },
          };
    });

    // // Default permissions (all false)
    // const formattedPermissions = allModules.map((module) => ({
    //   module_id: module.id,
    //   module_name: module.module_name,
    //   permissions: {
    //     view: false,
    //     update: false,
    //     create: false,
    //     delete: false,
    //   },
    // }));

    return {
      role_id: role_id || null,
      // permissions: formattedPermissions,
      permissions: updatedPermissions,
    };
  } catch (error) {
    console.error("Error retrieving permissions:", error);
    throw new CustomError(
      `Error retrieving permissions: ${error.message}`,
      500
    );
  }
};
// const getAllPermission = async (id) => {
//   const role_id = Number(id);

//   try {
//     // Fetch saved permissions for this role
//     const savedPermissions = await prisma.hrms_d_role_permissions.findUnique({
//       where: { role_id },
//       select: {
//         permissions: true, // Assuming permissions are stored in JSON format
//       },
//     });

//     // Fetch all available modules
//     const allModules = await prisma.hrms_m_module.findMany({
//       select: {
//         id: true,
//         module_name: true,
//       },
//     });

//     // If permissions exist, use them; otherwise, start fresh
//     let existingPermissions = savedPermissions ? savedPermissions.permissions : [];

//     // Ensure all modules are included, keeping existing ones and adding new ones
//     const updatedPermissions = allModules.map((module) => {
//       const existingModulePermission = existingPermissions.find((perm) => perm.module_id === module.id);

//       return existingModulePermission
//         ? existingModulePermission // Keep existing permissions
//         : {
//             module_id: module.id,
//             module_name: module.module_name,
//             permissions: { view: false, update: false, create: false, delete: false },
//           };
//     });

//     return {
//       role_id: role_id || null,
//       permissions: updatedPermissions,
//     };
//   } catch (error) {
//     console.error("Error retrieving permissions:", error);
//     throw new Error("Error retrieving permissions");
//   }
// };

module.exports = {
  createPermission,
  findContactById,
  updateContact,
  deleteContact,
  getAllPermission,
};

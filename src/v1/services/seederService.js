const bcrypt = require("bcryptjs");
const { getPrismaClient } = require("../../config/db.js");
const CustomError = require("../../utils/CustomError");

const BCRYPT_COST = 8;

/**
 * Check if database is empty (no users exist)
 * @param {Object} prisma - Prisma client instance
 * @returns {Promise<boolean>} - True if database is empty
 */
const isDatabaseEmpty = async (prisma) => {
  try {
    const userCount = await prisma.hrms_m_user.count();
    return userCount === 0;
  } catch (error) {
    throw new CustomError(`Error checking database: ${error.message}`, 500);
  }
};

/**
 * Create Super Admin role if it doesn't exist
 * @param {Object} prisma - Prisma client instance
 * @returns {Promise<Object>} - Created or existing Super Admin role
 */
const createSuperAdminRole = async (prisma) => {
  try {
    // Check if Super Admin role already exists
    let superAdminRole = await prisma.hrms_m_role.findFirst({
      where: {
        role_name: "Super Admin",
      },
    });

    if (!superAdminRole) {
      // Create Super Admin role
      superAdminRole = await prisma.hrms_m_role.create({
        data: {
          role_name: "Super Admin",
          is_active: "Y",
          log_inst: 1,
          createdate: new Date(),
          createdby: 1,
        },
      });
    }

    return superAdminRole;
  } catch (error) {
    throw new CustomError(
      `Error creating Super Admin role: ${error.message}`,
      500
    );
  }
};

/**
 * Create full permissions for Super Admin (all modules with all permissions)
 * @param {Object} prisma - Prisma client instance
 * @param {number} roleId - Role ID
 * @returns {Promise<Object>} - Created permissions
 */
const createSuperAdminPermissions = async (prisma, roleId) => {
  try {
    // Check if permissions already exist
    const existingPermissions = await prisma.hrms_d_role_permissions.findFirst({
      where: { role_id: roleId },
    });

    // Get all modules to create full permissions
    const allModules = await prisma.hrms_m_module.findMany({
      where: { is_active: "Y" },
    });

    // Create permissions object with all modules having all permissions
    const permissions = {};
    allModules.forEach((module) => {
      permissions[module.id] = {
        module_id: module.id,
        module_name: module.module_name,
        view: true,
        create: true,
        update: true,
        delete: true,
        approve: true,
        reject: true,
      };
    });

    if (existingPermissions) {
      // Update existing permissions
      const updatedPermissions = await prisma.hrms_d_role_permissions.update({
        where: { id: existingPermissions.id },
        data: {
          permissions: JSON.stringify(permissions),
          updatedate: new Date(),
          updatedby: 1,
        },
      });
      return updatedPermissions;
    } else {
      // Create new permissions
      const newPermissions = await prisma.hrms_d_role_permissions.create({
        data: {
          role_id: roleId,
          permissions: JSON.stringify(permissions),
          is_active: "Y",
          log_inst: 1,
          createdate: new Date(),
          createdby: 1,
        },
      });
      return newPermissions;
    }
  } catch (error) {
    throw new CustomError(
      `Error creating Super Admin permissions: ${error.message}`,
      500
    );
  }
};

/**
 * Create Super Admin user
 * @param {Object} prisma - Prisma client instance
 * @param {number} roleId - Role ID for Super Admin
 * @param {string} email - Email for Super Admin
 * @param {string} password - Password for Super Admin
 * @param {string} fullName - Full name for Super Admin
 * @returns {Promise<Object>} - Created user
 */
const createSuperAdminUser = async (
  prisma,
  roleId,
  email = "admin@hrms.com",
  password = "admin@123",
  fullName = "Super Admin"
) => {
  try {
    // Check if user already exists
    const existingUser = await prisma.hrms_m_user.findFirst({
      where: { email },
    });

    if (existingUser) {
      throw new CustomError("Super Admin user already exists", 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, BCRYPT_COST);

    // Create user
    const user = await prisma.hrms_m_user.create({
      data: {
        username: email,
        email: email,
        password: hashedPassword,
        full_name: fullName,
        is_active: "Y",
        log_inst: 1,
        createdate: new Date(),
        createdby: 1,
      },
    });

    // Assign role to user
    await prisma.hrms_d_user_role.create({
      data: {
        user_id: user.id,
        role_id: roleId,
        is_active: "Y",
        log_inst: 1,
        createdate: new Date(),
        createdby: 1,
      },
    });

    // Fetch complete user with role
    const completeUser = await prisma.hrms_m_user.findUnique({
      where: { id: user.id },
      include: {
        hrms_d_user_role: {
          include: {
            hrms_m_role: true,
          },
        },
      },
    });

    // Remove password from response
    delete completeUser.password;

    return completeUser;
  } catch (error) {
    throw new CustomError(
      `Error creating Super Admin user: ${error.message}`,
      500
    );
  }
};

/**
 * Main seeder function to create Super Admin
 * @param {string} dbName - Database name
 * @param {Object} options - Optional user details (email, password, fullName)
 * @param {Object} [existingPrisma] - Optional existing Prisma client (from tenantMiddleware)
 * @returns {Promise<Object>} - Seeder result
 */
const seedSuperAdmin = async (
  dbName,
  options = {
    email: "admin@hrms.com",
    password: "admin@123",
    fullName: "Super Admin",
  },
  existingPrisma = null
) => {
  try {
    // Use existing Prisma client if provided (from tenantMiddleware), otherwise create new one
    const prisma = existingPrisma || getPrismaClient(dbName);

    // Check if database is empty
    const isEmpty = await isDatabaseEmpty(prisma);
    if (!isEmpty) {
      throw new CustomError(
        "Database is not empty. Seeder can only run on empty databases.",
        400
      );
    }

    // Create Super Admin role
    const superAdminRole = await createSuperAdminRole(prisma);

    // Create Super Admin permissions
    await createSuperAdminPermissions(prisma, superAdminRole.id);

    // Create Super Admin user
    const superAdminUser = await createSuperAdminUser(
      prisma,
      superAdminRole.id,
      options.email,
      options.password,
      options.fullName
    );

    return {
      success: true,
      message: "Super Admin created successfully",
      data: {
        user: superAdminUser,
        role: superAdminRole,
      },
    };
  } catch (error) {
    throw new CustomError(
      `Seeder error: ${error.message}`,
      error.status || 500
    );
  }
};

const seedRoles = async (dbName, existingPrisma = null) => {
  try {
    const mockRoles = require("../../mock/roles.mock.js");
    const prisma = existingPrisma || getPrismaClient(dbName);

    const createdRoles = [];
    const skippedRoles = [];

    for (const roleData of mockRoles) {
      const existingRole = await prisma.hrms_m_role.findFirst({
        where: {
          role_name: {
            equals: roleData.role_name,
          },
        },
      });

      if (existingRole) {
        skippedRoles.push({
          role_name: roleData.role_name,
          reason: "Already exists",
        });
        continue;
      }

      const role = await prisma.hrms_m_role.create({
        data: {
          role_name: roleData.role_name,
          is_active: roleData.is_active || "Y",
          log_inst: roleData.log_inst || 1,
          createdby: 1,
          createdate: new Date(),
        },
      });

      createdRoles.push(role);
    }

    return {
      success: true,
      message: "Roles seeding completed",
      data: {
        created: createdRoles,
        skipped: skippedRoles,
        totalCreated: createdRoles.length,
        totalSkipped: skippedRoles.length,
      },
    };
  } catch (error) {
    throw new CustomError(
      `Seeder error: ${error.message}`,
      error.status || 500
    );
  }
};

module.exports = {
  seedSuperAdmin,
  seedRoles,
  isDatabaseEmpty,
  createSuperAdminRole,
  createSuperAdminPermissions,
  createSuperAdminUser,
};

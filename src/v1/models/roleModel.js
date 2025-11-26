const { prisma } = require("../../utils/prismaProxy.js");
const CustomError = require("../../utils/CustomError");
const mockRoles = require("../../mock/roles.mock.js");

const createRole = async (data) => {
  try {
    const existingRole = await prisma.hrms_m_role.findFirst({
      where: {
        role_name: {
          equals: data.role_name,
        },
      },
    });

    if (existingRole) {
      throw new CustomError("Role name already exists", 400);
    }

    const role = await prisma.hrms_m_role.create({
      data: {
        role_name: data.role_name,
        is_active: data.is_active || "Y",
        log_inst: data.log_inst || 1,
        createdby: data.createdby || 1,
        createdate: data.createdate || new Date(),
      },
    });
    return role;
  } catch (error) {
    throw new CustomError(`Error creating role: ${error.message}`, 500);
  }
};

const findRoleById = async (id) => {
  try {
    const role = await prisma.hrms_m_role.findUnique({
      where: { id: parseInt(id) },
    });
    if (!role) {
      throw new CustomError("Role not found", 404);
    }
    return role;
  } catch (error) {
    throw new CustomError(`Error finding role by ID: ${error.message}`, 503);
  }
};

const updateRole = async (id, data) => {
  try {
    const updatedRole = await prisma.hrms_m_role.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        updatedate: new Date(),
      },
    });
    return updatedRole;
  } catch (error) {
    throw new CustomError(`Error updating role: ${error.message}`, 500);
  }
};

const deleteRole = async (id) => {
  try {
    await prisma.hrms_m_role.delete({
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

const getAllRoles = async () => {
  try {
    const roles = await prisma.hrms_m_role.findMany({
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
    });

    if (roles.length === 0) {
      for (const roleData of mockRoles) {
        await prisma.hrms_m_role.create({
          data: {
            role_name: roleData.role_name,
            is_active: roleData.is_active || "Y",
            log_inst: roleData.log_inst || 1,
            createdby: 1,
            createdate: new Date(),
          },
        });
      }
      const createdRoles = await prisma.hrms_m_role.findMany({
        orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
      });
      return createdRoles;
    }

    return roles;
  } catch (error) {
    throw new CustomError("Error retrieving roles", 503);
  }
};

module.exports = {
  createRole,
  findRoleById,
  updateRole,
  deleteRole,
  getAllRoles,
};

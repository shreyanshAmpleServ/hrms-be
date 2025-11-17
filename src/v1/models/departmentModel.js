const { prisma } = require("../../utils/prismaProxy");
const CustomError = require("../../utils/CustomError");

const createDepartment = async (data) => {
  try {
    const department = await prisma.hrms_m_department_master.create({
      data: {
        department_name: data.department_name,
        createdby: data.createdby || 1,
        log_inst: data.log_inst || 1,
        is_active: data.is_active || "Y",
        createdate: new Date(),
        updatedate: new Date(),
        updatedby: 1,
      },
    });
    return department;
  } catch (error) {
    console.log("Create department ", error);
    throw new CustomError(`Error creating department: ${error.message}`, 500);
  }
};

const findDepartmentById = async (id) => {
  try {
    const department = await prisma.hrms_m_department_master.findUnique({
      where: { id: parseInt(id) },
    });
    if (!department) {
      throw new CustomError("department not found", 404);
    }
    return department;
  } catch (error) {
    console.log("department By Id  ", error);
    throw new CustomError(
      `Error finding department by ID: ${error.message}`,
      503
    );
  }
};

const updateDepartment = async (id, data) => {
  try {
    const allowedFields = {
      department_name: data.department_name,
      is_active: data.is_active,
      log_inst: data.log_inst,
    };

    const updateData = Object.fromEntries(
      Object.entries(allowedFields).filter(([_, v]) => v !== undefined)
    );

    const updateddepartment = await prisma.hrms_m_department_master.update({
      where: { id: parseInt(id) },
      data: {
        ...updateData,
        updatedate: new Date(),
        updatedby: data.updatedby || 1,
      },
    });
    return updateddepartment;
  } catch (error) {
    throw new CustomError(`Error updating department: ${error.message}`, 500);
  }
};

const deleteDepartment = async (id) => {
  try {
    await prisma.hrms_m_department_master.delete({
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

const getAllDepartments = async (
  page,
  size,
  search,
  startDate,
  endDate,
  is_active
) => {
  try {
    page = page || page == 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size || 0;

    let filters = {};
    if (search) {
      filters.OR = [
        {
          department_name: { contains: search.toLowerCase() },
        },
      ];
    }

    if (typeof is_active === "boolean") {
      filters.is_active = is_active ? "Y" : "N";
    } else if (typeof is_active === "string") {
      if (is_active.toLowerCase() === "true") filters.is_active = "Y";
      else if (is_active.toLowerCase() === "false") filters.is_active = "N";
    }

    const departments = await prisma.hrms_m_department_master.findMany({
      where: filters,
      skip: skip,
      take: size,

      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
    });

    const totalCount = await prisma.hrms_m_department_master.count({
      where: filters,
    });
    return {
      data: departments,
      currentPage: page,
      size,
      totalPages: Math.ceil(totalCount / size),
      totalCount: totalCount,
    };
  } catch (error) {
    console.log(error);
    throw new CustomError("Error retrieving departments", 503);
  }
};

const getDepartmentOptions = async (is_active) => {
  try {
    let where = {};
    if (typeof is_active === "boolean") {
      where.is_active = is_active ? "Y" : "N";
    } else if (typeof is_active === "string") {
      if (is_active.toLowerCase() === "true") where.is_active = "Y";
      else if (is_active.toLowerCase() === "false") where.is_active = "N";
    }

    const departments = await prisma.hrms_m_department_master.findMany({
      where,
      select: {
        id: true,
        department_name: true,
      },
    });

    return departments.map(({ id, department_name }) => ({
      value: id,
      label: department_name,
    }));
  } catch (error) {
    console.error("Error retrieving department options: ", error);
    throw new CustomError("Error retrieving department component", 503);
  }
};

module.exports = {
  createDepartment,
  findDepartmentById,
  updateDepartment,
  deleteDepartment,
  getAllDepartments,
  getDepartmentOptions,
};

const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const prisma = new PrismaClient();

const createLeaveType = async (data) => {
  try {
    const finalData = await prisma.hrms_m_leave_type_master.create({
      data: {
        leave_type: data.leave_type,
        carry_forward: data.carry_forward,
        createdby: data.createdby || 1,
        log_inst: data.log_inst || 1,
        createdate: new Date(),
        updatedate: new Date(),
        updatedby: 1,
      },
    });
    return finalData;
  } catch (error) {
    console.log("Create leave type ", error);
    throw new CustomError(`Error creating leave type: ${error.message}`, 500);
  }
};

const findLeaveTypeById = async (id) => {
  try {
    const data = await prisma.hrms_m_leave_type_master.findUnique({
      where: { id: parseInt(id) },
    });
    if (!data) {
      throw new CustomError("leave type not found", 404);
    }
    return data;
  } catch (error) {
    console.log("leave type By Id  ", error);
    throw new CustomError(
      `Error finding leave type by ID: ${error.message}`,
      503
    );
  }
};

const updateLeaveType = async (id, data) => {
  try {
    const updatedData = await prisma.hrms_m_leave_type_master.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        updatedate: new Date(),
      },
    });
    return updatedData;
  } catch (error) {
    throw new CustomError(`Error updating leave type: ${error.message}`, 500);
  }
};

const deleteLeaveType = async (id) => {
  try {
    await prisma.hrms_m_leave_type_master.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    throw new CustomError(`Error deleting leave type: ${error.message}`, 500);
  }
};

const getAllLeaveType = async (page, size, search) => {
  try {
    page = page || page == 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size || 0;

    const filters = {};
    if (search) {
      filters.OR = [
        {
          leave_type: { contains: search.toLowerCase() },
        },
      ];
    }

    const data = await prisma.hrms_m_leave_type_master.findMany({
      where: filters,
      skip: skip,
      take: size,

      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
    });

    const totalCount = await prisma.hrms_m_leave_type_master.count({
      where: filters,
    });
    return {
      data: data,
      currentPage: page,
      size,
      totalPages: Math.ceil(totalCount / size),
      totalCount: totalCount,
    };
  } catch (error) {
    console.log(error);
    throw new CustomError("Error retrieving leave type", 503);
  }
};

module.exports = {
  createLeaveType,
  findLeaveTypeById,
  updateLeaveType,
  deleteLeaveType,
  getAllLeaveType,
};

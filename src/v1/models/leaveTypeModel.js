// const { prisma } = require("../../utils/prismaProxy.js");
const CustomError = require("../../utils/CustomError");
const { checkDuplicate } = require("../../utils/duplicateCheck.js");
//
const { prisma } = require("../../utils/prismaProxy.js");

// Serialize leave type master data
const serializeLeaveTypeMasterData = (data) => ({
  leave_type: data.leave_type || "",
  carry_forward:
    typeof data.carry_forward === "boolean" ? data.carry_forward : null,
  leave_qty: data.leave_qty ? Number(data.leave_qty) : null,
  leave_unit: data.leave_unit || "D",
  prorate_allowed: data.prorate_allowed || "Y",
  for_gender: data.for_gender || "B",
  sub_period: data.sub_period || "",
  leaves_sub_period: data.leaves_sub_period
    ? Number(data.leaves_sub_period)
    : null,
  is_active: data.is_active || "Y",
});

// Create a new leave type master
const createLeaveType = async (data) => {
  try {
    await checkDuplicate({
      model: "hrms_m_leave_type_master",
      field: "leave_type",
      value: data.leave_type,
      errorMessage: "Leave type already exists",
    });
    const existing = await prisma.hrms_m_leave_type_master.findFirst({
      where: {
        leave_type: data.leave_type.trim(),
      },
    });

    if (existing) {
      throw new CustomError("Leave type already exists", 400);
    }

    const reqData = await prisma.hrms_m_leave_type_master.create({
      data: {
        ...serializeLeaveTypeMasterData(data),
        leave_type: data.leave_type.trim(),
        createdby: data.createdby || 1,
        createdate: new Date(),
        log_inst: data.log_inst || 1,
      },
    });

    return reqData;
  } catch (error) {
    throw new CustomError(` ${error.message}`, 500);
  }
};

// Find leave type master by ID
const findLeaveTypById = async (id) => {
  try {
    const reqData = await prisma.hrms_m_leave_type_master.findUnique({
      where: { id: parseInt(id) },
    });
    if (!reqData) {
      throw new CustomError("Leave type master not found", 404);
    }
    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error finding leave type master by ID: ${error.message}`,
      503
    );
  }
};

// Update leave type master
const updateLeaveType = async (id, data) => {
  try {
    await checkDuplicate({
      model: "hrms_m_leave_type_master",
      field: "leave_type",
      value: data.leave_type,
      excludeId: parseInt(id),
      errorMessage: "Leave type already exists",
    });
    const leaveType = data.leave_type.trim();

    const duplicate = await prisma.hrms_m_leave_type_master.findFirst({
      where: {
        leave_type: leaveType,
        NOT: { id: parseInt(id) },
      },
    });

    if (duplicate) {
      throw new CustomError("Leave type already exists", 400);
    }

    const updatedEntry = await prisma.hrms_m_leave_type_master.update({
      where: { id: parseInt(id) },
      data: {
        ...serializeLeaveTypeMasterData(data),
        leave_type: leaveType,
        updatedby: data.updatedby || 1,
        updatedate: new Date(),
      },
    });

    return updatedEntry;
  } catch (error) {
    if (error.code === "P2002") {
      throw new CustomError("Leave type already exists", 400);
    }

    throw new CustomError(` ${error.message}`, 500);
  }
};

// Delete leave type master
const deleteLeaveType = async (id) => {
  try {
    await prisma.hrms_m_leave_type_master.delete({
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

// Get all leave type masters with pagination and search
const getAllLeaveType = async (
  search,
  page,
  size,
  startDate,
  endDate,
  is_active
) => {
  try {
    page = !page || page == 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size || 0;

    const filters = {};
    if (search) {
      filters.OR = [
        { leave_type: { contains: search.toLowerCase() } },
        { leave_unit: { contains: search.toLowerCase() } },
        { for_gender: { contains: search.toLowerCase() } },
      ];
    }
    if (typeof is_active === "boolean") {
      filters.is_active = is_active ? "Y" : "N";
    } else if (typeof is_active === "string") {
      if (is_active.toLowerCase() === "true") filters.is_active = "Y";
      else if (is_active.toLowerCase() === "false") filters.is_active = "N";
    }
    const datas = await prisma.hrms_m_leave_type_master.findMany({
      where: filters,
      skip,
      take: size,
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
    });
    const totalCount = await prisma.hrms_m_leave_type_master.count({
      where: filters,
    });

    return {
      data: datas,
      currentPage: page,
      size,
      totalPages: Math.ceil(totalCount / size),
      totalCount,
    };
  } catch (error) {
    throw new CustomError("Error retrieving leave type masters", 503);
  }
};

module.exports = {
  createLeaveType,
  findLeaveTypById,
  updateLeaveType,
  deleteLeaveType,
  getAllLeaveType,
};

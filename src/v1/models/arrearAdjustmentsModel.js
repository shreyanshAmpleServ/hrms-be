const { prisma } = require("../../utils/prismaProxy.js");
const CustomError = require("../../utils/CustomError");

// Serialize arrear adjustment data
const serializeArrearAdjustmentData = (data) => ({
  employee_id: Number(data.employee_id),
  payroll_month: data.payroll_month || "",
  arrear_reason: data.arrear_reason || "",
  arrear_amount: data.arrear_amount ? Number(data.arrear_amount) : 0,
  adjustment_type: data.adjustment_type || "",
  remarks: data.remarks || "",
});

// Create a new arrear adjustment
const createArrearAdjustment = async (data) => {
  try {
    const serializedData = serializeArrearAdjustmentData(data);

    // Destructure to extract employee_id and use relation field
    const { employee_id, ...adjustmentData } = serializedData;

    const reqData = await prisma.hrms_d_arrear_adjustments.create({
      data: {
        ...adjustmentData,
        createdby: data.createdby || 1,
        createdate: new Date(),
        log_inst: data.log_inst || 1,
        hrms_arrear_adjustments_employee: {
          connect: {
            id: Number(employee_id),
          },
        },
      },
      include: {
        hrms_arrear_adjustments_employee: {
          select: {
            id: true,
            employee_code: true,
            full_name: true,
          },
        },
      },
    });
    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error creating arrear adjustment: ${error.message}`,
      500
    );
  }
};

// Find arrear adjustment by ID
const findArrearAdjustmentById = async (id) => {
  try {
    const reqData = await prisma.hrms_d_arrear_adjustments.findUnique({
      where: { id: parseInt(id) },
    });
    if (!reqData) {
      throw new CustomError("Arrear adjustment not found", 404);
    }
    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error finding arrear adjustment by ID: ${error.message}`,
      503
    );
  }
};

// Update arrear adjustment
const updateArrearAdjustment = async (id, data) => {
  try {
    const updatedEntry = await prisma.hrms_d_arrear_adjustments.update({
      where: { id: parseInt(id) },
      include: {
        hrms_arrear_adjustments_employee: {
          select: {
            id: true,
            employee_code: true,
            full_name: true,
          },
        },
      },
      data: {
        ...serializeArrearAdjustmentData(data),
        updatedby: data.updatedby || 1,
        updatedate: new Date(),
      },
    });
    return updatedEntry;
  } catch (error) {
    throw new CustomError(
      `Error updating arrear adjustment: ${error.message}`,
      500
    );
  }
};

// Delete arrear adjustment
const deleteArrearAdjustment = async (id) => {
  try {
    await prisma.hrms_d_arrear_adjustments.delete({
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

// Get all arrear adjustments with pagination and search
const getAllArrearAdjustment = async (
  search,
  page,
  size,
  startDate,
  endDate
) => {
  try {
    page = !page || page == 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size || 0;

    const filters = {};
    if (search) {
      filters.OR = [
        {
          hrms_arrear_adjustments_employee: {
            full_name: { contains: search.toLowerCase() },
          },
        },
        { payroll_month: { contains: search.toLowerCase() } },
        { arrear_reason: { contains: search.toLowerCase() } },
        { adjustment_type: { contains: search.toLowerCase() } },
        { remarks: { contains: search.toLowerCase() } },
      ];
    }
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        filters.createdate = { gte: start, lte: end };
      }
    }

    const datas = await prisma.hrms_d_arrear_adjustments.findMany({
      where: filters,
      skip,
      take: size,
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
      include: {
        hrms_arrear_adjustments_employee: {
          select: {
            id: true,
            employee_code: true,
            full_name: true,
          },
        },
      },
    });
    const totalCount = await prisma.hrms_d_arrear_adjustments.count({
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
    throw new CustomError("Error retrieving arrear adjustments", 503);
  }
};

module.exports = {
  createArrearAdjustment,
  findArrearAdjustmentById,
  updateArrearAdjustment,
  deleteArrearAdjustment,
  getAllArrearAdjustment,
};

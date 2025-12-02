const { prisma } = require("../../utils/prismaProxy.js");
const CustomError = require("../../utils/CustomError");
const { createRequest } = require("./requestsModel");
const { checkDuplicate } = require("../../utils/duplicateCheck.js");

// Serialize asset assignment data
const serializeAssetAssignment = (data) => ({
  employee_id: data.employee_id ? Number(data.employee_id) : null,
  asset_type_id: data.asset_type_id ? Number(data.asset_type_id) : null,
  asset_name: data.asset_name || "",
  serial_number: data.serial_number || "",
  issued_on: data.issued_on ? new Date(data.issued_on) : null,
  returned_on: data.returned_on ? new Date(data.returned_on) : null,
  status: data.status || "",
});

// Create a new asset assignment
const createAssetAssignment = async (data) => {
  try {
    await checkDuplicate({
      model: "hrms_d_asset_assignment",
      field: "asset_name",
      value: data.asset_name,
      errorMessage: "Asset name already exists",
    });
    const created = await prisma.hrms_d_asset_assignment.create({
      data: {
        ...serializeAssetAssignment(data),
        createdby: Number(data.createdby) || 1,
        createdate: new Date(),
        log_inst: data.log_inst || 1,
      },
    });
    const reqData = await prisma.hrms_d_asset_assignment.findUnique({
      where: { id: created.id },
      include: {
        asset_assignment_employee: { select: { id: true, full_name: true } },
        asset_assignment_type: {
          select: {
            id: true,
            asset_type_name: true,
            depreciation_rate: true,
          },
        },
      },
    });
    await createRequest({
      requester_id: reqData.employee_id,
      request_type: "asset_request",
      reference_id: reqData.id,
      createdby: data.createdby || 1,
      log_inst: data.log_inst || 1,
    });
    return reqData;
  } catch (error) {
    throw new CustomError(error.message, 500);
  }
};

// Find an asset assignment by ID
const findAssetAssignmentById = async (id) => {
  try {
    const reqData = await prisma.hrms_d_asset_assignment.findUnique({
      where: { id: parseInt(id) },
      include: {
        asset_assignment_employee: { select: { id: true, full_name: true } },
        asset_assignment_type: {
          select: {
            id: true,
            asset_type_name: true,
            depreciation_rate: true,
          },
        },
      },
    });
    if (!reqData) {
      throw new CustomError("Asset assignment not found", 404);
    }
    return reqData;
  } catch (error) {
    throw new CustomError(error.message, 503);
  }
};

// Update an asset assignment
const updateAssetAssignment = async (id, data) => {
  try {
    if (data.asset_name) {
      await checkDuplicate({
        model: "hrms_d_asset_assignment",
        field: "asset_name",
        value: data.asset_name,
        excludeId: id,
        errorMessage: "Asset name already exists",
      });
    }
    const updated = await prisma.hrms_d_asset_assignment.update({
      where: { id: parseInt(id) },
      data: {
        ...serializeAssetAssignment(data),
        updatedby: data.updatedby || 1,
        updatedate: new Date(),
      },
    });
    return await prisma.hrms_d_asset_assignment.findUnique({
      where: { id: updated.id },
      include: {
        asset_assignment_employee: { select: { id: true, full_name: true } },
        asset_assignment_type: {
          select: {
            id: true,
            asset_type_name: true,
            depreciation_rate: true,
          },
        },
      },
    });
  } catch (error) {
    throw new CustomError(error.message, 500);
  }
};

// Delete an asset assignment
const deleteAssetAssignment = async (id) => {
  try {
    await prisma.hrms_d_asset_assignment.delete({
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

// Get all asset assignments
const getAllAssetAssignments = async (
  search,
  page,
  size,
  startDate,
  endDate
) => {
  try {
    page = !page || page == 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size;

    const filterConditions = [];

    if (search) {
      filterConditions.push({
        OR: [
          {
            asset_assignment_employee: {
              full_name: {
                contains: search.toLowerCase(),
              },
            },
          },
          {
            asset_assignment_type: {
              asset_type_name: {
                contains: search.toLowerCase(),
              },
            },
          },
          {
            asset_name: {
              contains: search.toLowerCase(),
            },
          },
          {
            serial_number: {
              contains: search.toLowerCase(),
            },
          },
          {
            status: {
              contains: search.toLowerCase(),
            },
          },
        ],
      });
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (!isNaN(start) && !isNaN(end)) {
        filterConditions.push({
          createdate: {
            gte: start,
            lte: end,
          },
        });
      }
    }

    const filters =
      filterConditions.length > 0 ? { AND: filterConditions } : {};

    const datas = await prisma.hrms_d_asset_assignment.findMany({
      where: filters,
      skip,
      take: size,
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
      include: {
        asset_assignment_employee: {
          select: { id: true, full_name: true },
        },
        asset_assignment_type: {
          select: {
            id: true,
            asset_type_name: true,
            depreciation_rate: true,
          },
        },
      },
    });

    const totalCount = await prisma.hrms_d_asset_assignment.count({
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
    // Log the full Prisma error to see if anything else is off:
    console.error("Prisma error in getAllAssetAssignments:", error);
    throw new CustomError("Error retrieving asset assignments", 400);
  }
};

module.exports = {
  createAssetAssignment,
  findAssetAssignmentById,
  updateAssetAssignment,
  deleteAssetAssignment,
  getAllAssetAssignments,
};

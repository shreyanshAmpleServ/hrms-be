const CustomError = require("../../utils/CustomError");
const { getPrisma } = require("../../config/prismaContext.js");
const { includes } = require("zod/v4");

// Helper to serialize cost center data
const serializeCostCenterData = (data) => ({
  name: data.name || null,
  dimension_id: data.dimension_id ? Number(data.dimension_id) : null,
  is_active: data.is_active || "Y",
  valid_from: data.valid_from ? new Date(data.valid_from) : null,
  valid_to: data.valid_to ? new Date(data.valid_to) : null,
  external_code: data.external_code || null,
});

// Create Cost Center
const createCostCenter = async (data) => {
  const prisma = getPrisma();
  try {
    const prisma = getPrisma();
    const result = await prisma.hrms_m_costcenters.create({
      data: {
        ...serializeCostCenterData(data),
        createdby: data.createdby || 1,
        createdate: new Date(),
        log_inst: data.log_inst || 1,
      },
    });
    return result;
  } catch (error) {
    console.log("Error ", error);

    throw new CustomError(`Error creating cost center: ${error.message}`, 500);
  }
};

// Get All Cost Center
// const getAllCostCenter = async (search, page, size, startDate, endDate) => {
//   try {
//     page = !page || page == 0 ? 1 : page;
//     size = size || 10;
//     const skip = (page - 1) * size || 0;
//     const filters = {};

//     if (search) {
//       filters.OR = [
//         { name: { contains: search.toLowwerCase() } },
//         { external_code: { contains: search.toLowwerCase() } },
//       ];
//     }
//     if (startDate && endDate) {
//       const start = new Date(startDate);
//       start.setHours(0, 0, 0, 0);

//       const end = new Date(endDate);
//       end.setHours(23, 59, 59, 999);

//       if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
//         end.setHours(23, 59, 59, 999);
//         filters.createdate = { gte: start, lte: end };
//       }
//     }

//     const data = await prisma.hrms_m_costcenters.findMany({
//       where: filters,
//       skip,
//       take: size,
//       orderBy: { createdate: "desc" },
//     });

//     const totalCount = await prisma.hrms_m_costcenters.count({
//       where: filters,
//     });

//     return {
//       data,
//       currentPage: page,
//       size,
//       totalPages: Math.ceil(totalCount / size),
//       totalCount,
//     };
//   } catch (error) {
//     console.log("Error", error);

//     throw new CustomError("Error retrieving cost centers", 503);
//   }
// };

const getAllCostCenter = async (
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
        { name: { contains: search.toLowerCase() } },
        { external_code: { contains: search.toLowerCase() } },
      ];
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);

      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        filters.createdate = { gte: start, lte: end };
      }
    }

    if (typeof is_active === "boolean") {
      filters.is_active = is_active ? "Y" : "N";
    } else if (typeof is_active === "string") {
      if (is_active.toLowerCase() === "true") filters.is_active = "Y";
      else if (is_active.toLowerCase() === "false") filters.is_active = "N";
    }

    const data = await prisma.hrms_m_costcenters.findMany({
      where: filters,
      skip,
      take: size,
      orderBy: { createdate: "desc" },
    });

    const totalCount = await prisma.hrms_m_costcenters.count({
      where: filters,
    });

    return {
      data,
      currentPage: page,
      size,
      totalPages: Math.ceil(totalCount / size),
      totalCount,
    };
  } catch (error) {
    console.log("Error", error);
    throw new CustomError("Error retrieving cost centers", 503);
  }
};

const findCostCenterById = async (id) => {
  const prisma = getPrisma();
  try {
    const prisma = getPrisma();
    const result = await prisma.hrms_m_costcenters.findUnique({
      where: { id: parseInt(id) },
    });
    if (!result) {
      throw new CustomError("Cost center not found", 404);
    }
    return result;
  } catch (error) {
    console.log("eRROR", error);

    throw new CustomError(
      `Error retrieving cost center: ${error.message}`,
      500
    );
  }
};

const updateCostCenter = async (id, data) => {
  const prisma = getPrisma();
  try {
    const prisma = getPrisma();
    const result = await prisma.hrms_m_costcenters.update({
      where: { id: parseInt(id) },
      data: {
        ...serializeCostCenterData(data),
        updatedby: data.updatedby || 1,
        updatedate: new Date(),
      },
    });
    return result;
  } catch (error) {
    throw new CustomError(`Error updating cost center: ${error.message}`, 500);
  }
};

// Delete Cost Center
const deleteCostCenter = async (id) => {
  const prisma = getPrisma();
  try {
    const prisma = getPrisma();
    await prisma.hrms_m_costcenters.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    throw new CustomError(`Error deleting cost center: ${error.message}`, 500);
  }
};

module.exports = {
  createCostCenter,
  getAllCostCenter,
  findCostCenterById,
  updateCostCenter,
  deleteCostCenter,
};

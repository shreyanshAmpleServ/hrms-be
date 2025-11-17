const { prisma } = require("../../utils/prismaProxy");
const CustomError = require("../../utils/CustomError");

const createDesignation = async (data) => {
  try {
    const designation = await prisma.hrms_m_designation_master.create({
      data: {
        designation_name: data.designation_name,
        createdby: data.createdby || 1,
        log_inst: data.log_inst || 1,
        is_active: data.is_active || "Y",
        createdate: new Date(),
        updatedate: new Date(),
        updatedby: 1,
      },
    });
    return designation;
  } catch (error) {
    throw new CustomError(`Error creating designation: ${error.message}`, 500);
  }
};

const findDesignationById = async (id) => {
  try {
    const designation = await prisma.hrms_m_designation_master.findUnique({
      where: { id: parseInt(id) },
    });
    if (!designation) {
      throw new CustomError("designation not found", 404);
    }
    return designation;
  } catch (error) {
    throw new CustomError(
      `Error finding designation by ID: ${error.message}`,
      503
    );
  }
};

const updateDesignation = async (id, data) => {
  try {
    const updatedDesignation = await prisma.hrms_m_designation_master.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        updatedate: new Date(),
      },
    });
    return updatedDesignation;
  } catch (error) {
    throw new CustomError(`Error updating designation: ${error.message}`, 500);
  }
};

const deleteDesignation = async (id) => {
  try {
    await prisma.hrms_m_designation_master.delete({
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

const getAllDesignation = async (
  page,
  size,
  search,
  startDate,
  endDate,
  is_active
) => {
  try {
    // Set default values for pagination
    page = !page || page <= 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size;

    let filters = {};

    if (search) {
      filters.OR = [
        {
          designation_name: {
            contains: search.toLowerCase(),
          },
        },
      ];
    }

    if (typeof is_active === "boolean") {
      filters.is_active = is_active ? "Y" : "N";
    } else if (typeof is_active === "string") {
      const val = is_active.toLowerCase();
      if (val === "true") filters.is_active = "Y";
      else if (val === "false") filters.is_active = "N";
    }

    console.log("Filters applied:", filters);

    const designations = await prisma.hrms_m_designation_master.findMany({
      where: filters,
      skip,
      take: size,
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
    });

    //  Get total count for pagination
    const totalCount = await prisma.hrms_m_designation_master.count({
      where: filters,
    });

    return {
      data: designations,
      currentPage: page,
      size,
      totalPages: Math.ceil(totalCount / size),
      totalCount,
    };
  } catch (error) {
    console.error("Error retrieving designations:", error);
    throw new CustomError("Error retrieving designations", 503);
  }
};

// const getDesignationOptions = async (is_active) => {
//   try {
//     let where = {};
//     if (typeof is_active === "boolean") {
//       where.is_active = is_active ? "Y" : "N";
//     } else if (typeof is_active === "string") {
//       if (is_active.toLowerCase() === "true") where.is_active = "Y";
//       else if (is_active.toLowerCase() === "false") where.is_active = "N";
//     }

//     const designation = await prisma.hrms_m_designation_master.findMany({
//       where,
//       select: {
//         id: true,
//         designation_name: true,
//       },
//     });

//     return designation.map(({ id, designation_name }) => ({
//       value: id,
//       label: designation_name,
//     }));
//   } catch (error) {
//     console.error("Error retrieving designation options: ", error);
//     throw new CustomError("Error retrieving designation component", 503);
//   }
// };

const getDesignationOptions = async (is_active) => {
  try {
    let where = {};

    let isActiveValue;
    if (
      is_active === undefined ||
      is_active === null ||
      (typeof is_active === "string" && is_active.trim() === "") ||
      (typeof is_active === "boolean" && is_active === true) ||
      (typeof is_active === "string" && is_active.toLowerCase() === "true")
    ) {
      isActiveValue = "Y";
    } else if (is_active === "false") {
      isActiveValue = "N";
    }
    where.is_active = isActiveValue;

    const designation = await prisma.hrms_m_designation_master.findMany({
      where,
      select: {
        id: true,
        designation_name: true,
      },
    });

    return designation.map(({ id, designation_name }) => ({
      value: id,
      label: designation_name,
    }));
  } catch (error) {
    console.error("Error retrieving designation options: ", error);
    throw new CustomError("Error retrieving designation component", 503);
  }
};

module.exports = {
  createDesignation,
  findDesignationById,
  updateDesignation,
  deleteDesignation,
  getAllDesignation,
  getDesignationOptions,
};

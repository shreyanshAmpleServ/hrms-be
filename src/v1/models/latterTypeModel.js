const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const prisma = new PrismaClient();

const createLatterType = async (data) => {
  try {
    const finalData = await prisma.hrms_m_letter_type.create({
      data: {
        letter_name: data.letter_name || "",
        template_path: data.template_path || "",
        createdby: data.createdby || 1,
        log_inst: data.log_inst || 1,
        createdate: new Date(),
        updatedate: new Date(),
        updatedby: 1,
      },
    });
    return finalData;
  } catch (error) {
    console.log("Create latter type ", error);
    throw new CustomError(`Error creating latter type: ${error.message}`, 500);
  }
};

const findLatterTypeById = async (id) => {
  try {
    const data = await prisma.hrms_m_letter_type.findUnique({
      where: { id: parseInt(id) },
    });
    if (!data) {
      throw new CustomError("latter type not found", 404);
    }
    return data;
  } catch (error) {
    console.log("latter type By Id  ", error);
    throw new CustomError(
      `Error finding latter type by ID: ${error.message}`,
      503
    );
  }
};

// const updateLatterType = async (id, data) => {
//   try {
//     const updatedData = await prisma.hrms_m_letter_type.update({
//       where: { id: parseInt(id) },
//       data: {
//         ...data,
//         updatedate: new Date(),
//       },
//     });
//     return updatedData;
//   } catch (error) {
//     throw new CustomError(`Error updating latter type: ${error.message}`, 500);
//   }
// };

const updateLatterType = async (id, data) => {
  try {
    if ("id" in data) delete data.id;

    const updatedData = await prisma.hrms_m_letter_type.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        updatedate: new Date(),
      },
    });

    return updatedData;
  } catch (error) {
    throw new CustomError(`Error updating latter type: ${error.message}`, 500);
  }
};

const deleteLatterType = async (id) => {
  try {
    await prisma.hrms_m_letter_type.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    throw new CustomError(`Error deleting latter type: ${error.message}`, 500);
  }
};

// Get all latter type
const getAllLatterType = async (
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

    const filters = {};
    // Handle search
    if (search) {
      filters.OR = [
        // {
        //   campaign_user: {
        //     full_name: { contains: search.toLowerCase() },
        //   }, // Include contact details
        // },
        // {
        //   campaign_leads: {
        //     title: { contains: search.toLowerCase() },
        //   }, // Include contact details
        // },
        {
          letter_name: { contains: search.toLowerCase() },
        },
        // {
        //   status: { contains: search.toLowerCase() },
        // },
      ];
    }
    // if (status) {
    //   filters.is_active = { equals: status };
    // }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        filters.createdate = {
          gte: start,
          lte: end,
        };
      }
    }

    if (typeof is_active === "boolean") {
      filters.is_active = is_active ? "Y" : "N";
    } else if (typeof is_active === "string") {
      if (is_active.toLowerCase() === "true") filters.is_active = "Y";
      else if (is_active.toLowerCase() === "false") filters.is_active = "N";
    }
    const data = await prisma.hrms_m_letter_type.findMany({
      //   where: filters,
      skip: skip,
      take: size,

      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
    });

    const totalCount = await prisma.hrms_m_letter_type.count({
      //   where: filters,
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
    throw new CustomError("Error retrieving latter type", 503);
  }
};

module.exports = {
  createLatterType,
  findLatterTypeById,
  updateLatterType,
  deleteLatterType,
  getAllLatterType,
};

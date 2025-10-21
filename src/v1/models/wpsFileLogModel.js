const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const { errorNotExist } = require("../../Comman/errorNotExist");
const prisma = new PrismaClient();

const serializeData = (data) => {
  return {
    payroll_month: data.payroll_month || "",
    file_path: data.file_path || "",
    generated_on: data.generated_on || new Date(),
    submitted_to_bank: data.submitted_to_bank ? true : false,
  };
};

// Create a new wps file
const createWPSFile = async (data) => {
  try {
    const reqData = await prisma.hrms_d_wps_file_log.create({
      data: {
        ...serializeData(data),
        createdby: data.createdby || 1,
        createdate: new Date(),
        log_inst: data.log_inst || 1,
      },
    });
    return reqData;
  } catch (error) {
    throw new CustomError(`Error creating wps file: ${error.message}`, 500);
  }
};

// Find a wps file by ID
const findWPSFileById = async (id) => {
  try {
    const reqData = await prisma.hrms_d_wps_file_log.findUnique({
      where: { id: parseInt(id) },
    });
    if (!reqData) {
      throw new CustomError("wps file not found", 404);
    }
    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error finding wps file by ID: ${error.message}`,
      503
    );
  }
};

// Update a wps file
const updateWPSFile = async (id, data) => {
  try {
    const updatedWPSFile = await prisma.hrms_d_wps_file_log.update({
      where: { id: parseInt(id) },
      data: {
        ...serializeData(data),
        updatedby: data.updatedby || 1,
        updatedate: new Date(),
      },
    });
    return updatedWPSFile;
  } catch (error) {
    throw new CustomError(`Error updating wps file: ${error.message}`, 500);
  }
};

// Delete a wps file
const deleteWPSFile = async (id) => {
  try {
    await prisma.hrms_d_wps_file_log.delete({
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

// Get all wps files
const getAllWPSFile = async (search, page, size, startDate, endDate) => {
  try {
    page = !page || page == 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size || 0;

    const filters = {};
    // Handle search
    if (search) {
      filters.OR = [
        // {
        //   contracted_employee: {
        //     full_name: { contains: search.toLowerCase() },
        //   },
        // },
        {
          payroll_month: { contains: search.toLowerCase() },
        },
      ];
    }

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
    const datas = await prisma.hrms_d_wps_file_log.findMany({
      where: filters,
      skip: skip,
      take: size,
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
    });
    // const totalCount = await prisma.hrms_d_wps_file_log.count();
    const totalCount = await prisma.hrms_d_wps_file_log.count({
      where: filters,
    });

    return {
      data: datas,
      currentPage: page,
      size,
      totalPages: Math.ceil(totalCount / size),
      totalCount: totalCount,
    };
  } catch (error) {
    throw new CustomError("Error retrieving wps files", 503);
  }
};

module.exports = {
  createWPSFile,
  findWPSFileById,
  updateWPSFile,
  deleteWPSFile,
  getAllWPSFile,
};

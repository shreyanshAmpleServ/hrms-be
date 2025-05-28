const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const prisma = new PrismaClient();

const createKPI = async (data) => {
  try {
    const finalData = await prisma.hrms_m_kpi_master.create({
      data: {
        kpi_name: data.kpi_name,
        description: data.description,
        createdby: data.createdby || 1,
        log_inst: data.log_inst || 1,
        createdate: new Date(),
        updatedate: new Date(),
        updatedby: 1,
      },
    });
    return finalData;
  } catch (error) {
    console.log("Create KPI ", error);
    throw new CustomError(`Error creating KPI: ${error.message}`, 500);
  }
};

const findKPIById = async (id) => {
  try {
    const data = await prisma.hrms_m_kpi_master.findUnique({
      where: { id: parseInt(id) },
    });
    if (!data) {
      throw new CustomError("PF not found", 404);
    }
    return data;
  } catch (error) {
    console.log("PF By Id  ", error);
    throw new CustomError(`Error finding KPI by ID: ${error.message}`, 503);
  }
};

const updateKPI = async (id, data) => {
  try {
    const updatedData = await prisma.hrms_m_kpi_master.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        updatedate: new Date(),
      },
    });
    return updatedData;
  } catch (error) {
    throw new CustomError(`Error updating KPI: ${error.message}`, 500);
  }
};

const deleteKPI = async (id) => {
  try {
    await prisma.hrms_m_kpi_master.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    throw new CustomError(`Error deleting KPI: ${error.message}`, 500);
  }
};

const getAllKPI = async (page, size, search) => {
  try {
    page = page || page == 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size || 0;

    const filters = {};
    if (search) {
      filters.OR = [
        {
          kpi_name: { contains: search.toLowerCase() },
        },
      ];
    }

    // if (startDate && endDate) {
    //   const start = new Date(startDate);
    //   const end = new Date(endDate);

    //   if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
    //     filters.createdate = {
    //       gte: start,
    //       lte: end,
    //     };
    //   }
    // }
    const data = await prisma.hrms_m_kpi_master.findMany({
      where: filters,
      skip: skip,
      take: size,
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
    });

    const totalCount = await prisma.hrms_m_kpi_master.count({
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
    throw new CustomError("Error retrieving KPI", 503);
  }
};

module.exports = {
  createKPI,
  findKPIById,
  updateKPI,
  deleteKPI,
  getAllKPI,
};

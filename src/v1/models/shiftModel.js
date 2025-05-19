const { PrismaClient } = require('@prisma/client');
const CustomError = require('../../utils/CustomError');
const prisma = new PrismaClient();

const createShift = async (data) => {
  try {
    const finalData = await prisma.hrms_m_shift_master.create({
      data: {
        shift_name: data.shift_name,
        start_time: data.start_time,
        end_time: data.end_time,
        createdby: data.createdby || 1,
        log_inst: data.log_inst || 1,
        createdate:new Date(),
        updatedate: new Date(),
        updatedby:1,
      },
    });
    return finalData;
  } catch (error) {
    console.log("Create shift ",error)
    throw new CustomError(`Error creating shift: ${error.message}`, 500);
  }
};

const findShiftById = async (id) => {
  try {
    const data = await prisma.hrms_m_shift_master.findUnique({
      where: { id: parseInt(id) },
    });
    if (!data) {
      throw new CustomError('Shift not found', 404);
    }
    return data;
  } catch (error) {
    console.log("Shift By Id  ",error)
    throw new CustomError(`Error finding shift by ID: ${error.message}`, 503);
  }
};

const updateShift = async (id, data) => {
  try {
    const updatedData = await prisma.hrms_m_shift_master.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        updatedate: new Date(),
      },
    });
    return updatedData;
  } catch (error) {
    throw new CustomError(`Error updating shift: ${error.message}`, 500);
  }
};

const deleteShift = async (id) => {
  try {
    await prisma.hrms_m_shift_master.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    throw new CustomError(`Error deleting shift: ${error.message}`, 500);
  }
};

// Get all Shift
const getAllShift = async (  page,
  size,
  search,
  startDate,
  endDate) => {
  try {
      page = page || page == 0 ? 1 : page;
      size = size || 10;
      const skip = (page - 1) * size || 0;
  
      const filters = {};
      // Handle search
      if (search) {
        filters.OR = [

          // {
          //   campaign_leads: {
          //     title: { contains: search.toLowerCase() },
          //   }, // Include contact details
          // },
          {
            shift_name: { contains: search.toLowerCase() },
          },

        ];
      }
      // if (search) {
      //   filters.shift_name = { contains: search };
      // }
  
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
      const data = await prisma.hrms_m_shift_master.findMany({
        where: filters,
        skip: skip,
        take: size,

        orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
      });

      const totalCount = await prisma.hrms_m_shift_master.count({
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
      console.log(error)
      throw new CustomError('Error retrieving shift', 503);
  }
};


module.exports = {
  createShift,
  findShiftById,
  updateShift,
  deleteShift,
  getAllShift,
};
const { PrismaClient } = require('@prisma/client');
const CustomError = require('../../utils/CustomError');
const prisma = new PrismaClient();

const createDesignation = async (data) => {
  try {
    const designation = await prisma.hrms_m_designation_master.create({
      data: {
        designation_name: data.designation_name,
        createdby: data.createdby || 1,
        log_inst: data.log_inst || 1,
        is_active: data.is_active || 'Y',
        createdate:new Date(),
        updatedate: new Date(),
        updatedby:1,
      },
    });
    return designation;
  } catch (error) {
    console.log("Create designation ",error)
    throw new CustomError(`Error creating designation: ${error.message}`, 500);
  }
};

const findDesignationById = async (id) => {
  try {
    const designation = await prisma.hrms_m_designation_master.findUnique({
      where: { id: parseInt(id) },
    });
    if (!designation) {
      throw new CustomError('designation not found', 404);
    }
    return designation;
  } catch (error) {
    console.log("designation By Id  ",error)
    throw new CustomError(`Error finding designation by ID: ${error.message}`, 503);
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
    throw new CustomError(`Error deleting designation: ${error.message}`, 500);
  }
};

// Get all designation
const getAllDesignation = async (  page,
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
      // if (search) {
      //   filters.OR = [
      //     {
      //       campaign_user: {
      //         full_name: { contains: search.toLowerCase() },
      //       }, // Include contact details
      //     },
      //     {
      //       campaign_leads: {
      //         title: { contains: search.toLowerCase() },
      //       }, // Include contact details
      //     },
      //     {
      //       name: { contains: search.toLowerCase() },
      //     },
      //     {
      //       status: { contains: search.toLowerCase() },
      //     },
      //   ];
      // }
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
      const designations = await prisma.hrms_m_designation_master.findMany({
      //   where: filters,
        skip: skip,
        take: size,

        orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
      });

      const totalCount = await prisma.hrms_m_designation_master.count({
      //   where: filters,
      });
      return {
        data: designations,
        currentPage: page,
        size,
        totalPages: Math.ceil(totalCount / size),
        totalCount: totalCount,
      };

  } catch (error) {
      console.log(error)
      throw new CustomError('Error retrieving designations', 503);
  }
};


module.exports = {
  createDesignation,
  findDesignationById,
  updateDesignation,
  deleteDesignation,
  getAllDesignation,
};
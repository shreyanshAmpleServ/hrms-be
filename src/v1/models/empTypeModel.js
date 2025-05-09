const { PrismaClient } = require('@prisma/client');
const CustomError = require('../../utils/CustomError');
const prisma = new PrismaClient();

const createEmpType = async (data) => {
  try {
    const empType = await prisma.hrms_m_employment_type.create({
      data: {
        type_name: data.type_name,
        createdby: data.createdby || 1,
        log_inst: data.log_inst || 1,
        is_active: data.is_active || 'Y',
        createdate:new Date(),
        updatedate: new Date(),
        updatedby:1,
      },
    });
    return empType;
  } catch (error) {
    console.log("Create employee type ",error)
    throw new CustomError(`Error creating employee type: ${error.message}`, 500);
  }
};

const findEmpTypeById = async (id) => {
  try {
    const empType = await prisma.hrms_m_employment_type.findUnique({
      where: { id: parseInt(id) },
    });
    if (!empType) {
      throw new CustomError('employee type not found', 404);
    }
    return empType;
  } catch (error) {
    console.log("employee type By Id  ",error)
    throw new CustomError(`Error finding employee type by ID: ${error.message}`, 503);
  }
};

const updateEmpType = async (id, data) => {
  try {
    const updatedEmpType = await prisma.hrms_m_employment_type.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        updatedate: new Date(),
      },
    });
    return updatedEmpType;
  } catch (error) {
    throw new CustomError(`Error updating employee type: ${error.message}`, 500);
  }
};

const deleteEmpType = async (id) => {
  try {
    await prisma.hrms_m_employment_type.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    throw new CustomError(`Error deleting employee type: ${error.message}`, 500);
  }
};

// Get all employee type
const getAllEmpType = async (  page,
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
      const empTypes = await prisma.hrms_m_employment_type.findMany({
      //   where: filters,
        skip: skip,
        take: size,

        orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
      });

      const totalCount = await prisma.hrms_m_employment_type.count({
      //   where: filters,
      });
      return {
        data: empTypes,
        currentPage: page,
        size,
        totalPages: Math.ceil(totalCount / size),
        totalCount: totalCount,
      };

  } catch (error) {
      console.log(error)
      throw new CustomError('Error retrieving empTypes', 503);
  }
};


module.exports = {
  createEmpType,
  findEmpTypeById,
  updateEmpType,
  deleteEmpType,
  getAllEmpType,
};
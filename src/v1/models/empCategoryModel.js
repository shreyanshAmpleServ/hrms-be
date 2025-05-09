const { PrismaClient } = require('@prisma/client');
const CustomError = require('../../utils/CustomError');
const prisma = new PrismaClient();

const createEmpCategory = async (data) => {
  try {
    const empCategory = await prisma.hrms_m_employee_category.create({
      data: {
        category_name: data.category_name,
        createdby: data.createdby || 1,
        log_inst: data.log_inst || 1,
        is_active: data.is_active || 'Y',
        createdate:new Date(),
        updatedate: new Date(),
        updatedby:1,
      },
    });
    return empCategory;
  } catch (error) {
    console.log("Create employee category ",error)
    throw new CustomError(`Error creating employee category: ${error.message}`, 500);
  }
};

const findEmpCategoryById = async (id) => {
  try {
    const empCategory = await prisma.hrms_m_employee_category.findUnique({
      where: { id: parseInt(id) },
    });
    if (!empCategory) {
      throw new CustomError('employee category not found', 404);
    }
    return empCategory;
  } catch (error) {
    console.log("employee category By Id  ",error)
    throw new CustomError(`Error finding employee category by ID: ${error.message}`, 503);
  }
};

const updateEmpCategory = async (id, data) => {
  try {
    const updatedEmpCategory = await prisma.hrms_m_employee_category.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        updatedate: new Date(),
      },
    });
    return updatedEmpCategory;
  } catch (error) {
    throw new CustomError(`Error updating employee category: ${error.message}`, 500);
  }
};

const deleteEmpCategory = async (id) => {
  try {
    await prisma.hrms_m_employee_category.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    throw new CustomError(`Error deleting employee category: ${error.message}`, 500);
  }
};

// Get all employee category
const getAllEmpCategory = async (  page,
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
      const empCategories = await prisma.hrms_m_employee_category.findMany({
      //   where: filters,
        skip: skip,
        take: size,

        orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
      });

      const totalCount = await prisma.hrms_m_employee_category.count({
      //   where: filters,
      });
      return {
        data: empCategories,
        currentPage: page,
        size,
        totalPages: Math.ceil(totalCount / size),
        totalCount: totalCount,
      };

  } catch (error) {
      console.log(error)
      throw new CustomError('Error retrieving empCategories', 503);
  }
};


module.exports = {
  createEmpCategory,
  findEmpCategoryById,
  updateEmpCategory,
  deleteEmpCategory,
  getAllEmpCategory,
};
const { PrismaClient } = require('@prisma/client');
const CustomError = require('../../utils/CustomError');
const prisma = new PrismaClient();

const createStatutoryRate = async (data) => {
  try {
    const salaryStructure = await prisma.hrms_m_statutory_rate.create({
      data: {
        country_code: data.country_code,
        statutory_type: data.statutory_type,
        lower_limit: data.lower_limit,
        upper_limit: data.upper_limit,
        rate_percent: data.rate_percent,
        effective_from: data.effective_from,
        is_active: data.is_active || "Y",
        createdby: data.createdby || 1,
        log_inst: data.log_inst || 1,
        createdate:new Date(),
        updatedate: new Date(),
        updatedby:1,
      },
    });
    return salaryStructure;
  } catch (error) {
    console.log("Create statutory rate ",error)
    throw new CustomError(`Error creating statutory rate: ${error.message}`, 500);
  }
};

const findStatutoryRateById = async (id) => {
  try {
    const salaryStructure = await prisma.hrms_m_statutory_rate.findUnique({
      where: { id: parseInt(id) },
    });
    if (!salaryStructure) {
      throw new CustomError('statutory rate not found', 404);
    }
    return salaryStructure;
  } catch (error) {
    console.log("statutory rate By Id  ",error)
    throw new CustomError(`Error finding statutory rate by ID: ${error.message}`, 503);
  }
};

const updateStatutoryRate = async (id, data) => {
  try {
    const updatedSalaryStructure = await prisma.hrms_m_statutory_rate.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        updatedate: new Date(),
      },
    });
    return updatedSalaryStructure;
  } catch (error) {
    console.log("Error in updating Statutory : ", error)
    throw new CustomError(`Error updating statutory rate: ${error.message}`, 500);
  }
};

const deleteStatutoryRate = async (id) => {
  try {
    await prisma.hrms_m_statutory_rate.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    throw new CustomError(`Error deleting statutory rate: ${error.message}`, 500);
  }
};

// Get all statutory rate
const getAllStatutoryRate = async (  page,
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
      const salary = await prisma.hrms_m_statutory_rate.findMany({
      //   where: filters,
        skip: skip,
        take: size,

        orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
      });

      const totalCount = await prisma.hrms_m_statutory_rate.count({
      //   where: filters,
      });
      return {
        data: salary,
        currentPage: page,
        size,
        totalPages: Math.ceil(totalCount / size),
        totalCount: totalCount,
      };

  } catch (error) {
      console.log(error)
      throw new CustomError('Error retrieving statutory rate', 503);
  }
};


module.exports = {
  createStatutoryRate,
  findStatutoryRateById,
  updateStatutoryRate,
  deleteStatutoryRate,
  getAllStatutoryRate,
};
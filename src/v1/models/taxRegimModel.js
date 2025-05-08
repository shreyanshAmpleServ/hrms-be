const { PrismaClient } = require('@prisma/client');
const CustomError = require('../../utils/CustomError');
const prisma = new PrismaClient();

const createTaxRegime = async (data) => {
  try {
    const taxRegime = await prisma.hrms_m_tax_regime.create({
      data: {
        regime_name: data.regime_name,
        country_code: data.country_code,
        createdby: data.createdby || 1,
        log_inst: data.log_inst || 1,
        createdate:new Date(),
        updatedate: new Date(),
        updatedby:1,
      },
    });
    return taxRegime;
  } catch (error) {
    console.log("Create tax regime ",error)
    throw new CustomError(`Error creating tax regime: ${error.message}`, 500);
  }
};

const findTaxRegimeById = async (id) => {
  try {
    const taxRegime = await prisma.hrms_m_tax_regime.findUnique({
      where: { id: parseInt(id) },
    });
    if (!taxRegime) {
      throw new CustomError('tax regime not found', 404);
    }
    return taxRegime;
  } catch (error) {
    console.log("tax regime By Id  ",error)
    throw new CustomError(`Error finding tax regime by ID: ${error.message}`, 503);
  }
};

const updateTaxRegime = async (id, data) => {
  try {
    const updatedTaxRegime = await prisma.hrms_m_tax_regime.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        updatedate: new Date(),
      },
    });
    return updatedTaxRegime;
  } catch (error) {
    throw new CustomError(`Error updating tax regime: ${error.message}`, 500);
  }
};

const deleteTaxRegime = async (id) => {
  try {
    await prisma.hrms_m_tax_regime.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    throw new CustomError(`Error deleting tax regime: ${error.message}`, 500);
  }
};

// Get all tax regime
const getAllTaxRegime = async (  page,
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
          {
            regime_name: { contains: search.toLowerCase() },
          }
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
      const taxes = await prisma.hrms_m_tax_regime.findMany({
      //   where: filters,
        skip: skip,
        take: size,

        orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
      });

      const totalCount = await prisma.hrms_m_tax_regime.count({
      //   where: filters,
      });
      return {
        data: taxes,
        currentPage: page,
        size,
        totalPages: Math.ceil(totalCount / size),
        totalCount: totalCount,
      };

  } catch (error) {
      console.log(error)
      throw new CustomError('Error retrieving tax regime', 503);
  }
};


module.exports = {
  createTaxRegime,
  findTaxRegimeById,
  updateTaxRegime,
  deleteTaxRegime,
  getAllTaxRegime,
};
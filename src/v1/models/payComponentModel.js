const { PrismaClient } = require('@prisma/client');
const CustomError = require('../../utils/CustomError');
const prisma = new PrismaClient();

const createPayComponent = async (data) => {
  try {
    const payComponent = await prisma.hrms_m_pay_component.create({
      data: {
        component_name: data.component_name,
        component_code: data.component_code,
        component_type: data.component_type,
        is_taxable: data.is_taxable,
        is_statutory: data.is_statutory,
        is_active: data.is_active,
        createdby: data.createdby || 1,
        log_inst: data.log_inst || 1,
        createdate:new Date(),
        updatedate: new Date(),
        updatedby:1,
      },
    });
    return payComponent;
  } catch (error) {
    console.log("Create pay component ",error)
    throw new CustomError(`Error creating pay component: ${error.message}`, 500);
  }
};

const findPayComponentById = async (id) => {
  try {
    const payComponent = await prisma.hrms_m_pay_component.findUnique({
      where: { id: parseInt(id) },
    });
    if (!payComponent) {
      throw new CustomError('pay component not found', 404);
    }
    return payComponent;
  } catch (error) {
    console.log("pay component By Id  ",error)
    throw new CustomError(`Error finding pay component by ID: ${error.message}`, 503);
  }
};

const updatePayComponent = async (id, data) => {
  try {
    const updatedPayComponent = await prisma.hrms_m_pay_component.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        updatedate: new Date(),
      },
    });
    return updatedPayComponent;
  } catch (error) {
    throw new CustomError(`Error updating pay component: ${error.message}`, 500);
  }
};

const deletePayComponent = async (id) => {
  try {
    await prisma.hrms_m_pay_component.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    throw new CustomError(`Error deleting pay component: ${error.message}`, 500);
  }
};

// Get all pay component
const getAllPayComponent = async (  page,
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
      const pays = await prisma.hrms_m_pay_component.findMany({
      //   where: filters,
        skip: skip,
        take: size,

        orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
      });

      const totalCount = await prisma.hrms_m_pay_component.count({
      //   where: filters,
      });
      return {
        data: pays,
        currentPage: page,
        size,
        totalPages: Math.ceil(totalCount / size),
        totalCount: totalCount,
      };

  } catch (error) {
      console.log(error)
      throw new CustomError('Error retrieving pay components', 503);
  }
};


module.exports = {
  createPayComponent,
  findPayComponentById,
  updatePayComponent,
  deletePayComponent,
  getAllPayComponent,
};
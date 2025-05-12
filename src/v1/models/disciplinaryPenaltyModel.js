const { PrismaClient } = require('@prisma/client');
const CustomError = require('../../utils/CustomError');
const prisma = new PrismaClient();

const createDisciplinaryPenalty = async (data) => {
  try {
    const finalData = await prisma.hrms_m_disciplinary_penalty.create({
      data: {
        penalty_type: data.penalty_type || "",
        description: data.description || "",
        createdby: data.createdby || 1,
        log_inst: data.log_inst || 1,
        createdate:new Date(),
        updatedate: new Date(),
        updatedby:1,
      },
    });
    return finalData;
  } catch (error) {
    console.log("Create disciplinary penalty ",error)
    throw new CustomError(`Error creating disciplinary penalty: ${error.message}`, 500);
  }
};

const findDisciplinaryPenaltyById = async (id) => {
  try {
    const data = await prisma.hrms_m_disciplinary_penalty.findUnique({
      where: { id: parseInt(id) },
    });
    if (!data) {
      throw new CustomError('disciplinary penalty not found', 404);
    }
    return data;
  } catch (error) {
    console.log("disciplinary penalty By Id  ",error)
    throw new CustomError(`Error finding disciplinary penalty by ID: ${error.message}`, 503);
  }
};

const updateDisciplinaryPenalty = async (id, data) => {
  try {
    const updatedData = await prisma.hrms_m_disciplinary_penalty.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        updatedate: new Date(),
      },
    });
    return updatedData;
  } catch (error) {
    throw new CustomError(`Error updating disciplinary penalty: ${error.message}`, 500);
  }
};

const deleteDisciplinaryPenalty = async (id) => {
  try {
    await prisma.hrms_m_disciplinary_penalty.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    throw new CustomError(`Error deleting disciplinary penalty: ${error.message}`, 500);
  }
};

// Get all disciplinary penalty
const getAllDisciplinaryPenalty = async (  page,
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
            penalty_type: { contains: search.toLowerCase() },
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
      const data = await prisma.hrms_m_disciplinary_penalty.findMany({
      //   where: filters,
        skip: skip,
        take: size,

        orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
      });

      const totalCount = await prisma.hrms_m_disciplinary_penalty.count({
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
      console.log(error)
      throw new CustomError('Error retrieving disciplinary penalty', 503);
  }
};


module.exports = {
  createDisciplinaryPenalty,
  findDisciplinaryPenaltyById,
  updateDisciplinaryPenalty,
  deleteDisciplinaryPenalty,
  getAllDisciplinaryPenalty,
};
const { PrismaClient } = require('@prisma/client');
const CustomError = require('../../utils/CustomError');
const prisma = new PrismaClient();

const createSurvey = async (data) => {
  try {
    const finalData = await prisma.hrms_m_survey_master.create({
      data: {
        survey_title: data.survey_title || "",
        description: data.description || "",
        launch_date: data.launch_date || new Date(),
        close_date: data.close_date || null,
        createdby: data.createdby || 1,
        log_inst: data.log_inst || 1,
        createdate:new Date(),
        updatedate: new Date(),
        updatedby:1,
      },
    });
    return finalData;
  } catch (error) {
    console.log("Create survey ",error)
    throw new CustomError(`Error creating survey: ${error.message}`, 500);
  }
};

const findSurveyById = async (id) => {
  try {
    const data = await prisma.hrms_m_survey_master.findUnique({
      where: { id: parseInt(id) },
    });
    if (!data) {
      throw new CustomError('survey not found', 404);
    }
    return data;
  } catch (error) {
    console.log("survey By Id  ",error)
    throw new CustomError(`Error finding survey by ID: ${error.message}`, 503);
  }
};

const updateSurvey = async (id, data) => {
  try {
    const updatedData = await prisma.hrms_m_survey_master.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        updatedate: new Date(),
      },
    });
    return updatedData;
  } catch (error) {
    throw new CustomError(`Error updating survey: ${error.message}`, 500);
  }
};

const deleteSurvey = async (id) => {
  try {
    await prisma.hrms_m_survey_master.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    throw new CustomError(`Error deleting survey: ${error.message}`, 500);
  }
};

// Get all survey
const getAllSurvey = async (  page,
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
            survey_title: { contains: search.toLowerCase() },
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
      const data = await prisma.hrms_m_survey_master.findMany({
      //   where: filters,
        skip: skip,
        take: size,

        orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
      });

      const totalCount = await prisma.hrms_m_survey_master.count({
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
      throw new CustomError('Error retrieving survey', 503);
  }
};


module.exports = {
  createSurvey,
  findSurveyById,
  updateSurvey,
  deleteSurvey,
  getAllSurvey,
};
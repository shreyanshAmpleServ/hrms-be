const { PrismaClient } = require('@prisma/client');
const CustomError = require('../../utils/CustomError');
const prisma = new PrismaClient();

const createWorkEventType = async (data) => {
  try {
    const finalData = await prisma.hrms_m_work_life_event_type.create({
      data: {
        event_type_name: data.event_type_name || "",
        createdby: data.createdby || 1,
        log_inst: data.log_inst || 1,
        createdate:new Date(),
        updatedate: new Date(),
        updatedby:1,
      },
    });
    return finalData;
  } catch (error) {
    console.log("Create work life event type ",error)
    throw new CustomError(`Error creating work life event type: ${error.message}`, 500);
  }
};

const findWorkEventTypeById = async (id) => {
  try {
    const data = await prisma.hrms_m_work_life_event_type.findUnique({
      where: { id: parseInt(id) },
    });
    if (!data) {
      throw new CustomError('work life event type not found', 404);
    }
    return data;
  } catch (error) {
    console.log("work life event type By Id  ",error)
    throw new CustomError(`Error finding work life event type by ID: ${error.message}`, 503);
  }
};

const updateWorkEventType = async (id, data) => {
  try {
    const updatedData = await prisma.hrms_m_work_life_event_type.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        updatedate: new Date(),
      },
    });
    return updatedData;
  } catch (error) {
    throw new CustomError(`Error updating work life event type: ${error.message}`, 500);
  }
};

const deleteWorkEventType = async (id) => {
  try {
    await prisma.hrms_m_work_life_event_type.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    throw new CustomError(`Error deleting work life event type: ${error.message}`, 500);
  }
};

// Get all work life event type
const getAllWorkEventType = async (  page,
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
            event_type_name: { contains: search.toLowerCase() },
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
      const data = await prisma.hrms_m_work_life_event_type.findMany({
      //   where: filters,
        skip: skip,
        take: size,

        orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
      });

      const totalCount = await prisma.hrms_m_work_life_event_type.count({
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
      throw new CustomError('Error retrieving work life event type', 503);
  }
};


module.exports = {
  createWorkEventType,
  findWorkEventTypeById,
  updateWorkEventType,
  deleteWorkEventType,
  getAllWorkEventType,
};
const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const { errorNotExist } = require("../../Comman/errorNotExist");
const prisma = new PrismaClient();

const serializeData = (data) => {
  return {
    employee_id: Number(data.employee_id) || null,
    event_type: Number(data.event_type) || null,
    event_date: data.event_date || null,
    notes: data.notes || "",
    requires_followup: data.requires_followup,
  };
};

// Create a new event log
const createEventLog = async (data) => {
  try {
    if (!data.event_type) {
      throw new CustomError(`Event type is required`, 400);
    }
    await errorNotExist("hrms_d_employee", data.employee_id, "Employee");
    await errorNotExist(
      "hrms_m_work_life_event_type",
      data.event_type,
      "Event type"
    );
    const reqData = await prisma.hrms_d_work_life_event.create({
      data: {
        ...serializeData(data),
        createdby: data.createdby || 1,
        createdate: new Date(),
        log_inst: data.log_inst || 1,
      },
      include: {
        work_life_event_employee: {
          select: {
            full_name: true,
            id: true,
          },
        },
        work_life_event_type: {
          select: {
            event_type_name: true,
            id: true,
          },
        },
      },
    });
    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error creating event log: ${error.message}`,
      error.status || 500
    );
  }
};

// Find a event log by ID
const findEventLogById = async (id) => {
  try {
    const reqData = await prisma.hrms_d_work_life_event.findUnique({
      where: { id: parseInt(id) },
    });
    if (!reqData) {
      throw new CustomError("event log not found", 404);
    }
    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error finding event log by ID: ${error.message}`,
      503
    );
  }
};

// Update a event log
const updateEventLog = async (id, data) => {
  try {
    await errorNotExist("hrms_d_employee", data.employee_id, "Employee");
    await errorNotExist(
      "hrms_m_work_life_event_type",
      data.event_type,
      "Event type"
    );

    const updatedEventLog = await prisma.hrms_d_work_life_event.update({
      where: { id: parseInt(id) },
      data: {
        ...serializeData(data),
        updatedby: data.updatedby || 1,
        updatedate: new Date(),
      },
      include: {
        work_life_event_employee: {
          select: {
            full_name: true,
            id: true,
          },
        },
        work_life_event_type: {
          select: {
            event_type_name: true,
            id: true,
          },
        },
      },
    });
    return updatedEventLog;
  } catch (error) {
    console.log("Error ", error);
    throw new CustomError(`Error updating event log: ${error.message}`, 500);
  }
};

// Delete a event log
const deleteEventLog = async (id) => {
  try {
    await prisma.hrms_d_work_life_event.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    if (error.code === "P2003") {
      throw new CustomError(
        "This record cannot be deleted because it has associated data other records. Please remove the dependent data first.",
        400
      );
    } else {
      throw new CustomError(error.meta.constraint, 500);
    }
  }
};

// Get all event log
const getAllEventLog = async (search, page, size, startDate, endDate) => {
  try {
    page = !page || page == 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size || 0;

    const filters = {};
    // Handle search
    if (search) {
      filters.OR = [
        {
          work_life_event_employee: {
            full_name: { contains: search.toLowerCase() },
          },
        },
        {
          work_life_event_type: {
            event_type_name: { contains: search.toLowerCase() },
          },
        },
      ];
    }

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
    const datas = await prisma.hrms_d_work_life_event.findMany({
      where: filters,
      skip: skip,
      take: size,
      include: {
        work_life_event_employee: {
          select: {
            full_name: true,
            id: true,
          },
        },
        work_life_event_type: {
          select: {
            event_type_name: true,
            id: true,
          },
        },
      },
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
    });
    // const totalCount = await prisma.hrms_d_work_life_event.count();
    const totalCount = await prisma.hrms_d_work_life_event.count({
      where: filters,
    });

    return {
      data: datas,
      currentPage: page,
      size,
      totalPages: Math.ceil(totalCount / size),
      totalCount: totalCount,
    };
  } catch (error) {
    console.log("Error", error);
    throw new CustomError("Error retrieving event log", 503);
  }
};

module.exports = {
  createEventLog,
  findEventLogById,
  updateEventLog,
  deleteEventLog,
  getAllEventLog,
};

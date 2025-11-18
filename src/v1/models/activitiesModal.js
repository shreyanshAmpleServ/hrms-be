const { prisma } = require("../../utils/prismaProxy.js");
const CustomError = require("../../utils/CustomError");

const combineDateAndTime = (date, time) => {
  const dateObj = new Date(date); // Convert due_date (ISO format) to Date object
  const timeObj = new Date(time); // Convert due_time (ISO format) to Date object

  // Extract UTC Hours & Minutes from the time
  const hours = timeObj.getUTCHours();
  const minutes = timeObj.getUTCMinutes();

  // Apply extracted time to the due_date
  dateObj.setUTCHours(hours, minutes, 0, 0);

  return dateObj;
};

// get Activity Type
const getActivityType = async () => {
  try {
    const activityTypes = await prisma.Activitytypes.findMany({
      where: {
        is_active: "Y",
      },
      orderBy: [{ createdate: "desc" }, { updatedate: "desc" }],
    });
    return activityTypes;
  } catch (error) {
    throw new CustomError("Error retrieving activity Type", 503);
  }
};

// Create a new Activities
const createActivities = async (data) => {
  try {
    const activitiesStatus = await prisma.crms_d_activities.create({
      data: {
        ...data,
        due_time: data?.due_time || null,
        description: data.description || null,
        is_active: data.is_active || "Y",
        createdby: data.createdby || 1,
        log_inst: data.log_inst || 1,
        createddate: data.createddate || new Date(),
        updateddate: new Date(),
        updatedby: data.updatedby || 1,
      },
      include: {
        crms_m_activitytypes: {
          select: {
            id: true,
            name: true,
          },
        },
        crms_m_user: {
          select: {
            id: true,
            full_name: true,
            profile_img: true,
          },
        },
        deal_of_activity: {
          select: {
            id: true,
            dealName: true,
            dealValue: true,
          },
        },
        company_of_activity: {
          select: {
            id: true,
            name: true,
          },
        },
        contact_of_activity: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
    const { crms_m_activitytypes, crms_m_user, ...rest } = activitiesStatus;
    return {
      ...rest,
      activity_type: crms_m_activitytypes,
      owner: crms_m_user,
    };
  } catch (error) {
    console.log("Error in Create Activities", error);
    throw new CustomError(
      `Error creating activity status: ${error.message}`,
      500
    );
  }
};
//Updatae Activities
const updateActivities = async (id, data) => {
  try {
    const updatedData = {
      ...data,
      updateddate: new Date(),
    };
    const updatedActivity = await prisma.crms_d_activities.update({
      where: { id: parseInt(id) },
      include: {
        crms_m_activitytypes: {
          select: { id: true, name: true },
        },
        crms_m_user: {
          select: {
            id: true,
            full_name: true,
            profile_img: true,
          },
        },
        deal_of_activity: {
          select: {
            id: true,
            dealName: true,
            dealValue: true,
          },
        },
        company_of_activity: {
          select: {
            id: true,
            name: true,
          },
        },
        contact_of_activity: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      data: updatedData,
    });
    const { crms_m_activitytypes, crms_m_user, ...rest } = updatedActivity;
    return {
      ...rest,
      owner: crms_m_user,
      activity_type: updatedActivity.crms_m_activitytypes,
    };
  } catch (error) {
    console.log("Updating activity Error:", data);
    throw new CustomError(`Error updating activitiess: ${error.message}`, 500);
  }
};

// Get all Activities statuses
const getAllActivities = async (reqBody) => {
  try {
    page = !reqBody?.page || reqBody?.page == 0 ? 1 : reqBody?.page;
    size = reqBody?.size || 10;
    const skip = (page - 1) * size || 0;

    const filters = {};
    // Handle search
    if (reqBody?.search) {
      filters.OR = [
        {
          title: { contains: reqBody?.search.toLowerCase() },
        },
        {
          crms_m_activitytypes: {
            name: { contains: reqBody?.search.toLowerCase() },
          },
        },
        {
          crms_m_user: {
            full_name: { contains: reqBody?.search.toLowerCase() },
          },
        },
      ];
    }
    if (reqBody.filter2) {
      filters.crms_m_activitytypes = {
        is: {
          name: {
            equals: reqBody.filter2,
          },
        },
      };
    }

    if (reqBody?.startDate && reqBody?.endDate) {
      const start = new Date(reqBody?.startDate);
      const end = new Date(reqBody?.endDate);

      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        filters.createddate = {
          gte: start,
          lte: end,
        };
      }
    }
    const activitiesStatuss = await prisma.crms_d_activities.findMany({
      // where :{...(reqBody?.search
      //   ? {
      //       OR: [
      //         {
      //           title: { contains: reqBody?.search.toLowerCase() },
      //         },
      //         {
      //           crms_m_activitytypes: {
      //             name: { contains: reqBody?.search.toLowerCase() },
      //           },
      //         },
      //         {
      //           crms_m_user: {
      //             full_name: { contains: reqBody?.search.toLowerCase() },
      //           },
      //         },
      //       ],
      //     }
      //   : {}),
      //   ...(reqBody?.filter2 && {
      //     crms_m_activitytypes : {
      //       // select : {
      //         name : reqBody?.filter2
      //       // }
      //     }
      //   })
      // },
      where: filters,
      skip: skip,
      take: size,
      include: {
        crms_m_activitytypes: {
          select: {
            id: true,
            name: true,
          },
        },
        crms_m_user: {
          select: {
            id: true,
            full_name: true,
            profile_img: true,
          },
        },
        deal_of_activity: {
          select: {
            id: true,
            dealName: true,
            dealValue: true,
          },
        },
        company_of_activity: {
          select: {
            id: true,
            name: true,
          },
        },
        contact_of_activity: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: [
        { updateddate: reqBody?.filter === "asc" ? "asc" : "desc" },
        { createddate: reqBody?.filter === "asc" ? "asc" : "desc" },
      ],
    });
    // Renaming the field `crms_m_activitytypes` to `activity_type`
    const activitiesWithRenamedType = activitiesStatuss.map((activity) => {
      const { crms_m_activitytypes, crms_m_user, ...rest } = activity;
      return {
        ...rest,
        owner: crms_m_user,
        activity_type: crms_m_activitytypes,
      };
    });
    // return activitiesWithRenamedType;
    const totalCount = await prisma.crms_d_activities.count();
    return {
      data: activitiesWithRenamedType,
      currentPage: page,
      size,
      totalPages: Math.ceil(totalCount / size),
      totalCount: totalCount,
    };
  } catch (error) {
    console.log("Get activity", error);
    throw new CustomError("Error retrieving activity statuses", 503);
  }
};
// Get all Activities statuses
const getGroupActivities = async (reqBody) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const filters = {};
    if (reqBody?.sortBy === "Recent") {
      filters.due_date = { lt: today }; // Less than today (past activities)
    } else {
      filters.due_date = { gte: today }; // Greater than or equal to today (upcoming)
    }
    if (reqBody?.contact_id) filters.contact_id = Number(reqBody.contact_id);
    if (reqBody?.deal_id) filters.deal_id = Number(reqBody.deal_id);
    if (reqBody?.company_id) filters.company_id = Number(reqBody.company_id);
    if (reqBody?.vendor_id) filters.vendor_id = Number(reqBody.vendor_id);
    if (reqBody?.owner_id) filters.owner_id = Number(reqBody.owner_id);
    if (reqBody?.project_id) filters.project_id = Number(reqBody.project_id);

    if (reqBody?.reqBody?.search) {
      filters.OR = [
        {
          title: {
            contains: reqBody.reqBody?.search.toLowerCase(),
            mode: "insensitive",
          },
        },
        {
          crms_m_activitytypes: {
            name: {
              contains: reqBody.reqBody?.search.toLowerCase(),
              mode: "insensitive",
            },
          },
        },
        {
          crms_m_user: {
            full_name: {
              contains: reqBody.reqBody?.search.toLowerCase(),
              mode: "insensitive",
            },
          },
        },
      ];
    }
    const activitiesStatuss = await prisma.crms_d_activities.findMany({
      where: filters,
      include: {
        crms_m_activitytypes: {
          select: {
            id: true,
            name: true,
          },
        },
        crms_m_user: {
          select: {
            id: true,
            full_name: true,
            profile_img: true,
          },
        },
      },
      orderBy: [
        { due_date: reqBody?.orderBy === "Descending" ? "desc" : "asc" },
      ],
    });

    // Renaming the field `crms_m_activitytypes` to `activity_type`
    const activitiesWithRenamedType = activitiesStatuss.map((activity) => {
      const { crms_m_activitytypes, due_date, due_time, crms_m_user, ...rest } =
        activity;

      const combinedDueDateTime =
        due_date && due_time ? combineDateAndTime(due_date, due_time) : null;
      return {
        ...rest,
        owner: crms_m_user,
        due_date: combinedDueDateTime ? combinedDueDateTime : due_date,
        due_time: due_time,
        activity_type: crms_m_activitytypes,
      };
    });

    // Group activities by `due_date`
    const groupedActivities = activitiesWithRenamedType.reduce(
      (groups, activity) => {
        const dueDate = activity.due_date
          ? activity.due_date.toISOString().split("T")[0]
          : "No Due Date"; // Format to YYYY-MM-DD
        if (!groups[dueDate]) {
          groups[dueDate] = [];
        }
        groups[dueDate].push(activity);
        return groups;
      },
      {}
    );

    return groupedActivities;
  } catch (error) {
    console.log("Get activity", error);
    throw new CustomError("Error retrieving activity statuses", 503);
  }
};

const deleteActivities = async (id) => {
  try {
    await prisma.crms_d_activities.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    if (error.code === "P2003") {
      throw new CustomError(
        "This record is connected to other data. Please remove that first.",
        400
      );
    } else {
      throw new CustomError(error.meta.constraint, 500);
    }
  }
};

module.exports = {
  getAllActivities,
  createActivities,
  deleteActivities,
  updateActivities,
  getActivityType,
  getGroupActivities,
};

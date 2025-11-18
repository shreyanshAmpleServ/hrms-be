// const { prisma } = require("../../utils/prismaProxy.js");
const CustomError = require("../../utils/CustomError");
//
const { prisma } = require("../../utils/prismaProxy.js");

const serializeAnnouncementData = (data) => ({
  title: data.title || "",
  description: data.description || "",
  image_url: data.image_url || null,
  priority: data.priority || "Normal",
  target_type: data.target_type || "",
  target_values: JSON.stringify(data.target_values || []),
  scheduled_at: data.scheduled_at ? new Date(data.scheduled_at) : null,
  is_active: data.is_active || "Y",
});

const createAnnouncement = async (data) => {
  try {
    const reqData = await prisma.hrms_d_announcement.create({
      data: {
        ...serializeAnnouncementData(data),
        createdby: data.createdby || 1,
        createdate: new Date(),
        log_inst: data.log_inst || 1,
      },
    });

    return reqData;
  } catch (error) {
    console.log("Error creating announcement", error);
    throw new CustomError(`Error creating announcement: ${error.message}`, 500);
  }
};

const findAnnouncementById = async (id) => {
  try {
    const reqData = await prisma.hrms_d_announcement.findUnique({
      where: { id: parseInt(id) },
      include: {
        announcement_logs: {
          orderBy: { createdate: "desc" },
        },
      },
    });

    if (!reqData) {
      throw new CustomError("Announcement not found", 404);
    }

    return {
      ...reqData,
      target_values: JSON.parse(reqData.target_values || "[]"),
    };
  } catch (error) {
    throw new CustomError(
      `Error finding announcement by ID: ${error.message}`,
      503
    );
  }
};

const updateAnnouncement = async (id, data) => {
  try {
    const updatedEntry = await prisma.hrms_d_announcement.update({
      where: { id: parseInt(id) },

      data: {
        ...serializeAnnouncementData(data),
        updatedby: data.updatedby || 1,
        updatedate: new Date(),
      },
    });

    return {
      ...updatedEntry,
      target_values: JSON.parse(updatedEntry.target_values || "[]"),
    };
  } catch (error) {
    console.log("Error in updating announcement", error);
    throw new CustomError(`Error updating announcement: ${error.message}`, 500);
  }
};

const deleteAnnouncement = async (id) => {
  try {
    await prisma.hrms_d_announcement.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    if (error.code === "P2003") {
      throw new CustomError(
        "This record cannot be deleted because it has associated data in other records. Please remove the dependent data first.",
        400
      );
    } else {
      throw new CustomError(error.message, 500);
    }
  }
};

const getAllAnnouncement = async (search, page, size, startDate, endDate) => {
  try {
    page = !page || page == 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size || 0;
    const filters = {};

    if (search) {
      filters.OR = [
        { title: { contains: search.toLowerCase() } },
        { description: { contains: search.toLowerCase() } },
        { priority: { contains: search.toLowerCase() } },
        { target_type: { contains: search.toLowerCase() } },
      ];
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        filters.createdate = { gte: start, lte: end };
      }
    }

    const datas = await prisma.hrms_d_announcement.findMany({
      where: filters,
      skip,
      take: size,
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
      include: {
        _count: {
          select: {
            announcement_logs: true,
          },
        },
      },
    });

    const totalCount = await prisma.hrms_d_announcement.count({
      where: filters,
    });

    return {
      data: datas.map((item) => ({
        ...item,
        target_values: JSON.parse(item.target_values || "[]"),
      })),
      currentPage: page,
      size,
      totalPages: Math.ceil(totalCount / size),
      totalCount,
    };
  } catch (error) {
    throw new CustomError("Error retrieving announcements", 503);
  }
};

const logAnnouncementAction = async (
  announcementId,
  action,
  details,
  status,
  createdby = null
) => {
  try {
    await prisma.hrms_d_announcement_log.create({
      data: {
        announcement_id: parseInt(announcementId),
        action: action,
        details: JSON.stringify(details),
        status: status,
        processed_count: details.processed_count || 0,
        failed_count: details.failed_count || 0,
        recipient_emails: JSON.stringify(details.recipient_emails || []),
        createdby: createdby,
      },
    });
  } catch (error) {
    console.error(" Error logging announcement action:", error);
  }
};

module.exports = {
  createAnnouncement,
  findAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
  getAllAnnouncement,
  logAnnouncementAction,
};

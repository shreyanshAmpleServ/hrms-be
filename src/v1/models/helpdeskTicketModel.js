/**
 * @fileoverview Helpdesk ticket model handling CRUD operations for helpdesk tickets
 * @module helpdeskTicketModel
 */

const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const prisma = new PrismaClient();

/**
 * Creates a new helpdesk ticket
 * @param {Object} data - Helpdesk ticket data to create
 * @returns {Promise<Object>} Created helpdesk ticket
 * @throws {CustomError} If database error occurs
 */
const createHelpdeskTicket = async (data) => {
  try {
    const reqData = await prisma.hrms_d_helpdesk_ticket.create({
      data: {
        employee_id: data.employee_id,
        ticket_subject: data.ticket_subject,
        ticket_type: data.ticket_type,
        status: data.status,
        priority: data.priority,
        assigned_to: data.assigned_to,
        description: data.description,
        submitted_on: new Date(data.submitted_on),
        createdby: Number(data.createdby) || 1,
        createdate: new Date(),
      },
      include: {
        helpdesk_employee: {
          select: {
            id: true,
            full_name: true,
          },
        },
        helpdesk_assign_to: {
          select: {
            id: true,
            full_name: true,
          },
        },
      },
    });
    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error creating helpdesk ticket: ${error.message}`,
      500
    );
  }
};

/**
 * Finds a helpdesk ticket by ID
 * @param {number|string} id - Helpdesk ticket ID
 * @returns {Promise<Object>} Helpdesk ticket
 * @throws {CustomError} If helpdesk ticket not found or database error occurs
 */
const findHelpdeskTicketById = async (id) => {
  try {
    const reqData = await prisma.hrms_d_helpdesk_ticket.findUnique({
      where: { id: parseInt(id) },
    });
    if (!reqData) {
      throw new CustomError("Helpdesk ticket not found", 404);
    }
    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error finding helpdesk ticket by ID: ${error.message}`,
      503
    );
  }
};

/**
 * Updates a helpdesk ticket
 * @param {number|string} id - Helpdesk ticket ID to update
 * @param {Object} data - Updated helpdesk ticket data
 * @returns {Promise<Object>} Updated helpdesk ticket
 * @throws {CustomError} If database error occurs
 */
const updateHelpdeskTicket = async (id, data) => {
  try {
    const payload = {
      employee_id: data.employee_id,
      ticket_subject: data.ticket_subject,
      ticket_type: data.ticket_type,
      status: data.status,
      priority: data.priority,
      assigned_to: data.assigned_to,
      description: data.description,
      submitted_on: new Date(data.submitted_on),
      updatedby: Number(data.updatedby) || 1,
      updatedate: new Date(),
    };

    const updatedHelpdeskTicket = await prisma.hrms_d_helpdesk_ticket.update({
      where: { id: parseInt(id) },
      data: payload,
      include: {
        helpdesk_employee: {
          select: {
            id: true,
            full_name: true,
          },
        },
        helpdesk_assign_to: {
          select: {
            id: true,
            full_name: true,
          },
        },
      },
    });
    return updatedHelpdeskTicket;
  } catch (error) {
    throw new CustomError(
      `Error updating helpdesk ticket: ${error.message}`,
      500
    );
  }
};

/**
 * Deletes a helpdesk ticket
 * @param {number|string} id - Helpdesk ticket ID to delete
 * @throws {CustomError} If database error occurs
 */
const deleteHelpdeskTicket = async (id) => {
  try {
    await prisma.hrms_d_helpdesk_ticket.delete({
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

/**
 * Gets all helpdesk tickets with pagination and filtering
 * @param {string} [search] - Search term for filtering tickets
 * @param {number} [page=1] - Page number for pagination
 * @param {number} [size=10] - Number of items per page
 * @param {string} [startDate] - Start date for date range filter
 * @param {string} [endDate] - End date for date range filter
 * @returns {Promise<Object>} Paginated helpdesk tickets with metadata
 * @throws {CustomError} If database error occurs
 */
const getAllHelpdeskTickets = async (
  search,
  page,
  size,
  startDate,
  endDate
) => {
  try {
    page = !page || page == 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size || 0;

    const filterConditions = [];

    if (search) {
      filterConditions.push({
        OR: [
          {
            helpdesk_employee: {
              full_name: { contains: search.toLowerCase() },
            },
          },
          {
            helpdesk_assign_to: {
              full_name: { contains: search.toLowerCase() },
            },
          },
          { ticket_subject: { contains: search.toLowerCase() } },
          { ticket_type: { contains: search.toLowerCase() } },
          { description: { contains: search.toLowerCase() } },
        ],
      });
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        filterConditions.push({ createdate: { gte: start, lte: end } });
      }
    }

    const filters =
      filterConditions.length > 0 ? { AND: filterConditions } : {};

    const datas = await prisma.hrms_d_helpdesk_ticket.findMany({
      where: filters,
      skip,
      take: size,
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
      include: {
        helpdesk_employee: {
          select: {
            id: true,
            full_name: true,
          },
        },
        helpdesk_assign_to: {
          select: {
            id: true,
            full_name: true,
          },
        },
      },
    });

    const totalCount = await prisma.hrms_d_helpdesk_ticket.count({
      where: filters,
    });

    return {
      data: datas,
      currentPage: page,
      size,
      totalPages: Math.ceil(totalCount / size),
      totalCount,
    };
  } catch (error) {
    throw new CustomError("Error retrieving helpdesk tickets", 400);
  }
};

module.exports = {
  createHelpdeskTicket,
  findHelpdeskTicketById,
  updateHelpdeskTicket,
  deleteHelpdeskTicket,
  getAllHelpdeskTickets,
};

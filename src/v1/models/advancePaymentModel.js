/**
 * @fileoverview Advance payment model handling CRUD operations for advance payments
 * @module advancePaymentModel
 */

const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const prisma = new PrismaClient();

/**
 * Creates a new advance payment
 * @param {Object} data - Advance payment data to create
 * @returns {Promise<Object>} Created advance payment
 * @throws {CustomError} If database error occurs
 */
const createAdvancePayment = async (data) => {
  try {
    const reqData = await prisma.hrms_d_advance_payment_entry.create({
      data: {
        employee_id: data.employee_id,
        request_date: data.request_date,
        amount_requested: data.amount_requested,
        amount_approved: data.amount_approved,
        approval_status: data.approval_status || "pending",
        approval_date: data.approval_date,
        approved_by: data.approved_by,
        reason: data.reason,
        repayment_schedule: data.repayment_schedule,
        createdby: data.createdby,
        createdate: new Date(),
        log_inst: data.log_inst,
      },
      include: {
        hrms_advance_payement_entry_employee: {
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
      `Error creating advance payment: ${error.message}`,
      500
    );
  }
};

/**
 * Finds a advance payment by ID
 * @param {number|string} id - Advance payment ID
 * @returns {Promise<Object>} Advance payment
 * @throws {CustomError} If advance payment not found or database error occurs
 */
const findAdvancePaymentById = async (id) => {
  try {
    const reqData = await prisma.hrms_d_advance_payment_entry.findUnique({
      where: { id: parseInt(id) },
      include: {
        hrms_advance_payement_entry_employee: {
          select: {
            id: true,
            full_name: true,
          },
        },
      },
    });
    if (!reqData) {
      throw new CustomError("Advance payment not found", 404);
    }
    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error finding advance payment by ID: ${error.message}`,
      503
    );
  }
};

/**
 * Updates a advance payment
 * @param {number|string} id - Advance payment ID to update
 * @param {Object} data - Updated advance payment data
 * @returns {Promise<Object>} Updated advance payment
 * @throws {CustomError} If database error occurs
 */
const updateAdvancePayment = async (id, data) => {
  try {
    const payload = {
      employee_id: data.employee_id,
      request_date: data.request_date,
      amount_requested: data.amount_requested,
      amount_approved: data.amount_approved,
      approval_status: data.approval_status || "pending",
      approval_date: data.approval_date,
      approved_by: data.approved_by,
      reason: data.reason,
      repayment_schedule: data.repayment_schedule,
      updatedby: Number(data.updatedby) || 1,
      updatedate: new Date(),
    };

    const updatedAdvancePayment =
      await prisma.hrms_d_advance_payment_entry.update({
        where: { id: parseInt(id) },
        data: payload,
        include: {
          hrms_advance_payement_entry_employee: {
            select: {
              id: true,
              full_name: true,
            },
          },
        },
      });
    return updatedAdvancePayment;
  } catch (error) {
    throw new CustomError(
      `Error updating advance payment: ${error.message}`,
      500
    );
  }
};

/**
 * Deletes a advance payment
 * @param {number|string} id - Advance payment ID to delete
 * @throws {CustomError} If database error occurs
 */
const deleteAdvancePayment = async (id) => {
  try {
    await prisma.hrms_d_advance_payment_entry.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    throw new CustomError(
      `Error deleting advance payment: ${error.message}`,
      500
    );
  }
};

/**
 * Gets all advance payments with pagination and filtering
 * @param {string} [search] - Search term for filtering tickets
 * @param {number} [page=1] - Page number for pagination
 * @param {number} [size=10] - Number of items per page
 * @param {string} [startDate] - Start date for date range filter
 * @param {string} [endDate] - End date for date range filter
 * @returns {Promise<Object>} Paginated advance payments with metadata
 * @throws {CustomError} If database error occurs
 */
const getAllAdvancePayments = async (
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
            hrms_advance_payement_entry_employee: {
              full_name: { contains: search.toLowerCase() },
            },
          },
          {
            approval_status: { contains: search.toLowerCase() },
          },
          {
            reason: { contains: search.toLowerCase() },
          },
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

    const datas = await prisma.hrms_d_advance_payment_entry.findMany({
      where: filters,
      skip,
      take: size,
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
      include: {
        hrms_advance_payement_entry_employee: {
          select: {
            id: true,
            full_name: true,
          },
        },
      },
    });

    const totalCount = await prisma.hrms_d_advance_payment_entry.count({
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
    console.log(error);
    throw new CustomError("Error retrieving advance payments", 400);
  }
};

module.exports = {
  createAdvancePayment,
  findAdvancePaymentById,
  updateAdvancePayment,
  deleteAdvancePayment,
  getAllAdvancePayments,
};

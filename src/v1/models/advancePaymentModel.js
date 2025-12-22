const { prisma } = require("../../utils/prismaProxy.js");
const CustomError = require("../../utils/CustomError");

const { createRequest } = require("./requestsModel.js");
// const createAdvancePayment = async (data) => {
//   try {
//     const reqData = await prisma.hrms_d_advance_payment_entry.create({
//       data: {
//         employee_id: data.employee_id,
//         request_date: data.request_date,
//         amount_requested: data.amount_requested,
//         amount_approved: data.amount_approved,
//         approval_status: data.approval_status || "pending",
//         approval_date: data.approval_date,
//         approved_by: data.approved_by,
//         reason: data.reason,
//         repayment_schedule: data.repayment_schedule,
//         createdby: data.createdby,
//         createdate: new Date(),
//         log_inst: data.log_inst,
//       },
//       include: {
//         hrms_advance_payement_entry_employee: {
//           select: {
//             id: true,
//             full_name: true,
//           },
//         },
//       },
//     });
//     await createRequest({
//       requester_id: reqData.employee_id,
//       request_type: "advance_request",
//       reference_id: reqData.id,
//       // request_data:
//       //   reqData.reason ||
//       //   `Leave from ${reqData.start_date} to ${reqData.end_date}`,
//       createdby: data.createdby || 1,
//       log_inst: data.log_inst || 1,
//     });
//     return reqData;
//   } catch (error) {
//     throw new CustomError(
//       `Error creating advance payment: ${error.message}`,
//       500
//     );
//   }
// };

const serializeAdvancePaymentInput = (data) => {
  const payload = {};

  if (data.request_date) {
    payload.request_date = new Date(data.request_date);
  }

  if (data.amount_requested !== undefined && data.amount_requested !== null) {
    payload.amount_requested = Number(data.amount_requested);
  }

  if (data.amount_approved !== undefined && data.amount_approved !== null) {
    payload.amount_approved = Number(data.amount_approved);
  }
  payload.approval_status = data.approval_status || "pending";

  if (data.approval_date) {
    payload.approval_date = new Date(data.approval_date);
  }
  if (data.reason) {
    payload.reason = data.reason;
  }

  if (data.repayment_schedule) {
    payload.repayment_schedule = data.repayment_schedule;
  }

  if (data.id === undefined || data.id === null) {
    payload.createdate = new Date();
    payload.createdby = Number(data.createdby) || 1;
  }
  if (data.id) {
    payload.updatedate = new Date();
    payload.updatedby = Number(data.updatedby) || 1;
  }

  payload.log_inst = data.log_inst || 1;

  // 🔗 EMPLOYEE RELATION (REQUIRED)
  if (data.employee_id) {
    payload.hrms_advance_payement_entry_employee = {
      connect: {
        id: Number(data.employee_id),
      },
    };
  }

  // 🔗 APPROVED BY RELATION (OPTIONAL)
  if (data.approved_by) {
    payload.hrms_advance_payement_entry_approvedBy = {
      connect: {
        id: Number(data.approved_by),
      },
    };
  }

  return payload;
};

const createAdvancePayment = async (data) => {
  try {
    const reqData = await prisma.hrms_d_advance_payment_entry.create({
      data: serializeAdvancePaymentInput(data),
      // data: {
      //   employee_id: Number(data.employee_id),
      //   request_date: new Date(data.request_date),
      //   amount_requested: data.amount_requested,
      //   amount_approved: data.amount_approved,
      //   approval_status: data.approval_status || "pending",
      //   approval_date: data.approval_date ? new Date(data.approval_date) : null,
      //   approved_by: data.approved_by || null,
      //   reason: data.reason || "",
      //   repayment_schedule: data.repayment_schedule || null,
      //   createdby: data.createdby,
      //   createdate: new Date(),
      //   log_inst: data.log_inst || null,
      // },
      include: {
        hrms_advance_payement_entry_employee: {
          select: { id: true, full_name: true },
        },
        hrms_advance_payement_entry_approvedBy: {
          select: { id: true, full_name: true },
        },
      },
    });

    await createRequest({
      requester_id: reqData.hrms_advance_payement_entry_employee.id,
      request_type: "advance_request",
      reference_id: reqData.id,
      createdby: data.createdby || 1,
      log_inst: data.log_inst || 1,
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
        data: serializeAdvancePaymentInput({ id, ...data }),

        // data: payload,
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

const updateAdvancePaymentStatus = async (id, data) => {
  try {
    const advancePayment = parseInt(id);
    if (isNaN(advancePayment)) {
      throw new CustomError("Invalid advance payement ID", 400);
    }

    const existingAdvancePayement =
      await prisma.hrms_d_leave_application.findUnique({
        where: { id: leaveId },
      });

    if (!existingAdvancePayement) {
      throw new CustomError("Advance payement not found", 404);
    }

    const updateData = {
      status: data.status,
      updatedby: data.updatedby || 1,
      updatedate: new Date(),
    };

    if (data.status === "Approved") {
      updateData.approver_by = Number(data.approver_by) || null;
      updateData.approval_date = new Date();
      updateData.reason = "";
    } else if (data.status === "Rejected") {
      updateData.approver_by = Number(data.approver_by) || null;
      updateData.approval_date = new Date();
      updateData.reason = reason || "";
    } else {
      updateData.approver_by = null;
      updateData.approval_date = null;
      updateData.reason = "";
    }
    const updatedEntry = await prisma.hrms_d_advance_payment_entry.update({
      where: { id: advancePayment },
      data: updateData,
    });
    return updatedEntry;
  } catch (error) {
    console.error("Error updating advance payement status:", error);
    throw new CustomError(
      `Error updating advance payement status: ${error.message}`,
      error.status || 500
    );
  }
};

module.exports = {
  createAdvancePayment,
  findAdvancePaymentById,
  updateAdvancePayment,
  deleteAdvancePayment,
  getAllAdvancePayments,
};

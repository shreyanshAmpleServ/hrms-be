const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const { errorNotExist } = require("../../Comman/errorNotExist");
const prisma = new PrismaClient();

const serializeData = (data) => {
  return {
    employee_id: Number(data.employee_id) || null,
    loan_type_id: Number(data.loan_type_id) || null,
    amount: Number(data.amount) || 0,
    emi_months: Number(data.emi_months) || 0,
    currency: Number(data.currency),
    status: data.status || "",
    start_date: data.start_date || null,
  };
};

const createLoanRequest = async (data) => {
  try {
    await errorNotExist("hrms_d_employee", data.employee_id, "Employee");

    const result = await prisma.$transaction(async (tx) => {
      const serialized = serializeData(data);

      const loanRequest = await tx.hrms_d_loan_request.create({
        data: {
          ...serialized,
          createdby: data.createdby || 1,
          createdate: new Date(),
          log_inst: data.log_inst || 1,
        },
      });

      const loanId = loanRequest.id;
      const employeeId = serialized.employee_id;
      const { emi_schedule = [] } = data;

      if (!Array.isArray(emi_schedule) || emi_schedule.length === 0) {
        throw new CustomError("emi_schedule is required", 400);
      }

      const emiData = emi_schedule.map((emi) => ({
        loan_request_id: loanId,
        employee_id: employeeId,
        due_month: emi.due_month,
        due_year: emi.due_year,
        emi_amount: Number(emi.emi_amount),
        status: emi.status || "U",
        payslip_id: emi.payslip_id ?? null,
        createdby: data.createdby || 1,
        createdate: new Date(),
        log_inst: data.log_inst || 1,
      }));

      await tx.hrms_d_loan_emi_schedule.createMany({
        data: emiData,
      });

      const reqData = await tx.hrms_d_loan_request.findUnique({
        where: { id: loanId },
        include: {
          loan_req_employee: {
            select: { full_name: true, id: true },
          },
          loan_req_currency: {
            select: { id: true, currency_code: true, currency_name: true },
          },
          loan_types: {
            select: { loan_name: true, id: true },
          },
          loan_emi_loan_request: {
            select: {
              id: true,
              due_month: true,
              due_year: true,
              emi_amount: true,
              status: true,
              payslip_id: true,
            },
          },
        },
      });

      return reqData;
    });

    return result;
  } catch (error) {
    console.error("Error creating loan request with EMI schedule:", error);
    throw new CustomError(`Error creating loan request: ${error.message}`, 500);
  }
};

const findLoanRequestById = async (id) => {
  try {
    const reqData = await prisma.hrms_d_loan_request.findUnique({
      where: { id: parseInt(id) },
      include: {
        loan_req_employee: {
          select: {
            full_name: true,
            id: true,
            employee_code: true,
            account_number: true,
          },
        },
        loan_types: {
          select: {
            loan_name: true,
            id: true,
          },
        },
        loan_req_currency: {
          select: {
            id: true,
            currency_code: true,
            currency_name: true,
          },
        },
        loan_emi_loan_request: {
          select: {
            id: true,
            due_month: true,
            due_year: true,
            emi_amount: true,
            status: true,
            payslip_id: true,
          },
        },
      },
    });
    if (!reqData) {
      throw new CustomError("loan request not found", 404);
    }
    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error finding loan request by ID: ${error.message}`,
      503
    );
  }
};

const updateLoanRequest = async (id, data) => {
  try {
    await errorNotExist("hrms_d_employee", data.employee_id, "Employee");

    const result = await prisma.$transaction(
      async (tx) => {
        const serialized = serializeData(data);

        const updatedLoanRequest = await tx.hrms_d_loan_request.update({
          where: { id: parseInt(id) },
          data: {
            ...serialized,
            updatedby: data.updatedby || 1,
            updatedate: new Date(),
          },
        });

        const loanId = updatedLoanRequest.id;
        const employeeId = serialized.employee_id;
        const { emi_schedule = [] } = data;

        if (!Array.isArray(emi_schedule) || emi_schedule.length === 0) {
          throw new CustomError("emi_schedule is required", 400);
        }

        for (const emi of emi_schedule) {
          if (emi.status === "P") continue;

          const commonFields = {
            loan_request_id: loanId,
            employee_id: employeeId,
            due_month: emi.due_month,
            due_year: emi.due_year,
            emi_amount: Number(emi.emi_amount),
            payslip_id: emi.payslip_id ?? null,
            log_inst: data.log_inst || 1,
          };

          if (emi.id) {
            await tx.hrms_d_loan_emi_schedule.update({
              where: { id: emi.id },
              data: {
                ...commonFields,
                updatedby: data.updatedby || 1,
                updatedate: new Date(),
              },
            });
          } else {
            await tx.hrms_d_loan_emi_schedule.create({
              data: {
                ...commonFields,
                status: emi.status || "U",
                createdby: data.updatedby || 1,
                createdate: new Date(),
              },
            });
          }
        }

        const finalData = await tx.hrms_d_loan_request.findUnique({
          where: { id: loanId },
          include: {
            loan_req_employee: {
              select: { full_name: true, id: true },
            },
            loan_req_currency: {
              select: { id: true, currency_code: true, currency_name: true },
            },
            loan_types: {
              select: { loan_name: true, id: true },
            },
            loan_emi_loan_request: {
              select: {
                id: true,
                due_month: true,
                due_year: true,
                emi_amount: true,
                status: true,
                payslip_id: true,
              },
            },
          },
        });

        return finalData;
      },
      {
        timeout: 10000,
      }
    );

    return result;
  } catch (error) {
    console.error("Error updating loan request with EMI schedule:", error);
    throw new CustomError(`Error updating loan request: ${error.message}`, 500);
  }
};

// const deleteLoanRequest = async (id) => {
//   try {
//     await prisma.hrms_d_loan_request.delete({
//       where: { id: parseInt(id) },
//     });
//   } catch (error) {
//     throw new CustomError(`Error deleting loan request: ${error.message}`, 500);
//   }
// };

const deleteLoanRequest = async (id) => {
  try {
    await prisma.$transaction(async (tx) => {
      const loanId = parseInt(id);

      await tx.hrms_d_loan_emi_schedule.deleteMany({
        where: { loan_request_id: loanId },
      });

      await tx.hrms_d_loan_request.delete({
        where: { id: loanId },
      });
    });
  } catch (error) {
    console.error("Error deleting loan request and EMI schedule:", error);
    throw new CustomError(`Error deleting loan request: ${error.message}`, 500);
  }
};

const getAllLoanRequest = async (search, page, size, startDate, endDate) => {
  try {
    page = !page || page == 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size || 0;

    const filters = {};
    if (search) {
      filters.OR = [
        {
          loan_req_employee: {
            full_name: { contains: search.toLowerCase() },
          },
        },
        {
          loan_types: {
            loan_name: { contains: search.toLowerCase() },
          },
        },
        {
          status: { contains: search.toLowerCase() },
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

    const datas = await prisma.hrms_d_loan_request.findMany({
      where: filters,
      skip: skip,
      take: size,
      include: {
        loan_req_employee: {
          select: {
            full_name: true,
            id: true,
            employee_code: true,
            account_number: true,
          },
        },
        loan_types: {
          select: {
            loan_name: true,
            id: true,
          },
        },
        loan_req_currency: {
          select: {
            id: true,
            currency_code: true,
            currency_name: true,
          },
        },
      },
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
    });

    const totalCount = await prisma.hrms_d_loan_request.count({
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
    throw new CustomError("Error retrieving loan requests", 503);
  }
};

const updateLoanReqStatus = async (id, data) => {
  try {
    console.log("Loan Request ID: ", id);
    const loanReqId = parseInt(id);

    if (isNaN(loanReqId)) {
      throw new CustomError("Invalid loan req id", 400);
    }

    const existingLoanReq = await prisma.hrms_d_loan_request.findUnique({
      where: { id: loanReqId },
    });
    if (!existingLoanReq) {
      throw new CustomError(
        `Loan Request application with ID ${loanReqId} not found`,
        404
      );
    }
    const updateData = {
      status: data.status,
      updatedby: data.updatedby || 1,
      updatedate: new Date(),
    };
    if (data.status === "Approved") {
      updateData.status = data.status;
    } else if (data.status === "Rejected") {
      updateData.status = data.status;
    } else {
      updateData.status = data.status;
    }
    const updatedEntry = await prisma.hrms_d_goal_sheet_assignment.update({
      where: { id: goalSheetId },
      data: updateData,
    });
    return updatedEntry;
  } catch (error) {
    console.error("Error updating loan request status:", error);
    throw new CustomError(
      `Error updating loan request status: ${error.message}`,
      error.status || 500
    );
  }
};

module.exports = {
  createLoanRequest,
  findLoanRequestById,
  updateLoanRequest,
  deleteLoanRequest,
  getAllLoanRequest,
  updateLoanReqStatus,
};

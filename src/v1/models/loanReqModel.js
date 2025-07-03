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

// const updateLoanRequest = async (id, data) => {
//   try {
//     await errorNotExist("hrms_d_employee", data.employee_id, "Employee");

//     const updatedLoanRequest = await prisma.hrms_d_loan_request.update({
//       where: { id: parseInt(id) },
//       data: {
//         ...serializeData(data),
//         updatedby: data.updatedby || 1,
//         updatedate: new Date(),
//       },
//       include: {
//         loan_req_employee: {
//           select: {
//             full_name: true,
//             id: true,
//           },
//         },
//         loan_req_currency: {
//           select: {
//             id: true,
//             currency_code: true,
//             currency_name: true,
//           },
//         },
//         loan_types: {
//           select: {
//             loan_name: true,
//             id: true,
//           },
//         },
//       },
//     });
//     return updatedLoanRequest;
//   } catch (error) {
//     throw new CustomError(`Error updating loan request: ${error.message}`, 500);
//   }
// };

const updateLoanRequest = async (id, data) => {
  try {
    await errorNotExist("hrms_d_employee", data.employee_id, "Employee");

    const result = await prisma.$transaction(async (tx) => {
      const serialized = serializeData(data);

      // Step 1: Update the loan request
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

      // Step 2: Fetch existing EMI schedule for this loan
      const existingEmis = await tx.hrms_d_loan_emi_schedule.findMany({
        where: {
          loan_request_id: loanId,
          employee_id: employeeId,
        },
      });

      // Step 3: Filter out paid ones (status = "P")
      const paidEmis = existingEmis.filter((emi) => emi.status === "P");

      // Step 4: Insert new EMIs from frontend (excluding months already marked paid)
      const newEntries = emi_schedule.filter(
        (emi) =>
          !paidEmis.some(
            (p) => p.due_month === emi.due_month && p.due_year === emi.due_year
          )
      );

      if (newEntries.length > 0) {
        const emiData = newEntries.map((emi) => ({
          loan_request_id: loanId,
          employee_id: employeeId,
          due_month: emi.due_month,
          due_year: emi.due_year,
          emi_amount: Number(emi.emi_amount),
          status: emi.status || "U",
          payslip_id: emi.payslip_id ?? null,
          createdby: data.updatedby || 1,
          createdate: new Date(),
          log_inst: data.log_inst || 1,
        }));

        await tx.hrms_d_loan_emi_schedule.createMany({
          data: emiData,
        });
      }

      // Step 5: Return final response
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
    });

    return result;
  } catch (error) {
    console.error("Error updating loan request with EMI schedule:", error);
    throw new CustomError(`Error updating loan request: ${error.message}`, 500);
  }
};

const deleteLoanRequest = async (id) => {
  try {
    await prisma.hrms_d_loan_request.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    throw new CustomError(`Error deleting loan request: ${error.message}`, 500);
  }
};

// Get all loan requests
const getAllLoanRequest = async (search, page, size, startDate, endDate) => {
  try {
    page = !page || page == 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size || 0;

    const filters = {};
    // Handle search
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
    // const totalCount = await prisma.hrms_d_loan_request.count();
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

// const createOrUpdateLoanRequest = async (data) => {
//   const {
//     id,
//     employee_id,
//     amount,
//     emi_months,
//     emi_info = [],
//     createdby,
//     updatedby,
//     log_inst,
//   } = data;

//   try {
//     await errorNotExist("hrms_d_employee", employee_id, "Employee");

//     const result = await prisma.$transaction(async (tx) => {
//       let loanRequest;

//       if (id) {
//         loanRequest = await tx.hrms_d_loan_request.findUnique({
//           where: { id: Number(id) },
//           include: {
//             loan_emi_loan_request: true,
//           },
//         });

//         if (!loanRequest) throw new CustomError("Loan request not found", 404);

//         const allEMIs = loanRequest.loan_emi_loan_request;
//         const paidEMIs = allEMIs.filter((emi) => emi.status !== "U");
//         const unpaidEMIs = allEMIs.filter((emi) => emi.status === "U");

//         const paidCount = paidEMIs.length;
//         const existingTotal = allEMIs.length;

//         if (emi_months < paidCount) {
//           throw new CustomError(
//             `Cannot reduce EMI months below already paid (${paidCount})`,
//             400
//           );
//         }

//         const newRequiredEMIs = emi_months - existingTotal;

//         if (newRequiredEMIs > 0) {
//           const remainingAmount =
//             Number(amount) -
//             paidEMIs.reduce((sum, emi) => sum + Number(emi.emi_amount), 0);

//           const newEmiAmount = +(remainingAmount / newRequiredEMIs).toFixed(2);

//           const lastDueMonth = allEMIs
//             .map((e) => e.due_month)
//             .sort()
//             .pop(); // Last due month

//           const [lastYear, lastMonth] = lastDueMonth
//             ? lastDueMonth.split("-").map(Number)
//             : [new Date().getFullYear(), new Date().getMonth() + 1];

//           const emiEntries = [];

//           for (let i = 0; i < newRequiredEMIs; i++) {
//             const nextDate = new Date(lastYear, lastMonth + i, 1);
//             const dueMonth = `${nextDate.getFullYear()}-${String(
//               nextDate.getMonth() + 1
//             ).padStart(2, "0")}`;

//             emiEntries.push({
//               loan_request_id: loanRequest.id,
//               employee_id: employee_id,
//               due_month: dueMonth,
//               due_year: String(nextDate.getFullYear()),
//               emi_amount: newEmiAmount,
//               payslip_id: null,
//               status: "U",
//               createdate: new Date(),
//               createdby: updatedby || 1,
//               log_inst: log_inst || 1,
//             });
//           }

//           await tx.hrms_d_loan_emi_schedule.createMany({
//             data: emiEntries,
//           });
//         }

//         // Update loan request fields
//         await tx.hrms_d_loan_request.update({
//           where: { id: loanRequest.id },
//           data: {
//             ...serializeData(data),
//             updatedby: updatedby || 1,
//             updatedate: new Date(),
//           },
//         });
//       } else {
//         // ✅ Create new loan
//         loanRequest = await tx.hrms_d_loan_request.create({
//           data: {
//             ...serializeData(data),
//             createdby: createdby || 1,
//             createdate: new Date(),
//             log_inst: log_inst || 1,
//           },
//         });

//         const emiEntries = emi_info.map((emi) => ({
//           loan_request_id: loanRequest.id,
//           employee_id: employee_id,
//           due_month: emi.due_month,
//           due_year: emi.due_year || emi.due_month?.split("-")[0],
//           emi_amount: Number(emi.emi_amount),
//           payslip_id: emi.payslip_id ?? null,
//           status: emi.status || "U",
//           createdate: new Date(),
//           createdby: createdby || 1,
//           log_inst: log_inst || 1,
//         }));

//         await tx.hrms_d_loan_emi_schedule.createMany({
//           data: emiEntries,
//         });
//       }

//       const response = await tx.hrms_d_loan_request.findUnique({
//         where: { id: id || loanRequest.id },
//         include: {
//           loan_req_employee: {
//             select: { full_name: true, id: true },
//           },
//           loan_req_currency: {
//             select: {
//               id: true,
//               currency_code: true,
//               currency_name: true,
//             },
//           },
//           loan_types: {
//             select: { loan_name: true, id: true },
//           },
//           loan_emi_loan_request: {
//             select: {
//               id: true,
//               due_month: true,
//               due_year: true,
//               emi_amount: true,
//               status: true,
//               payslip_id: true,
//             },
//           },
//         },
//       });

//       return response;
//     });

//     return result;
//   } catch (error) {
//     console.error("Loan Request Error:", error);
//     throw new CustomError(`Loan Request Error: ${error.message}`, 500);
//   }
// };

module.exports = {
  createLoanRequest,
  findLoanRequestById,
  updateLoanRequest,
  deleteLoanRequest,
  getAllLoanRequest,
  updateLoanReqStatus,
  // createOrUpdateLoanRequest,
};

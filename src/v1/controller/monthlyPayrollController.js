const monthlyPayrollService = require("../services/monthlyPayrollService.js");
const CustomError = require("../../utils/CustomError.js");
const moment = require("moment");
const { success } = require("zod/v4");
const fs = require("fs");
const path = require("path");
const cleanupManager = require("../../utils/fileCleanupManager.js");
const { prisma } = require("../../utils/prismaProxy.js");

const {
  checkAlreadyDownloadedPayrolls,
  getDownloadStatistics,
  checkIndividualPayslipDownloaded,
  markIndividualPayslipAsPrinted,
} = require("../models/monthlyPayrollModel.js");
const {
  uploadToBackblazeWithValidation,
  deleteFromBackblaze,
} = require("../../utils/uploadBackblaze.js");
const monthlyPayrollQueue = require("../../utils/monthlyPayrollQueue.js");
const { v4: uuidv4 } = require("uuid");
const { getPrismaClient } = require("../../config/db.js");
const { generateEmailContent } = require("../../utils/emailTemplates.js");
const sendEmail = require("../../utils/mailer.js");

const createMonthlyPayroll = async (req, res, next) => {
  try {
    console.log("Incoming request body:", req.body);

    const data = {
      ...req.body,
      createdby: req.user.id,
      log_inst: req.user.log_inst,
    };
    const reqData = await monthlyPayrollService.createMonthlyPayroll(data);
    res.status(201).success("Monthly payroll created successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const findMonthlyPayroll = async (req, res, next) => {
  try {
    const reqData = await monthlyPayrollService.findMonthlyPayrollById(
      req.params.id
    );
    if (!reqData) throw new CustomError("Monthly payroll not found", 404);
    res.status(200).success(null, reqData);
  } catch (error) {
    next(error);
  }
};

const updateMonthlyPayroll = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      updatedby: req.user.id,
      log_inst: req.user.log_inst,
    };
    const reqData = await monthlyPayrollService.updateMonthlyPayroll(
      req.params.id,
      data
    );
    res.status(200).success("Monthly payroll updated successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const deleteMonthlyPayroll = async (req, res, next) => {
  try {
    await monthlyPayrollService.deleteMonthlyPayroll(req.params.id);
    res.status(200).success("Monthly payroll deleted successfully", null);
  } catch (error) {
    next(error);
  }
};

const getAllMonthlyPayroll = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate } = req.query;
    const data = await monthlyPayrollService.getAllMonthlyPayroll(
      search,
      Number(page),
      Number(size),
      startDate && moment(startDate),
      endDate && moment(endDate)
    );
    res.status(200).success(null, data);
  } catch (error) {
    next(error);
  }
};

const triggerMonthlyPayrollSP = async (req, res, next) => {
  try {
    const result = await monthlyPayrollService.callMonthlyPayrollSP(req.query);
    // console.log("Result", result);

    res.status(200).json({
      success: true,
      message: result.message,
      data: result.result,
    });
  } catch (error) {
    next(error);
  }
};

const downloadPayrollExcel = async (req, res, next) => {
  try {
    const { search, employee_id, payroll_month, payroll_year } = req.query;

    console.log("Excel download parameters:", {
      search,
      employee_id,
      payroll_month,
      payroll_year,
      user: req.user?.id,
    });

    const result = await monthlyPayrollService.downloadPayrollExcel(
      search,
      employee_id,
      payroll_month,
      payroll_year
    );

    console.log(`Excel file generated successfully: ${result.filename}`);
    console.log(
      `Total records: ${result.totalRecords}, Earnings: ${result.earningsCount}, Deductions: ${result.deductionsCount}`
    );

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${result.filename}"`
    );
    res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");
    res.setHeader("Cache-Control", "no-cache");

    res.sendFile(result.filePath, (err) => {
      if (err) {
        console.error("Error sending Excel file:", err);
        return next(new CustomError("Failed to send Excel file", 500));
      }

      console.log(`Excel file sent successfully: ${result.filename}`);

      // Schedule Excel file cleanup after 5 minutes using cleanup manager
      cleanupManager.scheduleCleanup(result.filePath, 300000, "Excel export");
    });
  } catch (error) {
    console.error("Excel download controller error:", error);

    next(error);
  }
};

const triggerMonthlyPayrollCalculationSP = async (req, res, next) => {
  try {
    const result =
      await monthlyPayrollService.triggerMonthlyPayrollCalculationSP(req.query);
    // console.log("Result", result);
    res.status(200).json({
      success: true,
      message: result.message,
      data: result.result,
    });
  } catch (error) {
    next(error);
  }
};

const getComponentNames = async (req, res, next) => {
  try {
    const data = await monthlyPayrollService.getComponentNames();

    res.status(200).success("Component names fetched successfully", data);
  } catch (error) {
    next(error);
  }
};

const createOrUpdateMonthlyPayroll = async (req, res, next) => {
  try {
    const rows = req.body;
    const user = req.user;
    console.log("Request body:", req.body);

    const result = await monthlyPayrollService.createOrUpdatePayrollBulk(
      rows,
      user
    );
    res.status(200).success("Monthly payroll processed successfully", result);
  } catch (error) {
    next(error);
  }
};

// const getGeneratedMonthlyPayroll = async (req, res, next) => {
//   try {
//     const {
//       page,
//       size,
//       search,
//       startDate,
//       endDate,
//       payroll_month,
//       payroll_year,
//     } = req.query;
//     const data = await monthlyPayrollService.getGeneratedMonthlyPayroll(
//       search,
//       Number(page),
//       Number(size),
//       startDate && moment(startDate),
//       endDate && moment(endDate),
//       payroll_month,
//       payroll_year
//     );
//     res.status(200).success(null, data);
//   } catch (error) {
//     next(error);
//   }
// };

const getGeneratedMonthlyPayroll = async (req, res, next) => {
  try {
    const { page, size, search, employee_id, payroll_month, payroll_year } =
      req.query;

    console.log("Filter parameters received:", {
      page,
      size,
      search,
      employee_id,
      payroll_month,
      payroll_year,
    });

    const data = await monthlyPayrollService.getGeneratedMonthlyPayroll(
      search,
      Number(page) || 1,
      Number(size) || 10,
      employee_id,
      payroll_month,
      payroll_year
    );

    res.status(200).success("Payroll data retrieved successfully", data);
  } catch (error) {
    console.error("Controller error:", error);
    next(error);
  }
};

// 1. without auto delete(made by me)
// const downloadPayslipPDF = async (req, res, next) => {
//   try {
//     console.log("Query Params:", req.query);

//     const { employee_id, payroll_month, payroll_year } = req.query;

//     if (!employee_id || !payroll_month || !payroll_year) {
//       throw new CustomError("Missing required parameters", 400);
//     }

//     const filePath = await monthlyPayrollService.downloadPayslipPDF(
//       employee_id,
//       payroll_month,
//       payroll_year
//     );

//     const fileBuffer = fs.readFileSync(filePath);
//     const originalName = path.basename(filePath);
//     const mimeType = "application/pdf";

//     const fileUrl = await uploadToBackblazeWithValidation(
//       fileBuffer,
//       originalName,
//       mimeType,
//       "payslips",
//       {
//         "b2-content-disposition": `inline; filename="${originalName}"`,
//       }
//     );

//     if (!/^https?:\/\//i.test(fileUrl)) {
//       throw new CustomError("Invalid file URL returned from Backblaze", 500);
//     }

//     fs.unlink(filePath, (err) => {
//       if (err) console.error("Error deleting temp file:", err);
//     });

//     res.json({ url: fileUrl });
//   } catch (error) {
//     next(error);
//   }
// };

// 2. with auto delete(made by me)
const downloadPayslipPDF = async (req, res, next) => {
  try {
    console.log("Query Params:", req.query);

    const {
      employee_id,
      payroll_month,
      payroll_year,
      force_download,
      isEmailEnabled,
    } = req.query;

    if (!employee_id || !payroll_month || !payroll_year) {
      throw new CustomError("Missing required parameters", 400);
    }

    const alreadyDownloaded = await checkIndividualPayslipDownloaded(
      employee_id,
      payroll_month,
      payroll_year,
      req.tenantDb
    );

    if (alreadyDownloaded && force_download !== "true") {
      console.log(
        `Payslip already downloaded: Employee ${employee_id}, ${payroll_month}/${payroll_year}`
      );

      return res.status(200).json({
        success: true,
        message: "This payslip has already been downloaded",
        data: {
          warning: true,
          needsConfirmation: true,
          alreadyDownloaded: {
            employee_id: alreadyDownloaded.employee_id,
            payroll_month: alreadyDownloaded.payroll_month,
            payroll_year: alreadyDownloaded.payroll_year,
            full_name: alreadyDownloaded.full_name,
            employee_code: alreadyDownloaded.employee_code,
            download_date: alreadyDownloaded.download_date,
            downloaded_by: alreadyDownloaded.downloaded_by,
          },
          downloadInfo: {
            employee_id,
            payroll_month,
            payroll_year,
          },
        },
      });
    }

    const filePath = await monthlyPayrollService.downloadPayslipPDF(
      employee_id,
      payroll_month,
      payroll_year
    );

    const fileBuffer = fs.readFileSync(filePath);
    const originalName = path.basename(filePath);
    const mimeType = "application/pdf";

    const fileUrl = await uploadToBackblazeWithValidation(
      fileBuffer,
      originalName,
      mimeType,
      "payslips",
      {
        "b2-content-disposition": `inline; filename="${originalName}"`,
      }
    );

    if (!/^https?:\/\//i.test(fileUrl)) {
      throw new CustomError("Invalid file URL returned from Backblaze", 500);
    }
    console.log("Email sending flag:", isEmailEnabled);
    if (isEmailEnabled == "true") {
      const monthNames = [
        "",
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      const company = await prisma.hrms_d_default_configurations.findFirst({
        select: { company_name: true },
      });
      console.log("Company fetched for email:", company);
      const company_name = company?.company_name || "HRMS System";
      // const employee = reqData?.payslip_employee;
      const emailContent = await generateEmailContent("payslip_email", {
        employee_name: alreadyDownloaded.full_name,
        month: monthNames?.[Number(payroll_month)],
        years: String(payroll_year),
        company_name: company_name,
      });
      console.log("Email content generated:", emailContent);
      await sendEmail({
        // to: "shreyansh.tripathi@ampleserv.com",
        to: alreadyDownloaded.email,
        subject: emailContent.subject,
        html: emailContent.body,
        log_inst: alreadyDownloaded?.log_inst || 1,
        attachments: [
          {
            filename: originalName,
            content: fileBuffer,
            contentType: "application/pdf",
          },
        ],
      });
    }
    try {
      await markIndividualPayslipAsPrinted(
        employee_id,
        payroll_month,
        payroll_year,
        req.user.id,
        req.tenantDb
      );

      console.log(
        `Marked payslip as downloaded: Employee ${employee_id}, ${payroll_month}/${payroll_year}`
      );
    } catch (markError) {
      console.error("Error marking payslip as downloaded:", markError);
    }

    fs.unlink(filePath, (err) => {
      if (err) console.error("Error deleting temp file:", err);
    });

    res.json({ url: fileUrl });

    setTimeout(async () => {
      try {
        await deleteFromBackblaze(fileUrl);
        console.log(`File auto-deleted from Backblaze after 10 seconds`);
      } catch (error) {
        console.error("Error auto-deleting file from Backblaze:", error);
      }
    }, 10000);
  } catch (error) {
    next(error);
  }
};

const bulkDownloadMonthlyPayroll = async (req, res, next) => {
  try {
    const {
      employee_id_from,
      employee_id_to,
      employee_ids,
      payslip_ids,
      payroll_month_from,
      payroll_month_to,
      payroll_year_from,
      payroll_year_to,
      status,
      force_download,
    } = req.query;

    const filters = {};
    const advancedFilters = {};

    if (employee_ids) {
      let employeeIdArray;
      try {
        employeeIdArray = JSON.parse(employee_ids);
        if (!Array.isArray(employeeIdArray)) {
          throw new Error("employee_ids must be an array");
        }
      } catch (e) {
        employeeIdArray = employee_ids
          .split(",")
          .map((id) => id.trim())
          .filter((id) => id);
      }

      const validEmployeeIds = employeeIdArray
        .map((id) => Number(id))
        .filter((id) => !isNaN(id) && id > 0);

      if (validEmployeeIds.length > 0) {
        filters.employee_ids = validEmployeeIds;
        console.log(`Employee IDs Array: [${validEmployeeIds.join(", ")}]`);
      }
    } else if (payslip_ids) {
      let payslipIdArray;
      try {
        payslipIdArray = JSON.parse(payslip_ids);
        if (!Array.isArray(payslipIdArray)) {
          throw new Error("payslip_ids must be an array");
        }
      } catch (e) {
        payslipIdArray = payslip_ids
          .split(",")
          .map((id) => id.trim())
          .filter((id) => id);
      }

      const validPayslipIds = payslipIdArray
        .map((id) => Number(id))
        .filter((id) => !isNaN(id) && id > 0);

      if (validPayslipIds.length > 0) {
        filters.payslip_ids = validPayslipIds;
        console.log(`Payslip IDs Array: [${validPayslipIds.join(", ")}]`);
      }
    } else if (employee_id_from && employee_id_to) {
      const minId = Number(employee_id_from);
      const maxId = Number(employee_id_to);

      filters.employee_id = {
        gte: Math.min(minId, maxId),
        lte: Math.max(minId, maxId),
      };

      console.log(
        `Employee Range: ${Math.min(minId, maxId)} to ${Math.max(minId, maxId)}`
      );
    } else if (employee_id_from) {
      filters.employee_id = { gte: Number(employee_id_from) };
      console.log(`Employee From: ${Number(employee_id_from)}`);
    } else if (employee_id_to) {
      filters.employee_id = { lte: Number(employee_id_to) };
      console.log(`Employee To: ${Number(employee_id_to)}`);
    }

    if (status) {
      filters.status = status;
    }

    if (payroll_month_from && payroll_month_to) {
      const minMonth = Number(payroll_month_from);
      const maxMonth = Number(payroll_month_to);

      filters.payroll_month = {
        gte: Math.min(minMonth, maxMonth),
        lte: Math.max(minMonth, maxMonth),
      };

      console.log(
        `Payroll Month Range: ${Math.min(minMonth, maxMonth)} to ${Math.max(
          minMonth,
          maxMonth
        )}`
      );
    } else if (payroll_month_from) {
      filters.payroll_month = { gte: Number(payroll_month_from) };
    } else if (payroll_month_to) {
      filters.payroll_month = { lte: Number(payroll_month_to) };
    }

    if (payroll_year_from && payroll_year_to) {
      const minYear = Number(payroll_year_from);
      const maxYear = Number(payroll_year_to);

      filters.payroll_year = {
        gte: Math.min(minYear, maxYear),
        lte: Math.max(minYear, maxYear),
      };

      console.log(
        `Payroll Year Range: ${Math.min(minYear, maxYear)} to ${Math.max(
          minYear,
          maxYear
        )}`
      );
    } else if (payroll_year_from) {
      filters.payroll_year = { gte: Number(payroll_year_from) };
    } else if (payroll_year_to) {
      filters.payroll_year = { lte: Number(payroll_year_to) };
    }

    console.log("Validating monthly payroll records exist...");

    let dbClient;
    if (req.tenantDb) {
      dbClient = getPrismaClient(req.tenantDb);
      console.log("Using tenant DB:", req.tenantDb);
    } else {
      dbClient = getPrismaClient();
      console.log("Using default DB");
    }

    const validationWhere = {
      ...filters,
    };

    if (Object.keys(advancedFilters).length > 0) {
      validationWhere.hrms_monthly_payroll_employee = advancedFilters;
    }

    console.log("Validation where:", validationWhere);

    let whereConditions = ["1=1"];

    if (validationWhere.payslip_ids) {
      const validIds = validationWhere.payslip_ids.filter(
        (id) => id && !isNaN(id)
      );
      if (validIds.length > 0) {
        const idList = validIds.map((id) => Number(id)).join(", ");
        whereConditions.push(`mp.id IN (${idList})`);
        console.log(`Payslip IDs filter: ${idList}`);
      }
    }

    if (validationWhere.employee_ids) {
      const validIds = validationWhere.employee_ids.filter(
        (id) => id && !isNaN(id)
      );
      if (validIds.length > 0) {
        const idList = validIds.map((id) => Number(id)).join(", ");
        whereConditions.push(`mp.employee_id IN (${idList})`);
        console.log(`Employee IDs filter: ${idList}`);
      }
    }

    if (validationWhere.employee_id) {
      if (validationWhere.employee_id.gte && validationWhere.employee_id.lte) {
        whereConditions.push(
          `mp.employee_id BETWEEN ${validationWhere.employee_id.gte} AND ${validationWhere.employee_id.lte}`
        );
      } else if (validationWhere.employee_id.gte) {
        whereConditions.push(
          `mp.employee_id >= ${validationWhere.employee_id.gte}`
        );
      } else if (validationWhere.employee_id.lte) {
        whereConditions.push(
          `mp.employee_id <= ${validationWhere.employee_id.lte}`
        );
      }
    }

    if (validationWhere.payroll_month) {
      if (
        validationWhere.payroll_month.gte &&
        validationWhere.payroll_month.lte
      ) {
        whereConditions.push(
          `mp.payroll_month BETWEEN ${validationWhere.payroll_month.gte} AND ${validationWhere.payroll_month.lte}`
        );
      } else if (validationWhere.payroll_month.gte) {
        whereConditions.push(
          `mp.payroll_month >= ${validationWhere.payroll_month.gte}`
        );
      } else if (validationWhere.payroll_month.lte) {
        whereConditions.push(
          `mp.payroll_month <= ${validationWhere.payroll_month.lte}`
        );
      }
    }

    if (validationWhere.payroll_year) {
      if (
        validationWhere.payroll_year.gte &&
        validationWhere.payroll_year.lte
      ) {
        whereConditions.push(
          `mp.payroll_year BETWEEN ${validationWhere.payroll_year.gte} AND ${validationWhere.payroll_year.lte}`
        );
      } else if (validationWhere.payroll_year.gte) {
        whereConditions.push(
          `mp.payroll_year >= ${validationWhere.payroll_year.gte}`
        );
      } else if (validationWhere.payroll_year.lte) {
        whereConditions.push(
          `mp.payroll_year <= ${validationWhere.payroll_year.lte}`
        );
      }
    }

    if (validationWhere.status) {
      whereConditions.push(`mp.status = '${validationWhere.status}'`);
    }

    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(" AND ")}`
        : "";

    console.log("Final WHERE clause:", whereClause);

    const countQuery = `
      SELECT COUNT(*) as total
      FROM hrms_d_monthly_payroll_processing mp
      ${whereClause}
    `;

    console.log("Count query:", countQuery);
    const payrollCount = await dbClient.$queryRawUnsafe(countQuery);

    console.log("Payroll count:", payrollCount);

    if (payrollCount === 0) {
      throw new CustomError(
        "No monthly payroll records found matching the provided filters",
        404
      );
    }

    console.log(
      `Found ${payrollCount} monthly payroll record(s) matching filters`
    );

    console.log(
      "bulkDownloadMonthlyPayroll - Checking for already downloaded payrolls..."
    );
    console.log(
      "bulkDownloadMonthlyPayroll - Filters:",
      JSON.stringify(filters, null, 2)
    );
    console.log("bulkDownloadMonthlyPayroll - Tenant DB:", req.tenantDb);

    const alreadyDownloaded = await checkAlreadyDownloadedPayrolls(
      filters,
      req.tenantDb
    );

    console.log(
      `bulkDownloadMonthlyPayroll - Found ${alreadyDownloaded.length} already downloaded payroll records`
    );

    if (alreadyDownloaded.length > 0 && req.query.force_download !== "true") {
      console.log(
        `Found ${alreadyDownloaded.length} already downloaded payroll records`
      );

      const stats = await getDownloadStatistics(filters, req.tenantDb);

      return res.status(200).json({
        success: true,
        message: "Some payroll records have already been downloaded",
        data: {
          warning: true,
          alreadyDownloadedCount: alreadyDownloaded.length,
          totalRecords: payrollCount,
          downloadedRecords: stats.downloaded_records,
          notDownloadedRecords: stats.not_downloaded_records,
          alreadyDownloaded: alreadyDownloaded.slice(0, 10),
          needsConfirmation: true,
          appliedFilters: {
            payslips: payslip_ids
              ? `Array: [${filters.payslip_ids.join(", ")}]`
              : employee_ids
              ? `Array: [${filters.employee_ids.join(", ")}]`
              : employee_id_from || employee_id_to
              ? `${employee_id_from || "Any"} to ${employee_id_to || "Any"}`
              : "All",
            payrollMonths:
              payroll_month_from || payroll_month_to
                ? `${payroll_month_from || "Any"} to ${
                    payroll_month_to || "Any"
                  }`
                : "All",
            payrollYears:
              payroll_year_from || payroll_year_to
                ? `${payroll_year_from || "Any"} to ${payroll_year_to || "Any"}`
                : "All",
            status: status || "All",
          },
        },
      });
    }

    const jobId = uuidv4();

    const job = await monthlyPayrollQueue.add({
      userId: req.user.id,
      tenantDb: req.tenantDb,
      filters: filters,
      jobId: jobId,
    });

    console.log(`Bulk monthly payroll download job created: ${job.id}`);

    res
      .status(202)
      .success("Bulk download started. Use job ID to check progress.", {
        jobId: job.id,
        statusUrl: `/api/monthly-payroll/bulk-download/status/${job.id}`,
        totalPayrollRecords: payrollCount,
        appliedFilters: {
          payslips: payslip_ids
            ? `Array: [${filters.payslip_ids.join(", ")}]`
            : employee_ids
            ? `Array: [${filters.employee_ids.join(", ")}]`
            : employee_id_from || employee_id_to
            ? `${employee_id_from || "Any"} to ${employee_id_to || "Any"}`
            : "All",
          payrollMonths:
            payroll_month_from || payroll_month_to
              ? `${payroll_month_from || "Any"} to ${payroll_month_to || "Any"}`
              : "All",
          payrollYears:
            payroll_year_from || payroll_year_to
              ? `${payroll_year_from || "Any"} to ${payroll_year_to || "Any"}`
              : "All",
          status: status || "All",
        },
      });
  } catch (error) {
    next(error);
  }
};

const checkBulkDownloadStatus = async (req, res, next) => {
  try {
    const jobId = req.params.jobId;

    const job = await monthlyPayrollQueue.getJob(jobId);

    if (!job) {
      throw new CustomError("Job not found", 404);
    }

    const state = await job.getState();
    const progress = job.progress();
    const result = job.returnvalue;

    res.status(200).success(null, {
      jobId: job.id,
      status: state,
      progress: progress,
      result: result,
    });
  } catch (error) {
    next(error);
  }
};

const downloadBulkMonthlyPayroll = async (req, res, next) => {
  try {
    const jobId = req.params.jobId;

    const job = await monthlyPayrollQueue.getJob(jobId);

    if (!job) {
      throw new CustomError("Job not found", 404);
    }

    const state = await job.getState();

    if (state !== "completed") {
      throw new CustomError(
        `Job is ${state}. Please wait for completion.`,
        400
      );
    }

    const result = job.returnvalue;

    if (!result || !result.zipPath) {
      throw new CustomError("Download file not found", 404);
    }

    if (!fs.existsSync(result.zipPath)) {
      throw new CustomError("File has been deleted or expired", 410);
    }

    res.download(result.zipPath, result.fileName, (err) => {
      if (err) {
        console.error("Error sending file:", err);
        next(err);
      }

      cleanupManager.scheduleCleanup(
        result.zipPath,
        300000,
        "Bulk download ZIP"
      );
    });
  } catch (error) {
    next(error);
  }
};

const stopBulkDownloadJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: "Job ID is required",
      });
    }

    console.log(`Attempting to stop job: ${jobId}`);

    const jobDetails = await monthlyPayrollQueue.getJobDetails(jobId);

    if (!jobDetails) {
      return res.status(404).json({
        success: false,
        message: `Job ${jobId} not found`,
        jobId: jobId,
      });
    }

    console.log(`Job ${jobId} state: ${jobDetails.state}`);

    try {
      const result = await monthlyPayrollQueue.removeJob(jobId);

      if (result) {
        return res.status(200).json({
          success: true,
          message: `Job ${jobId} has been stopped (was in ${jobDetails.state} state)`,
          jobId: jobId,
          previousState: jobDetails.state,
        });
      } else {
        return res.status(400).json({
          success: false,
          message: `Could not stop job ${jobId}`,
          jobId: jobId,
          state: jobDetails.state,
        });
      }
    } catch (removeError) {
      console.log(`Job ${jobId} removal had issues, but cleanup attempted`);
      return res.status(200).json({
        success: true,
        message: `Job ${jobId} cleanup completed (was in ${jobDetails.state} state)`,
        jobId: jobId,
        note: "Job may have already finished",
      });
    }
  } catch (error) {
    console.error("Error stopping job:", error);
    res.status(500).json({
      success: false,
      message: "Error stopping job",
      error: error.message,
    });
  }
};

module.exports = {
  createMonthlyPayroll,
  findMonthlyPayroll,
  updateMonthlyPayroll,
  deleteMonthlyPayroll,
  getAllMonthlyPayroll,
  triggerMonthlyPayrollSP,
  getComponentNames,
  triggerMonthlyPayrollCalculationSP,
  createOrUpdateMonthlyPayroll,
  getGeneratedMonthlyPayroll,
  downloadPayslipPDF,
  downloadPayrollExcel,
  bulkDownloadMonthlyPayroll,
  checkBulkDownloadStatus,
  downloadBulkMonthlyPayroll,
  stopBulkDownloadJob,
};

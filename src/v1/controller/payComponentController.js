const payComponentService = require("../services/payComponentService");
const payComponentModel = require("../models/payComponentModel");
const payRollReportModel = require("../models/payRollReportModal");
const defaultConfigurationModel = require("../models/defaultConfigurationModel");
const CustomError = require("../../utils/CustomError");
const moment = require("moment");
const path = require("path");
const fs = require("fs");

const createPayComponent = async (req, res, next) => {
  try {
    const createdBy = req.user.employee_id;
    let departmentData = { ...req.body };
    const department = await payComponentService.createPayComponent(
      departmentData,
      createdBy,
    );
    res.status(201).success("Pay component created successfully", department);
  } catch (error) {
    next(error);
  }
};

const findPayComponentById = async (req, res, next) => {
  try {
    const department = await payComponentService.findPayComponentById(
      req.params.id,
    );
    if (!department) throw new CustomError("Pay component not found", 404);

    res.status(200).success(null, department);
  } catch (error) {
    next(error);
  }
};

const updatePayComponent = async (req, res, next) => {
  try {
    let departmentData = { ...req.body };
    const department = await payComponentService.updatePayComponent(
      req.params.id,
      departmentData,
    );
    res.status(200).success("Pay component updated successfully", department);
  } catch (error) {
    next(error);
  }
};

const updatePayOneTimeForColumnComponent = async (req, res, next) => {
  try {
    const result =
      await payComponentService.updatePayOneTimeForColumnComponent();
    res.status(200).json({
      success: true,
      message: "All pay components updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const deletePayComponent = async (req, res, next) => {
  try {
    await payComponentService.deletePayComponent(req.params.id);
    res.status(200).success("Pay component deleted successfully", null);
  } catch (error) {
    next(error);
  }
};

const getAllPayComponent = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate, is_active, is_advance } =
      req.query;
    const departments = await payComponentService.getAllPayComponent(
      Number(page),
      Number(size),
      search,
      startDate && moment(startDate),
      endDate && moment(endDate),
      is_active,
      is_advance,
    );
    res.status(200).success(null, departments);
  } catch (error) {
    next(error);
  }
};

const getPayComponentOptions = async (req, res, next) => {
  try {
    const {
      is_advance: isAdvance,
      is_overtime_related: isOvertimeRelated,
      is_loan,
    } = req.query;
    const payComponent = await payComponentService.getPayComponentOptions(
      isAdvance,
      isOvertimeRelated,
      is_loan,
    );
    res.status(200).success(null, payComponent);
  } catch (error) {
    next(error);
  }
};

const generateSDLReport = async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;
    if (!fromDate || !toDate) {
      return res.status(400).json({
        success: false,
        message: "fromDate and toDate are required",
      });
    }
    console.log("SDL Report - Request received:", { fromDate, toDate });
    const reportData = await payComponentModel.getSDLReportData(
      fromDate,
      toDate,
    );

    const companySettings = await payComponentModel.getCompanySettings();

    const fileName = `SDL_Report_${fromDate}_to_${toDate}.pdf`;
    const filePath = path.join(
      process.cwd(),
      "public",
      "reports",
      "sdl",
      fileName,
    );

    const pdfPath = await payComponentModel.generateSDLReportPDF(
      reportData,
      companySettings,
      filePath,
      fromDate,
      toDate,
    );

    console.log("SDL Report - PDF generated successfully:", pdfPath);

    res.download(pdfPath, fileName, (err) => {
      if (err) {
        console.error("SDL Report - Error downloading file:", err);
        return res.status(500).json({
          success: false,
          message: "Error generating SDL report",
        });
      }
      console.log("SDL Report - File downloaded successfully");
    });

    setTimeout(
      () => {
        try {
          if (fs.existsSync(pdfPath)) {
            fs.unlinkSync(pdfPath);
            console.log("SDL Report - PDF file auto-cleaned:", pdfPath);
          }
        } catch (error) {
          console.error("SDL Report - Error auto-cleaning file:", error);
        }
      },
      5 * 60 * 1000,
    ); // 5 minutes
  } catch (error) {
    console.error("SDL Report - Controller error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error generating SDL report",
    });
  }
};

const generateP10Report = async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;

    if (!fromDate || !toDate) {
      return res.status(400).json({
        success: false,
        message: "fromDate and toDate are required",
      });
    }

    console.log("P10 Report - Request received:", { fromDate, toDate });

    const reportData = await payComponentModel.getP10ReportData(
      fromDate,
      toDate,
    );

    const companySettings = await payComponentModel.getCompanySettings();

    const fileName = `P10_Report_${fromDate}_to_${toDate}.pdf`;
    const filePath = path.join(
      process.cwd(),
      "public",
      "reports",
      "p10",
      fileName,
    );

    const pdfPath = await payComponentModel.generateP10ReportPDF(
      reportData,
      companySettings,
      filePath,
      fromDate,
      toDate,
    );

    console.log("P10 Report - PDF generated successfully:", pdfPath);

    res.download(pdfPath, fileName, (err) => {
      if (err) {
        console.error("P10 Report - Error downloading file:", err);
        return res.status(500).json({
          success: false,
          message: "Error generating P10 report",
        });
      }
      console.log("P10 Report - File downloaded successfully");
    });

    setTimeout(
      () => {
        try {
          if (fs.existsSync(pdfPath)) {
            fs.unlinkSync(pdfPath);
            console.log("P10 Report - PDF file auto-cleaned:", pdfPath);
          }
        } catch (error) {
          console.error("P10 Report - Error auto-cleaning file:", error);
        }
      },
      5 * 60 * 1000,
    );
  } catch (error) {
    console.error("P10 Report - Controller error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error generating P10 report",
    });
  }
};

const generateP09Report = async (req, res, next) => {
  try {
    const { fromDate, toDate } = req.query;

    if (!fromDate || !toDate) {
      throw new CustomError("FromDate and ToDate are required", 400);
    }

    const reportData = await payComponentModel.getP09ReportData(
      fromDate,
      toDate,
    );

    const companySettings = await payComponentModel.getCompanySettings();

    const fileName = `P09_Report_${fromDate}_to_${toDate}_${Date.now()}.pdf`;
    const filePath = path.join(__dirname, "../../../temp", fileName);

    await payComponentModel.generateP09ReportPDF(
      reportData,
      companySettings,
      filePath,
      fromDate,
      toDate,
    );

    const pdfBuffer = fs.readFileSync(filePath);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader("Content-Length", pdfBuffer.length);

    res.send(pdfBuffer);

    setTimeout(() => {
      try {
        fs.unlinkSync(filePath);
      } catch (error) {
        console.error("Error cleaning up temporary file:", error);
      }
    }, 5000);
  } catch (error) {
    next(error);
  }
};
const generatePayRollSummaryReport = async (req, res, next) => {
  try {
    const { fromDate, toDate } = req.query;

    // if (!fromDate || !toDate) {
    //   throw new CustomError("FromDate and ToDate are required", 400);
    // }

    const reportData = await payRollReportModel.generatePayRollSummaryReport(
      fromDate,
      toDate,
    );

    const companySettings = await payComponentModel.getCompanySettings();

    const fileName = `P09_Report_${fromDate}_to_${toDate}_${Date.now()}.pdf`;
    const filePath = path.join(__dirname, "../../../temp", fileName);

    await payRollReportModel.generatePayRollSummaryReportPDF(
      reportData,
      companySettings,
      filePath,
      fromDate,
      toDate,
    );

    const pdfBuffer = fs.readFileSync(filePath);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader("Content-Length", pdfBuffer.length);

    res.send(pdfBuffer);

    setTimeout(() => {
      try {
        fs.unlinkSync(filePath);
      } catch (error) {
        console.error("Error cleaning up temporary file:", error);
      }
    }, 5000);
  } catch (error) {
    next(error);
  }
};

const generateNSSFReport = async (req, res) => {
  try {
    const { paymonth, payyear } = req.query;

    if (!paymonth || !payyear) {
      return res.status(400).json({
        success: false,
        message: "paymonth and payyear are required",
      });
    }

    console.log("NSSF Report - Request received:", { paymonth, payyear });

    const reportData = await payComponentModel.getNSSFReportData(
      paymonth,
      payyear,
    );

    const fileName = `NSSF_Report_${paymonth}_${payyear}.pdf`;
    const filePath = path.join(
      process.cwd(),
      "public",
      "reports",
      "nssf",
      fileName,
    );

    const generatedPath = await payComponentModel.generateNSSFReportPDF(
      reportData,
      filePath,
      paymonth,
      payyear,
    );

    console.log("NSSF Report - PDF generated successfully:", generatedPath);

    res.download(generatedPath, fileName, (err) => {
      if (err) {
        console.error("NSSF Report - Error downloading file:", err);
        return res.status(500).json({
          success: false,
          message: "Error generating NSSF report",
        });
      }
      console.log("NSSF Report - File downloaded successfully");
    });

    setTimeout(
      () => {
        try {
          if (fs.existsSync(generatedPath)) {
            fs.unlinkSync(generatedPath);
            console.log("NSSF Report - PDF file auto-cleaned:", generatedPath);
          }
        } catch (error) {
          console.error("NSSF Report - Error auto-cleaning file:", error);
        }
      },
      5 * 60 * 1000,
    );
  } catch (error) {
    console.error("NSSF Report - Controller error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error generating NSSF report",
    });
  }
};

const generateWCFReport = async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;

    if (!fromDate || !toDate) {
      return res.status(400).json({
        success: false,
        message: "fromDate and toDate are required",
      });
    }

    console.log("WCF Report - Request received:", { fromDate, toDate });

    const reportData = await payComponentModel.getWCFReportData(
      fromDate,
      toDate,
    );

    const fileName = `WCF_Report_${fromDate}_to_${toDate}.pdf`;
    const filePath = path.join(
      process.cwd(),
      "public",
      "reports",
      "wcf",
      fileName,
    );

    const generatedPath = await payComponentModel.generateWCFReportPDF(
      reportData,
      filePath,
      fromDate,
      toDate,
    );

    console.log("WCF Report - PDF generated successfully:", generatedPath);

    res.download(generatedPath, fileName, (err) => {
      if (err) {
        console.error("WCF Report - Error downloading file:", err);
        return res.status(500).json({
          success: false,
          message: "Error generating WCF report",
        });
      }
      console.log("WCF Report - File downloaded successfully");
    });

    setTimeout(
      () => {
        try {
          if (fs.existsSync(generatedPath)) {
            fs.unlinkSync(generatedPath);
            console.log("WCF Report - PDF file auto-cleaned:", generatedPath);
          }
        } catch (error) {
          console.error("WCF Report - Error auto-cleaning file:", error);
        }
      },
      5 * 60 * 1000,
    );
  } catch (error) {
    console.error("WCF Report - Controller error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error generating WCF report",
    });
  }
};

const generatePayrollSummaryReport = async (req, res, next) => {
  try {
    const { paymonth, payyear } = req.query;

    if (!paymonth || !payyear) {
      throw new CustomError("Paymonth and Payyear are required", 400);
    }

    console.log("Payroll Summary Report - Request received:", {
      paymonth,
      payyear,
    });

    const companyConfigResult =
      await defaultConfigurationModel.getAllDefaultConfiguration();
    const companySettings = companyConfigResult?.data || {};

    const reportData = await payRollReportModel.generatePayRollSummaryReport(
      parseInt(paymonth),
      parseInt(payyear),
    );

    const fileName = `Payroll_Summary_Report_${paymonth}_${payyear}_${Date.now()}.pdf`;
    const filePath = path.join(__dirname, "../../../temp", fileName);

    await payRollReportModel.generatePayrollSummaryReportPDF(
      reportData,
      companySettings,
      filePath,
      parseInt(paymonth),
      parseInt(payyear),
    );

    const pdfBuffer = fs.readFileSync(filePath);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader("Content-Length", pdfBuffer.length);

    res.send(pdfBuffer);

    setTimeout(
      () => {
        try {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(
              "Payroll Summary Report - PDF file auto-cleaned:",
              filePath,
            );
          }
        } catch (error) {
          console.error(
            "Payroll Summary Report - Error auto-cleaning file:",
            error,
          );
        }
      },
      5 * 60 * 1000,
    ); // 5 minutes
  } catch (error) {
    console.error("Payroll Summary Report - Controller error:", error);
    next(error);
  }
};

module.exports = {
  createPayComponent,
  findPayComponentById,
  updatePayComponent,
  deletePayComponent,
  getAllPayComponent,
  getPayComponentOptions,
  updatePayOneTimeForColumnComponent,
  generatePayRollSummaryReport,
  generateP09Report,
  generateSDLReport,
  generateP10Report,
  generateNSSFReport,
  generateWCFReport,
  generatePayrollSummaryReport,
};

const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const { errorNotExist } = require("../../Comman/errorNotExist");
const { createRequest } = require("./requestsModel");

const prisma = new PrismaClient();

const serializeData = (data) => {
  return {
    employee_id: Number(data.employee_id) || null,
    review_period: data.review_period || "",
    rating: parseFloat(data.rating) || 0,
    reviewer_comments: data.reviewer_comments || "",
    status: data.status || "P",
    appraisal_cycle_id: Number(data.appraisal_cycle_id) || null,
    appraisal_template_id: Number(data.appraisal_template_id) || null,
    reviewer_id: Number(data.reviewer_id) || null,
    hr_reviewer_id: Number(data.hr_reviewer_id) || null,
    review_start_date: data.review_start_date
      ? new Date(data.review_start_date)
      : null,
    review_end_date: data.review_end_date
      ? new Date(data.review_end_date)
      : null,
    final_score: data.final_score ? Number(data.final_score) : null,
    overall_remarks: data.overall_remarks || "",
    effective_date: data.effective_date ? new Date(data.effective_date) : null,
    review_date: data.review_date ? new Date(data.review_date) : null,
    next_review_date: data.next_review_date
      ? new Date(data.next_review_date)
      : null,
  };
};

const createAppraisalEntry = async (data) => {
  try {
    await errorNotExist("hrms_d_employee", data.employee_id, "Employee");
    const reqData = await prisma.hrms_d_appraisal.create({
      data: {
        ...serializeData(data),
        createdby: data.createdby || 1,
        createdate: new Date(),
        log_inst: data.log_inst || 1,
      },
      include: {
        appraisal_employee: {
          select: {
            full_name: true,
            id: true,
          },
        },
      },
    });
    await createRequest({
      requester_id: reqData.employee_id,
      request_type: "appraisal_review",
      reference_id: reqData.id,
      createdby: data.createdby || 1,
      log_inst: data.log_inst || 1,
    });
    return reqData;
  } catch (error) {
    console.error("Error creating appraisal entry:", error);
    throw new CustomError(
      `Error creating appraisal entry: ${error.message}`,
      500
    );
  }
};

const findAppraisalEntryById = async (id) => {
  try {
    const reqData = await prisma.hrms_d_appraisal.findUnique({
      where: { id: parseInt(id) },
      include: {
        appraisal_employee: {
          select: {
            full_name: true,
            id: true,
          },
        },
      },
    });
    if (!reqData) {
      throw new CustomError("appraisal entry not found", 404);
    }
    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error finding appraisal entry by ID: ${error.message}`,
      503
    );
  }
};

const updateAppraisalEntry = async (id, data) => {
  try {
    await errorNotExist("hrms_d_employee", data.employee_id, "Employee");
    const updatedAppraisalEntry = await prisma.hrms_d_appraisal.update({
      where: { id: parseInt(id) },
      data: {
        ...serializeData(data),
        updatedby: data.updatedby || 1,
        updatedate: new Date(),
      },
      include: {
        appraisal_employee: {
          select: {
            full_name: true,
            id: true,
          },
        },
      },
    });
    return updatedAppraisalEntry;
  } catch (error) {
    throw new CustomError(
      `Error updating appraisal entry: ${error.message}`,
      500
    );
  }
};

const deleteAppraisalEntry = async (id) => {
  try {
    await prisma.hrms_d_appraisal.delete({
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

const getAllAppraisalEntry = async (search, page, size, startDate, endDate) => {
  try {
    page = !page || page == 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size || 0;

    const filters = {};
    if (search) {
      filters.OR = [
        {
          appraisal_employee: {
            full_name: { contains: search.toLowerCase() },
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

    const datas = await prisma.hrms_d_appraisal.findMany({
      where: filters,
      skip: skip,
      take: size,
      include: {
        appraisal_employee: {
          select: {
            full_name: true,
            id: true,
          },
        },
      },
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
    });

    const totalCount = await prisma.hrms_d_appraisal.count({
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
    throw new CustomError("Error retrieving appraisal entries", 503);
  }
};

const getAppraisalForPDF = async (id) => {
  try {
    if (!id) {
      throw new CustomError("Appraisal ID is required", 400);
    }

    const appraisal = await prisma.hrms_d_appraisal.findUnique({
      where: { id: parseInt(id) },
      include: {
        appraisal_employee: {
          select: {
            id: true,
            full_name: true,
            employee_code: true,
            email: true,
            department_id: true,
            designation_id: true,
            hrms_employee_department: {
              select: {
                id: true,
                department_name: true,
              },
            },
            hrms_employee_designation: {
              select: {
                id: true,
                designation_name: true,
              },
            },
          },
        },
      },
    });

    if (!appraisal) {
      throw new CustomError("Appraisal not found", 404);
    }

    const defaultConfig = await prisma.hrms_d_default_configurations.findFirst({
      select: {
        company_logo: true,
        company_name: true,
        company_signature: true,
        street_address: true,
        city: true,
        state: true,
        country: true,
        phone_number: true,
        website: true,
      },
    });

    console.log("Company Logo:", defaultConfig?.company_logo);
    console.log("Company Signature:", defaultConfig?.company_signature);

    let companyLogoBase64 = "";
    let companySignatureBase64 = "";

    if (defaultConfig?.company_logo) {
      try {
        const fetch = require("node-fetch");
        const logoResponse = await fetch(defaultConfig.company_logo);
        const logoBuffer = await logoResponse.buffer();
        const logoBase64 = logoBuffer.toString("base64");
        const logoMimeType =
          logoResponse.headers.get("content-type") || "image/png";
        companyLogoBase64 = `data:${logoMimeType};base64,${logoBase64}`;
        console.log("Logo converted to base64");
      } catch (err) {
        console.error("Error fetching logo:", err.message);
        companyLogoBase64 = defaultConfig.company_logo;
      }
    }

    if (defaultConfig?.company_signature) {
      try {
        const fetch = require("node-fetch");
        const signatureResponse = await fetch(defaultConfig.company_signature);
        const signatureBuffer = await signatureResponse.buffer();
        const signatureBase64 = signatureBuffer.toString("base64");
        const signatureMimeType =
          signatureResponse.headers.get("content-type") || "image/png";
        companySignatureBase64 = `data:${signatureMimeType};base64,${signatureBase64}`;
        console.log("Signature converted to base64");
      } catch (err) {
        console.error("Error fetching signature:", err.message);
        companySignatureBase64 = defaultConfig.company_signature;
      }
    }

    const addressParts = [
      defaultConfig?.street_address,
      defaultConfig?.city,
      defaultConfig?.state,
      defaultConfig?.country,
    ].filter(Boolean);
    const fullAddress = addressParts.join(", ") || "Company Address";

    const pdfData = {
      companyLogo: companyLogoBase64 || defaultConfig?.company_logo || "",
      companySignature:
        companySignatureBase64 || defaultConfig?.company_signature || "",
      companyName: defaultConfig?.company_name || "Company Name",
      companyAddress: fullAddress,
      companyEmail: defaultConfig?.website || "info@company.com",
      companyPhone: defaultConfig?.phone_number || "Phone Number",
      companySignatory: "HR Manager",

      employeeName: appraisal.appraisal_employee?.full_name || "N/A",
      employeeCode: appraisal.appraisal_employee?.employee_code || "N/A",
      employeeEmail: appraisal.appraisal_employee?.email || "N/A",
      employeePhone: appraisal.appraisal_employee?.phone || "N/A",

      position:
        appraisal.appraisal_employee?.hrms_employee_designation
          ?.designation_name || "N/A",

      department:
        appraisal.appraisal_employee?.hrms_employee_department
          ?.department_name || "N/A",

      designation:
        appraisal.appraisal_employee?.hrms_employee_designation
          ?.designation_name || "N/A",

      managerName: appraisal.appraisal_manager?.full_name || "HR Manager",
      appraisalDate: appraisal.review_date || appraisal.effective_date,
      appraisalPeriod: appraisal.review_period || "N/A",
      overallRating: parseFloat(appraisal.final_score || appraisal.rating) || 0,
      managerComments: appraisal.reviewer_comments || "No comments provided",
      employeeComments: appraisal.overall_remarks || "No comments provided",
    };

    console.log("Position:", pdfData.position);
    console.log("Department:", pdfData.department);
    console.log("Designation:", pdfData.designation);
    console.log("Employee Code:", pdfData.employeeCode);

    return pdfData;
  } catch (error) {
    console.error("Error in getAppraisalForPDF:", error);
    throw new CustomError(
      error.message || "Error fetching appraisal data",
      500
    );
  }
};

const getAllAppraisalsForBulkDownload = async (
  filters = {},
  advancedFilters = {}
) => {
  try {
    const whereClause = {
      ...filters,
    };

    if (Object.keys(advancedFilters).length > 0) {
      whereClause.appraisal_employee = advancedFilters;
    }

    console.log("Final where clause:", JSON.stringify(whereClause, null, 2));

    const appraisals = await prisma.hrms_d_appraisal.findMany({
      where: whereClause,
      select: {
        id: true,
        employee_id: true,
        appraisal_employee: {
          select: {
            id: true,
            full_name: true,
            employee_code: true,
            email: true,

            hrms_employee_department: {
              select: {
                id: true,
                department_name: true,
              },
            },
            hrms_employee_designation: {
              select: {
                id: true,
                designation_name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdate: "desc",
      },
    });

    console.log(`Found ${appraisals.length} appraisals matching filters`);

    return appraisals;
  } catch (error) {
    console.error("Error in getAllAppraisalsForBulkDownload:", error);
    throw new CustomError(error.message, 500);
  }
};

module.exports = {
  createAppraisalEntry,
  findAppraisalEntryById,
  updateAppraisalEntry,
  deleteAppraisalEntry,
  getAllAppraisalEntry,
  getAppraisalForPDF,
  getAllAppraisalsForBulkDownload,
};

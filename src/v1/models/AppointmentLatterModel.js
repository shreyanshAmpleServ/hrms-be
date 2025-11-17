const { prisma } = require("../../utils/prismaProxy.js");
const CustomError = require("../../utils/CustomError");
const { errorNotExist } = require("../../Comman/errorNotExist");
const { createRequest } = require("./requestsModel");

const serializeJobData = (data) => {
  return {
    candidate_id: Number(data.candidate_id) || null,
    issue_date: data.issue_date ? new Date(data.issue_date) : new Date(),
    status: data.status || "P",
    designation_id: Number(data.designation_id) || null,
    terms_summary: data.terms_summary || "",
  };
};

const createAppointmentLatter = async (data) => {
  try {
    await errorNotExist(
      "hrms_d_candidate_master",
      data.candidate_id,
      "Candidate"
    );
    const reqData = await prisma.hrms_d_appointment_letter.create({
      data: {
        ...serializeJobData(data),
        createdby: data.createdby || 1,
        createdate: new Date(),
        log_inst: data.log_inst || 1,
      },
      include: {
        appointment_candidate: {
          select: {
            full_name: true,
            id: true,
          },
        },
        appointment_designation: {
          select: {
            designation_name: true,
            id: true,
          },
        },
      },
    });
    await createRequest({
      requester_id: data.createdby || 1,
      request_type: "appointment_letter",
      reference_id: reqData.id,
      request_data: `Appointment Letter for ${reqData.appointment_candidate?.full_name} - ${reqData.appointment_designation?.designation_name}`,
      status: "P",
      createdby: data.createdby || 1,
      log_inst: data.log_inst || 1,
    });

    console.log(
      ` Appointment letter created with ID: ${reqData.id} for candidate: ${reqData.appointment_candidate?.full_name}`
    );
    console.log(`Approval request initiated for appointment letter`);
    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error creating appointment latter: ${error.message}`,
      500
    );
  }
};

const findAppointmentLatterById = async (id) => {
  try {
    const reqData = await prisma.hrms_d_appointment_letter.findUnique({
      where: { id: parseInt(id) },
    });
    if (!AppointmentLatter) {
      throw new CustomError("appointment latter not found", 404);
    }
    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error finding appointment latter by ID: ${error.message}`,
      503
    );
  }
};

const updateAppointmentLatter = async (id, data) => {
  try {
    await errorNotExist(
      "hrms_d_candidate_master",
      data.candidate_id,
      "Candidate"
    );
    const updatedAppointmentLatter =
      await prisma.hrms_d_appointment_letter.update({
        where: { id: parseInt(id) },
        data: {
          ...serializeJobData(data),
          updatedby: data.updatedby || 1,
          updatedate: new Date(),
        },
        include: {
          appointment_candidate: {
            select: {
              full_name: true,
              id: true,
            },
          },
          appointment_designation: {
            select: {
              designation_name: true,
              id: true,
            },
          },
        },
      });
    return updatedAppointmentLatter;
  } catch (error) {
    throw new CustomError(
      `Error updating appointment latter: ${error.message}`,
      500
    );
  }
};

const deleteAppointmentLatter = async (id) => {
  try {
    await prisma.hrms_d_appointment_letter.delete({
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

const getAllAppointmentLatter = async (
  search,
  page,
  size,
  startDate,
  endDate,
  candidate_id
) => {
  try {
    page = !page || page == 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size || 0;

    const filters = {};
    if (search) {
      filters.OR = [
        {
          appointment_designation: {
            designation_name: { contains: search.toLowerCase() },
          },
        },
        {
          appointment_candidate: {
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
    if (candidate_id) {
      filters.candidate_id = parseInt(candidate_id);
    }
    const datas = await prisma.hrms_d_appointment_letter.findMany({
      where: filters,
      skip: skip,
      take: size,
      include: {
        appointment_candidate: {
          select: {
            full_name: true,
            id: true,
          },
        },
        appointment_designation: {
          select: {
            designation_name: true,
            id: true,
          },
        },
      },
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
    });
    const totalCount = await prisma.hrms_d_appointment_letter.count({
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
    console.log(error);
    throw new CustomError("Error retrieving appointment latters", 503);
  }
};

const getAppointmentLetterForPDF = async (id) => {
  try {
    if (!id) {
      throw new CustomError("Appointment letter ID is required", 400);
    }

    const appointmentLetter = await prisma.hrms_d_appointment_letter.findUnique(
      {
        where: { id: parseInt(id) },
        include: {
          appointment_candidate: {
            select: {
              id: true,
              full_name: true,
              email: true,
              phone: true,
              candidate_code: true,
              expected_joining_date: true,
              actual_joining_date: true,
              date_of_birth: true,
              gender: true,
              nationality: true,
              resume_path: true,
              status: true,

              candidate_department: {
                select: {
                  id: true,
                  department_name: true,
                },
              },
            },
          },
          appointment_designation: {
            select: {
              id: true,
              designation_name: true,
            },
          },
        },
      }
    );

    if (!appointmentLetter) {
      throw new CustomError("Appointment letter not found", 404);
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
        console.error(" Error fetching logo:", err.message);
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
        console.log(" Signature converted to base64");
      } catch (err) {
        console.error(" Error fetching signature:", err.message);
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

      employeeName: appointmentLetter.appointment_candidate?.full_name || "N/A",
      employeeCode:
        appointmentLetter.appointment_candidate?.candidate_code || "N/A",
      employeeEmail: appointmentLetter.appointment_candidate?.email || "N/A",
      employeePhone: appointmentLetter.appointment_candidate?.phone || "N/A",

      position:
        appointmentLetter.appointment_designation?.designation_name || "N/A",

      department:
        appointmentLetter.appointment_candidate?.candidate_department
          ?.department_name || "N/A",

      designation:
        appointmentLetter.appointment_designation?.designation_name || "N/A",

      appointmentDate: appointmentLetter.issue_date,
      joiningDate:
        appointmentLetter.appointment_candidate?.actual_joining_date ||
        appointmentLetter.appointment_candidate?.expected_joining_date,
      termsSummary: appointmentLetter.terms_summary || "",
      status: appointmentLetter.appointment_candidate?.status || "P",
    };

    console.log("Position:", pdfData.position);
    console.log("Department:", pdfData.department);
    console.log("Designation:", pdfData.designation);
    console.log("Employee Code:", pdfData.employeeCode);
    console.log("Joining Date:", pdfData.joiningDate);

    return pdfData;
  } catch (error) {
    console.error("Error in getAppointmentLetterForPDF:", error);
    throw new CustomError(
      error.message || "Error fetching appointment letter data",
      500
    );
  }
};

const getAllAppointmentLettersForBulkDownload = async (
  filters = {},
  advancedFilters = {}
) => {
  try {
    const whereClause = {
      ...filters,
    };

    if (Object.keys(advancedFilters).length > 0) {
      whereClause.appointment_candidate = advancedFilters;
    }

    console.log("Final where clause:", JSON.stringify(whereClause, null, 2));

    const appointmentLetters = await prisma.hrms_d_appointment_letter.findMany({
      where: whereClause,
      select: {
        id: true,
        designation_id: true,
        candidate_id: true,
        appointment_candidate: {
          select: {
            id: true,
            full_name: true,
            email: true,
            phone: true,
            candidate_code: true,
            expected_joining_date: true,
            actual_joining_date: true,
            date_of_birth: true,
            gender: true,
            nationality: true,
            resume_path: true,
            status: true,

            candidate_department: {
              select: {
                id: true,
                department_name: true,
              },
            },
          },
        },
        appointment_designation: {
          select: {
            id: true,
            designation_name: true,
          },
        },
      },
      orderBy: {
        createdate: "desc",
      },
    });

    console.log(
      `Found ${appointmentLetters.length} appointment letters matching filters`
    );

    return appointmentLetters;
  } catch (error) {
    console.error("Error in getAllAppointmentLettersForBulkDownload:", error);
    throw new CustomError(error.message, 500);
  }
};

module.exports = {
  createAppointmentLatter,
  findAppointmentLatterById,
  updateAppointmentLatter,
  deleteAppointmentLatter,
  getAllAppointmentLatter,
  getAppointmentLetterForPDF,
  getAllAppointmentLettersForBulkDownload,
  getAppointmentLetterForPDF,
};

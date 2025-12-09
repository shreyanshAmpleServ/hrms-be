const { prisma, asyncLocalStorage } = require("../../utils/prismaProxy.js");
const CustomError = require("../../utils/CustomError");
const { errorNotExist } = require("../../Comman/errorNotExist");
const { createRequest } = require("./requestsModel");
const { getPrismaClient } = require("../../config/db.js");

const serializeJobData = (data) => {
  return {
    candidate_id: Number(data.candidate_id) || null,
    currency_id: Number(data.currency_id) || null,
    offer_date: data.offer_date || new Date(),
    position: data.position || "",
    status: data.status || "P",
    offered_salary: Number(data.offered_salary) || 0,
    valid_until: data.valid_until || new Date(),
  };
};

const createOfferLetter = async (data) => {
  try {
    await errorNotExist(
      "hrms_d_candidate_master",
      data.candidate_id,
      "Candidate"
    );

    const existingOfferLetter = await prisma.hrms_d_offer_letter.findFirst({
      where: {
        candidate_id: Number(data.candidate_id),
      },
      select: {
        id: true,
        status: true,
        position: true,
        offer_date: true,
        offered_candidate: {
          select: {
            full_name: true,
            candidate_code: true,
          },
        },
      },
      orderBy: {
        createdate: "desc",
      },
    });

    if (existingOfferLetter) {
      throw new CustomError(
        `An offer letter already exists for candidate "${existingOfferLetter.offered_candidate?.full_name}" (${existingOfferLetter.offered_candidate?.candidate_code}). ` +
          `Existing offer: ${existingOfferLetter.position} - Status: ${existingOfferLetter.status} (ID: ${existingOfferLetter.id})`,
        409
      );
    }

    const reqData = await prisma.hrms_d_offer_letter.create({
      data: {
        ...serializeJobData(data),
        createdby: data.createdby || 1,
        createdate: new Date(),
        log_inst: data.log_inst || 1,
      },
      include: {
        offered_candidate: {
          select: {
            full_name: true,
            id: true,
            candidate_code: true,
          },
        },
        offer_letter_currencyId: {
          select: {
            id: true,
            currency_code: true,
            currency_name: true,
          },
        },
      },
    });
    if (reqData.status === "P") {
      await createRequest({
        request_type: "offer_letter",
        reference_id: reqData.id,
        status: "P",
        requester_id: data.createdby || 1,
        createdby: data.createdby || 1,
        createdate: new Date(),
        log_inst: data.log_inst || 1,
      });
    }
    return reqData;
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    throw new CustomError(`Error creating offer letter: ${error.message}`, 500);
  }
};

const findOfferLetterById = async (id) => {
  try {
    const reqData = await prisma.hrms_d_offer_letter.findUnique({
      where: { id: parseInt(id) },
    });
    if (!reqData) {
      throw new CustomError("offer letter not found", 404);
    }
    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error finding offer letter by ID: ${error.message}`,
      503
    );
  }
};

const updateOfferLetter = async (id, data) => {
  try {
    await errorNotExist(
      "hrms_d_candidate_master",
      data.candidate_id,
      "Candidate"
    );

    const currentOfferLetter = await prisma.hrms_d_offer_letter.findUnique({
      where: { id: parseInt(id) },
      select: { candidate_id: true },
    });

    if (!currentOfferLetter) {
      throw new CustomError("Offer letter not found", 404);
    }

    if (currentOfferLetter.candidate_id !== Number(data.candidate_id)) {
      const existingOfferForNewCandidate =
        await prisma.hrms_d_offer_letter.findFirst({
          where: {
            candidate_id: Number(data.candidate_id),
            id: { not: parseInt(id) },
          },
          select: {
            id: true,
            status: true,
            position: true,
            offered_candidate: {
              select: {
                full_name: true,
                candidate_code: true,
              },
            },
          },
        });

      if (existingOfferForNewCandidate) {
        throw new CustomError(
          `Candidate "${existingOfferForNewCandidate.offered_candidate?.full_name}" already has an existing offer letter ` +
            `(ID: ${existingOfferForNewCandidate.id}, Status: ${existingOfferForNewCandidate.status}). ` +
            `Please use that offer letter or delete it first.`,
          409
        );
      }
    }

    const updatedOfferLetter = await prisma.hrms_d_offer_letter.update({
      where: { id: parseInt(id) },
      data: {
        ...serializeJobData(data),
        updatedby: data.updatedby || 1,
        updatedate: new Date(),
      },
      include: {
        offered_candidate: {
          select: {
            full_name: true,
            id: true,
            candidate_code: true,
          },
        },
        offer_letter_currencyId: {
          select: {
            id: true,
            currency_code: true,
            currency_name: true,
          },
        },
      },
    });

    return updatedOfferLetter;
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    throw new CustomError(`Error updating offer letter: ${error.message}`, 500);
  }
};

const deleteOfferLetter = async (id) => {
  try {
    await prisma.hrms_d_offer_letter.delete({
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

const getAllOfferLetter = async (
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
          offered_candidate: {
            full_name: { contains: search.toLowerCase() },
          },
        },
        {
          position: { contains: search.toLowerCase() },
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

    if (candidate_id) {
      filters.candidate_id = parseInt(candidate_id);
    }

    const datas = await prisma.hrms_d_offer_letter.findMany({
      where: filters,
      skip: skip,
      take: size,
      include: {
        offered_candidate: {
          select: {
            full_name: true,
            id: true,
          },
        },
        offer_letter_currencyId: {
          select: {
            id: true,
            currency_code: true,
            currency_name: true,
          },
        },
      },
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
    });
    const totalCount = await prisma.hrms_d_offer_letter.count({
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
    throw new CustomError("Error retrieving offer letters", 503);
  }
};

const updateOfferLetterStatus = async (id, data) => {
  try {
    const offerLetterId = parseInt(id);

    if (isNaN(leaveId)) {
      throw new CustomError("Invalid Offer Letter ID", 400);
    }

    const existingOfferLetter = await prisma.hrms_d_offer_letter.findUnique({
      where: { id: offerLetterId },
    });

    if (!existingOfferLetter) {
      throw new CustomError(
        `Offer letter with ID ${offerLetterId} not found`,
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
    const updatedEntry = await prisma.hrms_d_offer_letter.update({
      where: { id: offerLetterId },
      include: {
        offered_caZndidate: {
          select: {
            full_name: true,
            id: true,
          },
        },
        offer_letter_currencyId: {
          select: {
            id: true,
            currency_code: true,
            currency_name: true,
          },
        },
      },
      data: updateData,
    });
    return updatedEntry;
  } catch (error) {
    console.error("Error updating offer letter status:", error);
    throw new CustomError(
      `Error updating offer letter status: ${error.message}`,
      error.status || 500
    );
  }
};

const fetch = require("node-fetch");

const getOfferLetterForPDF = async (id, tenantDb = null) => {
  try {
    if (!id) {
      throw new CustomError("Offer letter ID is required", 400);
    }

    console.log(
      ` Getting PDF data for offer letter ${id}, tenantDb: ${
        tenantDb || "from context"
      }`
    );

    let dbClient;

    if (tenantDb) {
      console.log(` Using explicit tenantDb: ${tenantDb}`);
      dbClient = getPrismaClient(tenantDb);
    } else {
      const store = asyncLocalStorage.getStore();
      if (store && store.tenantDb) {
        console.log(` Using context tenantDb: ${store.tenantDb}`);
        dbClient = prisma;
      } else {
        throw new CustomError(
          "No tenant database context available. Please ensure authentication.",
          503
        );
      }
    }

    const offerLetter = await dbClient.hrms_d_offer_letter.findUnique({
      where: { id: Number(id) },
      include: {
        offered_candidate: {
          select: {
            id: true,
            full_name: true,
            email: true,
            phone: true,
            department_id: true,
            expected_joining_date: true,
            candidate_department: {
              select: { department_name: true },
            },
          },
        },
        offer_letter_currencyId: {
          select: {
            currency_code: true,
            currency_name: true,
          },
        },
      },
    });

    if (!offerLetter) {
      throw new CustomError("Offer letter not found", 404);
    }

    const defaultConfig =
      await dbClient.hrms_d_default_configurations.findFirst({
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
    console.log("Company Name:", defaultConfig?.company_name);

    let companyLogoBase64 = "";
    let companySignatureBase64 = "";

    if (defaultConfig?.company_logo) {
      try {
        const logoResponse = await fetch(defaultConfig.company_logo);
        const logoBuffer = await logoResponse.buffer();
        const logoBase64 = logoBuffer.toString("base64");
        const logoMimeType =
          logoResponse.headers.get("content-type") || "image/png";
        companyLogoBase64 = `data:${logoMimeType};base64,${logoBase64}`;
        console.log(" Logo converted to base64");
      } catch (err) {
        console.error(" Error fetching logo:", err.message);
        companyLogoBase64 = defaultConfig.company_logo;
      }
    }

    if (defaultConfig?.company_signature) {
      try {
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

    let payComponents = [
      {
        componentName: "Base Salary",
        componentCode: "BASIC",
        amount: offerLetter.offered_salary || 0,
        currencyCode: offerLetter.offer_letter_currencyId?.currency_code || "",
      },
    ];

    try {
      const employmentContract =
        await dbClient.hrms_d_employment_contract.findFirst({
          where: { candidate_id: Number(offerLetter.candidate_id) },
          select: { id: true },
          orderBy: { createdate: "desc" },
        });

      if (employmentContract) {
        const contractPayComponents =
          await dbClient.hrms_d_pay_component_contract.findMany({
            where: { contract_id: Number(employmentContract.id) },
            include: {
              pay_component_for_contract: {
                select: { component_name: true, component_code: true },
              },
            },
          });

        if (contractPayComponents.length > 0) {
          const currencyIds = [
            ...new Set(
              contractPayComponents.map((pc) => pc.currencyid).filter(Boolean)
            ),
          ];
          let currencies = {};

          if (currencyIds.length > 0) {
            const currencyData = await dbClient.hrms_m_currency_master.findMany(
              {
                where: { id: { in: currencyIds } },
                select: { id: true, currency_code: true },
              }
            );
            currencies = currencyData.reduce((acc, curr) => {
              acc[curr.id] = curr.currency_code;
              return acc;
            }, {});
          }

          payComponents = contractPayComponents.map((pc) => ({
            componentName:
              pc.pay_component_for_contract?.component_name || "Component",
            componentCode: pc.pay_component_for_contract?.component_code || "",
            amount: pc.amount || 0,
            currencyCode: pc.currencyid
              ? currencies[pc.currencyid] || ""
              : offerLetter.offer_letter_currencyId?.currency_code || "",
          }));
        }
      }
    } catch (payComponentError) {
      console.error("Error fetching pay components:", payComponentError);
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

      candidateName: offerLetter.offered_candidate?.full_name || "N/A",
      candidateEmail: offerLetter.offered_candidate?.email || "N/A",
      candidatePhone: offerLetter.offered_candidate?.phone || "N/A",

      position: offerLetter.position || "N/A",
      department:
        offerLetter.offered_candidate?.candidate_department?.department_name ||
        "N/A",
      offerDate: offerLetter.offer_date,
      validUntil: offerLetter.valid_until,
      expectedJoiningDate: offerLetter.offered_candidate?.expected_joining_date,

      payComponents: payComponents,
      currencyCode: offerLetter.offer_letter_currencyId?.currency_code || "",
      currencyName: offerLetter.offer_letter_currencyId?.currency_name || "",
    };

    console.log(" PDF data prepared successfully");
    console.log("Logo included:", pdfData.companyLogo ? "YES" : "NO");
    console.log("Signature included:", pdfData.companySignature ? "YES" : "NO");

    return pdfData;
  } catch (error) {
    console.error("Error in getOfferLetterForPDF:", error);
    throw new CustomError(
      error.message || "Error fetching offer letter data",
      500
    );
  }
};
const getAllOfferLettersForBulkDownload = async (
  filters = {},
  advancedFilters = {}
) => {
  try {
    const whereClause = {
      ...filters,
    };

    if (Object.keys(advancedFilters).length > 0) {
      whereClause.offered_candidate = advancedFilters;
    }

    console.log("Final where clause:", JSON.stringify(whereClause, null, 2));

    const offerLetters = await prisma.hrms_d_offer_letter.findMany({
      where: whereClause,
      select: {
        id: true,
        position: true,
        candidate_id: true,
        offered_candidate: {
          select: {
            id: true,
            full_name: true,
            department_id: true,
            candidate_department: {
              select: {
                id: true,
                department_name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdate: "desc",
      },
    });

    console.log(`Found ${offerLetters.length} offer letters matching filters`);

    return offerLetters;
  } catch (error) {
    console.error("Error in getAllOfferLettersForBulkDownload:", error);
    throw new CustomError(error.message, 500);
  }
};

module.exports = {
  createOfferLetter,
  findOfferLetterById,
  updateOfferLetter,
  deleteOfferLetter,
  getAllOfferLetter,
  updateOfferLetterStatus,
  getOfferLetterForPDF,
  getAllOfferLettersForBulkDownload,
};

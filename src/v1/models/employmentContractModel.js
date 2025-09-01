const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const { errorNotExist } = require("../../Comman/errorNotExist");
const moment = require("moment");
const sendEmail = require("../../utils/mailer");
const logger = require("../../Comman/logger");
const { templateKeyMap } = require("../../utils/templateKeyMap");
const { generateEmailContent } = require("../../utils/emailTemplates");
const prisma = new PrismaClient();

const notificationLogModel = require("./notificationLogModel");
const { date } = require("zod/v4");

const serializeJobData = (data) => {
  return {
    candidate_id: Number(data.candidate_id) || null,
    contract_start_date: data.contract_start_date || new Date(),
    contract_end_date: data.contract_end_date || new Date(),
    contract_type: data.contract_type || "",
    document_path: data.document_path || "",
    description: data.description || "",
  };
};

// Create a new employment contract
const createEmploymentContract = async (data) => {
  try {
    await errorNotExist(
      "hrms_d_candidate_master",
      data.candidate_id,
      "Candidate"
    );

    if (
      data.contract_start_date &&
      data.contract_end_date &&
      new Date(data.contract_end_date) <= new Date(data.contract_start_date)
    ) {
      throw new CustomError(
        "Contract End  date must be greater than Contract Start Date",
        400
      );
    }
    const reqData = await prisma.hrms_d_employment_contract.create({
      data: {
        ...serializeJobData(data),
        createdby: data.createdby || 1,
        createdate: new Date(),
        log_inst: data.log_inst || 1,
      },
      include: {
        contracted_candidate: {
          select: {
            full_name: true,
            id: true,
          },
        },
      },
    });
    return reqData;
  } catch (error) {
    throw new CustomError(` ${error.message}`, 500);
  }
};

// Find a employment contract by ID
const findEmploymentContractById = async (id) => {
  try {
    const reqData = await prisma.hrms_d_employment_contract.findUnique({
      where: { id: parseInt(id) },
    });
    if (!reqData) {
      throw new CustomError("employment contract not found", 404);
    }
    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error finding employment contract by ID: ${error.message}`,
      503
    );
  }
};

/**
 * Sends contract expiry alert email to employee
 * @description Finds contract by ID and sends personalized expiry alert email
 * @async
 * @param {number} contractId - Contract ID to send alert for
 * @returns {Promise<Object>} Contract data with candidate information
 */
const contractExpiryAlertFn = async (contractId) => {
  try {
    const reqData = await prisma.hrms_d_employment_contract.findUnique({
      where: { id: parseInt(contractId) },
      select: {
        id: true,
        contract_end_date: true,
        contract_type: true,
        contracted_candidate: {
          select: {
            full_name: true,
            email: true,
            id: true,
          },
        },
      },
    });

    if (!reqData) {
      throw new CustomError("Employment contract not found", 404);
    }

    if (!reqData.contracted_candidate?.email) {
      throw new CustomError("Employee email not found", 404);
    }

    /**
     * Calculate days until expiry using date-only comparison (ignore time)
     * @description Uses startOf('day') to ensure consistent day calculation
     */
    const contractEndDate = moment(reqData.contract_end_date).startOf("day");
    const today = moment().startOf("day");
    const daysUntilExpiry = contractEndDate.diff(today, "days");

    const template = await generateEmailContent(
      templateKeyMap.contractExpiryAlert,
      {
        employee_name: reqData.contracted_candidate.full_name,
        days: daysUntilExpiry,
      }
    );
    await sendEmail({
      to: reqData.contracted_candidate.email,
      subject: template.subject,
      html: template.body,
      log_inst: 1,
    });

    await notificationLogModel.createNotificationLog({
      employee_id: 15,
      message_title: "Contract Expiry Alert",
      message_body: `The employment contract of ${reqData.contracted_candidate.full_name} is scheduled to expire in ${daysUntilExpiry} day(s).
Please review and take the necessary action for renewal or transition.`,
      channel: "email",
      sent_on: new Date(),
      status: "S",
      createdby: 1,
      log_inst: 1,
    });

    logger.info(
      `Contract expiry alert sent successfully to ${reqData.contracted_candidate.full_name} (${reqData.contracted_candidate.email}) - ${daysUntilExpiry} days remaining`
    );

    return reqData;
  } catch (error) {
    logger.error(`Error in contractExpiryAlertFn:`, error);
    throw new CustomError(
      `Error sending contract expiry alert: ${error.message}`,
      503
    );
  }
};

// Update a employment contract
const updateEmploymentContract = async (id, data) => {
  try {
    await errorNotExist(
      "hrms_d_candidate_master",
      data.candidate_id,
      "Candidate"
    );

    const updatedEmploymentContract =
      await prisma.hrms_d_employment_contract.update({
        where: { id: parseInt(id) },
        data: {
          ...serializeJobData(data),
          updatedby: data.updatedby || 1,
          updatedate: new Date(),
        },
        include: {
          contracted_candidate: {
            select: {
              full_name: true,
              id: true,
            },
          },
        },
      });
    return updatedEmploymentContract;
  } catch (error) {
    throw new CustomError(
      `Error updating employment contract: ${error.message}`,
      500
    );
  }
};

// Delete a employment contract
const deleteEmploymentContract = async (id) => {
  try {
    await prisma.hrms_d_employment_contract.delete({
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

// Get all employment contracts
const getAllEmploymentContract = async (
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
    // Handle search
    if (search) {
      filters.OR = [
        {
          contracted_candidate: {
            full_name: { contains: search.toLowerCase() },
          },
        },
        {
          contract_type: { contains: search.toLowerCase() },
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
    const datas = await prisma.hrms_d_employment_contract.findMany({
      where: filters,
      skip: skip,
      take: size,
      include: {
        contracted_candidate: {
          select: {
            full_name: true,
            email: true,
            id: true,
          },
        },
      },
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
    });
    // const totalCount = await prisma.hrms_d_employment_contract.count();
    const totalCount = await prisma.hrms_d_employment_contract.count({
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
    throw new CustomError("Error retrieving employment contracts", 503);
  }
};

module.exports = {
  createEmploymentContract,
  findEmploymentContractById,
  updateEmploymentContract,
  deleteEmploymentContract,
  getAllEmploymentContract,
  contractExpiryAlertFn,
};

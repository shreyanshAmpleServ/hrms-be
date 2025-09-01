const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const prisma = new PrismaClient();

// Serialize `tags` before saving it
const serializeTags = (data) => {
  if (data.tags) {
    data.tags = JSON.stringify(data.tags);
  }
  return data;
};

// Parse `tags` after retrieving it
const parseTags = (deal) => {
  if (deal && deal.tags) {
    deal.tags = JSON.parse(deal.tags);
  }
  return deal;
};

// Check if contactIds are valid and exist
const validateContactsExist = async (contactIds) => {
  const contacts = await prisma.crms_m_contact.findMany({
    where: {
      id: {
        in: contactIds.map((contactId) => parseInt(contactId)), // Ensure all are valid integers
      },
    },
  });

  if (contacts?.length !== contactIds.length) {
    throw new CustomError(
      "One or more contact IDs are invalid or do not exist.",
      400
    );
  }
};

// Create a new deal
const createDeal = async (data) => {
  const { contactIds, ...dealData } = data; // Separate `contactIds` from other deal data
  try {
    const serializedData = serializeTags(dealData);

    // Validate that all contactIds exist in the crms_m_contact table
    if (contactIds && contactIds.length > 0) {
      await validateContactsExist(contactIds);
    }

    // Use transaction for atomicity
    const result = await prisma.$transaction(async (prisma) => {
      // Create the deal
      const deal = await prisma.crms_d_campaign.create({
        data: serializedData,
      });

      // Map contacts to the deal
      if (contactIds && contactIds.length > 0) {
        const contactMappings = contactIds.map((contactId) => ({
          dealId: deal.id,
          contactId: parseInt(contactId),
          createdDate: new Date(),
        }));
        await prisma.CampaignContacts.createMany({ data: contactMappings });
      }
      // Fetch the deal with contacts now that they are inserted
      const fullDeal = await prisma.Deal.findUnique({
        where: { id: deal.id },
        include: {
          DealContacts: {
            include: { contact: true },
          },
          pipeline: true,
          DealHistory: true,
        },
      });

      return fullDeal;
    });

    return parseTags(result);
  } catch (error) {
    console.log("Error to Create Deal : ", error);
    throw new CustomError(`Error creating deal: ${error.message}`, 500);
  }
};

// Update an existing deal
const updateDeal = async (id, data) => {
  const { contactIds, ...dealData } = data; // Separate `contactIds` from other deal data
  try {
    const updatedData = {
      ...dealData,
      updatedDate: new Date(),
    };
    const serializedData = serializeTags(updatedData);

    // Validate that all contactIds exist in the crms_m_contact table
    if (contactIds && contactIds.length > 0) {
      await validateContactsExist(contactIds);
    }

    // Use transaction for atomicity
    const result = await prisma.$transaction(async (prisma) => {
      // Update the deal
      const deal = await prisma.Deal.update({
        where: { id: parseInt(id) },
        data: serializedData,
      });

      // Update deal-contact mappings
      if (contactIds) {
        // Delete existing mappings
        await prisma.DealContacts.deleteMany({
          where: { dealId: parseInt(id) },
        });

        // Add new mappings
        const contactMappings = contactIds.map((contactId) => ({
          dealId: parseInt(id),
          contactId: parseInt(contactId),
          createdDate: new Date(),
        }));
        await prisma.DealContacts.createMany({ data: contactMappings });
      }
      // Retrieve the updated deal with DealContacts and DealHistory included
      const updatedDeal = await prisma.Deal.findUnique({
        where: { id: parseInt(id) },
        include: {
          DealContacts: {
            include: {
              contact: true, // Include contact details
            },
          },
          deals: true,
          pipeline: true,
          DealHistory: true,
        },
      });

      return updatedDeal;
    });

    return parseTags(result);
  } catch (error) {
    throw new CustomError(`Error updating deal: ${error.message}`, 500);
  }
};

// Find a deal by its ID
const findDealById = async (id) => {
  try {
    const deal = await prisma.Deal.findUnique({
      where: { id: parseInt(id) },
      include: {
        DealContacts: {
          include: {
            contact: true, // Include contact details
          },
        },
        DealHistory: true,
      },
    });
    return parseTags(deal);
  } catch (error) {
    throw new CustomError("Error finding deal by ID", 503);
  }
};

// Get all deals
const getAllDeals = async (
  page,
  size,
  search,
  startDate,
  endDate,
  status,
  priority
) => {
  try {
    page = page || page == 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size || 0;

    const filters = {};
    // Handle search
    if (search) {
      filters.OR = [
        {
          DealContacts: {
            some: {
              contact: {
                firstName: { contains: search.toLowerCase() },
              }, // Include contact details
            },
          },
        },
        {
          dealName: { contains: search.toLowerCase() },
        },
        {
          priority: { contains: search.toLowerCase() },
        },
        {
          status: { contains: search.toLowerCase() },
        },
      ];
    }
    if (status) {
      filters.is_active = { equals: status };
    }
    if (priority) {
      filters.priority = { equals: priority };
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        filters.createdDate = {
          gte: start,
          lte: end,
        };
      }
    }
    const deals = await prisma.Deal.findMany({
      where: filters,
      skip: skip,
      take: size,
      include: {
        DealContacts: {
          include: {
            contact: true, // Include contact details
          },
        },
        deals: true,
        pipeline: true,
        DealHistory: true,
      },
      orderBy: [{ updatedDate: "desc" }, { createdDate: "desc" }],
    });
    const formattedDeals = deals.map((deal) => {
      const { deals, ...rest } = parseTags(deal); // Remove "deals" key
      return { ...rest, stages: deal.deals || [] }; // Rename "stages" to "deals"
    });
    const totalCount = await prisma.Deal.count();
    return {
      data: formattedDeals,
      currentPage: page,
      size,
      totalPages: Math.ceil(totalCount / size),
      totalCount: totalCount,
    };
  } catch (error) {
    console.log("Error Deal get : ", error);
    throw new CustomError("Error retrieving deals", 503);
  }
};

const deleteDeal = async (id) => {
  try {
    // Step 1: Delete related data from DealContacts
    await prisma.dealContacts.deleteMany({
      where: { dealId: parseInt(id) },
    });

    // Step 2: Delete the deal
    const deletedDeal = await prisma.deal.delete({
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
module.exports = {
  createDeal,
  findDealById,
  updateDeal,
  getAllDeals,
  deleteDeal,
};

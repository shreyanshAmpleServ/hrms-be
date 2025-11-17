const { prisma } = require("../../utils/prismaProxy");
const CustomError = require("../../utils/CustomError");

// Serialize  before saving it
const serializeTags = (data) => {
  return {
    ...data,
    exp_revenue: parseFloat(data?.exp_revenue),
    camp_cost: parseFloat(data?.camp_cost),
    owner_id: Number(data.owner_id || null),
  };
};

// Parse  after retrieving it
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

// Create a new campaign
const createCampaign = async (data) => {
  const { contact_ids, lead_ids, ...campaignData } = data; // Separate `contactIds` from other deal data
  try {
    const serializedData = serializeTags(campaignData);

    // Validate that all contactIds exist in the crms_m_contact table
    if (contact_ids && contact_ids.length > 0) {
      await validateContactsExist(contact_ids);
    }

    // Use transaction for atomicity
    const result = await prisma.$transaction(async (prisma) => {
      // Create the campaign
      const campaign = await prisma.crms_d_campaign.create({
        data: {
          ...serializedData,
          campaign_leads: {
            connect: lead_ids.map((id) => ({ id })),
          },
        },
      });

      // Map contacts to the campaign
      if (contact_ids && contact_ids.length > 0) {
        const contactMappings = contact_ids.map((contactId) => ({
          camp_id: campaign.id,
          contact_id: parseInt(contactId),
          createdDate: new Date(),
        }));
        await prisma.CampaignContacts.createMany({ data: contactMappings });
      }
      // Fetch the campaign with contacts now that they are inserted
      const fullCampaign = await prisma.crms_d_campaign.findFirst({
        where: { id: campaign.id },
        include: {
          campaign_contact: {
            select: {
              camp_contact: true,
            },
          },
          campaign_leads: true,
          campaign_user: true,
        },
      });
      const { campaign_contact, ...rest } = parseTags(fullCampaign); // Remove "deals" key
      const finalContact = campaign_contact.map((item) => item.camp_contact);
      return { ...rest, campaign_contact: finalContact }; // Rename "stages" to "deals"
    });

    return parseTags(result);
  } catch (error) {
    console.log("Error to Create campaign : ", error);
    throw new CustomError(`Error creating campaign: ${error.message}`, 500);
  }
};

// Update an existing campaign
const updateCampaign = async (id, data) => {
  const { contact_ids, ...campaignData } = data; // Separate `contactIds` from other campaign data
  try {
    const updatedData = {
      ...campaignData,
      updatedDate: new Date(),
    };
    const { owner_id, lead_ids, ...serializedData } =
      serializeTags(updatedData);

    // Validate that all contactIds exist in the crms_m_contact table
    if (contact_ids && contact_ids.length > 0) {
      await validateContactsExist(contact_ids);
    }

    // Use transaction for atomicity
    const result = await prisma.$transaction(async (prisma) => {
      // Update campaign-contact mappings
      if (contact_ids && contact_ids.length) {
        // Delete existing mappings
        await prisma.CampaignContacts.deleteMany({
          where: { camp_id: parseInt(id) },
        });

        // Add new mappings
        const contactMappings = contact_ids.map((contactId) => ({
          camp_id: parseInt(id),
          contact_id: parseInt(contactId),
          createdDate: new Date(),
        }));
        await prisma.CampaignContacts.createMany({ data: contactMappings });
      }
      // Update the campaign
      const campaign = await prisma.crms_d_campaign.update({
        where: { id: parseInt(id) },
        data: {
          ...serializedData,
          campaign_user: {
            connect: { id: data.owner_id }, // instead of setting owner_id directly
          },
          ...(lead_ids &&
            lead_ids.length > 0 && {
              campaign_leads: {
                set: lead_ids.map((id) => ({ id })),
              },
            }),
        },
      });
      // Retrieve the updated campaign with campaignContacts and campaignHistory included
      const updatedCampaign = await prisma.crms_d_campaign.findUnique({
        where: { id: parseInt(id) },
        include: {
          campaign_contact: {
            select: {
              camp_contact: true,
            },
          },
          campaign_leads: true,
          campaign_user: true,
        },
      });

      return updatedCampaign;
    });

    return parseTags(result);
  } catch (error) {
    console.log("Updating error in campaign", error);
    throw new CustomError(`Error updating campaign: ${error.message}`, 500);
  }
};

// Find a campaign by its ID
const findCampaignById = async (id) => {
  try {
    const campaign = await prisma.crms_d_campaign.findUnique({
      where: { id: parseInt(id) },
      include: {
        campaign_contact: {
          select: {
            camp_contact: true,
          },
        },
        campaign_leads: true,
        campaign_user: true,
      },
    });
    return parseTags(campaign);
  } catch (error) {
    throw new CustomError("Error finding campaign by ID", 503);
  }
};

// Get all campaigns
const getAllCampaign = async (
  page,
  size,
  search,
  startDate,
  endDate,
  status
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
          campaign_contact: {
            some: {
              camp_contact: {
                firstName: { contains: search.toLowerCase() },
              }, // Include contact details
            },
          },
        },
        {
          campaign_user: {
            full_name: { contains: search.toLowerCase() },
          }, // Include contact details
        },
        {
          campaign_leads: {
            title: { contains: search.toLowerCase() },
          }, // Include contact details
        },
        {
          name: { contains: search.toLowerCase() },
        },
        {
          status: { contains: search.toLowerCase() },
        },
      ];
    }
    // if (status) {
    //   filters.is_active = { equals: status };
    // }

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
    const campaigns = await prisma.crms_d_campaign.findMany({
      where: filters,
      skip: skip,
      take: size,
      include: {
        campaign_contact: {
          select: {
            camp_contact: true,
          },
        },
        campaign_leads: true,
        campaign_user: true,
      },
      orderBy: [{ updatedDate: "desc" }, { createdDate: "desc" }],
    });
    const formattedDeals = campaigns.map((deal) => {
      const { campaign_contact, ...rest } = parseTags(deal); // Remove "deals" key
      const finalContact = campaign_contact.map((item) => item.camp_contact);
      return { ...rest, campaign_contact: finalContact }; // Rename "stages" to "deals"
    });
    const totalCount = await prisma.crms_d_campaign.count({
      where: filters,
    });
    return {
      data: formattedDeals,
      currentPage: page,
      size,
      totalPages: Math.ceil(totalCount / size),
      totalCount: totalCount,
    };
  } catch (error) {
    console.log("Error campaign get : ", error);
    throw new CustomError("Error retrieving campaigns", 503);
  }
};

const deleteCampaign = async (id) => {
  try {
    // Step 1: Delete related data from DealContacts
    await prisma.CampaignContacts.deleteMany({
      where: { camp_id: parseInt(id) },
    });

    // Step 2: Delete the deal
    await prisma.crms_d_campaign.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    console.log("Error to delete campaign : ", error);
    throw new CustomError(`Error deleting campaign: ${error.message}`, 500);
  }
};
module.exports = {
  createCampaign,
  findCampaignById,
  updateCampaign,
  getAllCampaign,
  deleteCampaign,
};

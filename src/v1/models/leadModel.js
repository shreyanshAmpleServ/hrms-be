const CustomError = require("../../utils/CustomError");
const { getPrisma } = require("../../config/prismaContext.js");

// Helper function to define fields returned for a lead

const getLeadWithReferences = async (leadId) => {
  const prisma = getPrisma();
  const lead = await prisma.crms_leads.findUnique({
    where: { id: parseInt(leadId) },
    select: {
      id: true,
      crms_m_user: {
        select: {
          id: true,
          full_name: true,
          email: true,
          phone: true,
          profile_img: true,
        },
      },
      crms_m_lost_reasons: {
        select: {
          id: true,
          name: true,
          colorCode: true,
        },
      },
      crms_m_sources: {
        select: {
          id: true,
          name: true,
        },
      },
      crms_m_industries: {
        select: {
          id: true,
          name: true,
        },
      },
      lead_company: {
        select: {
          id: true,
          name: true,
          logo: true,
        },
      },
      lead_Country: {
        select: { id: true, name: true, code: true },
      },
      lead_State: {
        select: { id: true, name: true },
      },
      company_icon: true,
      company_id: true,
      first_name: true,
      last_name: true,
      title: true,
      email: true,
      phone: true,
      fax: true,
      mobile: true,
      website: true,

      no_of_employees: true,
      annual_revenue: true,
      revenue_currency: true,
      rating: true,
      tags: true,
      email_opt_out: true,
      secondary_email: true,
      facebook_ac: true,
      skype_id: true,
      twitter_ac: true,
      linked_in_ac: true,
      whatsapp_ac: true,
      instagram_ac: true,
      street: true,
      city: true,
      state: true,
      zipcode: true,
      country: true,
      description: true,
      is_active: true,
      createdate: true,
      updatedate: true,
    },
  });

  if (!lead) throw new CustomError("Lead not found", 404);

  return lead;
};

// Create a new lead
const createLead = async (data) => {
  const prisma = getPrisma();
  try {
    const prisma = getPrisma();
    // Create the lead
    const lead = await prisma.crms_leads.create({
      data: {
        ...data,
        state: Number(data.state) || null,
        country: Number(data.country) || null,
        company_id: data.company_id || null,
        is_active: data.is_active || "Y",
        email_opt_out: data.email_opt_out || "N",
        createdby: data.createdby || 1,
        log_inst: data.log_inst || 1,
      },
      include: {
        crms_m_user: {
          select: {
            id: true,
            full_name: true,
            email: true,
            phone: true,
          },
        },
        crms_m_lost_reasons: {
          select: {
            id: true,
            name: true,
            colorCode: true,
          },
        },
        crms_m_sources: {
          select: {
            id: true,
            name: true,
          },
        },
        crms_m_industries: {
          select: {
            id: true,
            name: true,
          },
        },
        lead_company: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
        lead_Country: {
          select: { id: true, name: true, code: true },
        },
        lead_State: {
          select: { id: true, name: true },
        },
      },
    });

    // Return the lead with references
    return await getLeadWithReferences(lead.id);
  } catch (error) {
    console.log(error);
    throw new CustomError(`Error creating lead: ${error.message}`, 500);
  }
};

// Update a lead and its references
const updateLead = async (id, data) => {
  const prisma = getPrisma();
  try {
    const prisma = getPrisma();
    // Update lead fields
    const updateData = data;
    if (data?.lead_status_update) {
      updateData.lead_status = data.lead_status;
    }
    const updatedLead = await prisma.crms_leads.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        state: Number(data.state) || null,
        country: Number(data.country) || null,
        is_active: data.is_active || "Y",
        updatedate: new Date(),
        email_opt_out: data.email_opt_out || "N",
        createdby: data.createdby || 1,
        log_inst: data.log_inst || 1,
      },
      include: {
        crms_m_user: {
          select: {
            id: true,
            full_name: true,
            email: true,
            phone: true,
          },
        },
        crms_m_lost_reasons: {
          select: {
            id: true,
            name: true,
            colorCode: true,
          },
        },
        crms_m_sources: {
          select: {
            id: true,
            name: true,
          },
        },
        crms_m_industries: {
          select: {
            id: true,
            name: true,
          },
        },
        lead_company: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
        lead_Country: {
          select: { id: true, name: true, code: true },
        },
        lead_State: {
          select: { id: true, name: true },
        },
      },
    });

    // Return the updated lead with references
    return await getLeadWithReferences(updatedLead.id);
  } catch (error) {
    console.log(error);
    throw new CustomError(`Error updating lead: ${error.message}`, 500);
  }
};

// Find a lead by email and include references
const findLeadByEmail = async (email) => {
  const prisma = getPrisma();
  try {
    const lead = await prisma.crms_leads.findFirst({
      where: { email },
    });

    if (!lead) throw new CustomError("Lead not found", 404);

    return await getLeadWithReferences(lead.id);
  } catch (error) {
    console.log(error);
    throw new CustomError(`Error finding lead by email: ${error.message}`, 503);
  }
};

// Find a lead by ID and include references
const findLeadById = async (id) => {
  try {
    return await getLeadWithReferences(parseInt(id));
  } catch (error) {
    throw new CustomError(`Error finding lead by ID: ${error.message}`, 503);
  }
};

// Delete a lead
const deleteLead = async (id) => {
  const prisma = getPrisma();
  try {
    const prisma = getPrisma();
    await prisma.crms_leads.delete({
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

// Get all leads and include their references
const getAllLeads = async (page, size, search, startDate, endDate, status) => {
  const prisma = getPrisma();
  try {
    page = !page || page == 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size || 0;

    const filters = {};
    // Handle search
    if (search) {
      filters.OR = [
        {
          lead_company: {
            name: { contains: search.toLowerCase() },
          },
        },
        {
          crms_m_user: {
            full_name: { contains: search.toLowerCase() },
          },
        },
        {
          first_name: { contains: search.toLowerCase() },
        },
        {
          last_name: { contains: search.toLowerCase() },
        },
        {
          title: { contains: search.toLowerCase() },
        },
      ];
    }
    if (status) {
      filters.lead_status = { equals: Number(status) };
    }
    // if(priority){filters.priority = {equals :priority} }

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
    const leads = await prisma.crms_leads.findMany({
      where: filters,
      skip: skip,
      take: size,
      include: {
        crms_m_user: {
          select: {
            id: true,
            full_name: true,
            email: true,
            phone: true,
          },
        },
        crms_m_lost_reasons: {
          select: {
            id: true,
            name: true,
            colorCode: true,
          },
        },
        crms_m_sources: {
          select: {
            id: true,
            name: true,
          },
        },
        crms_m_industries: {
          select: {
            id: true,
            name: true,
          },
        },
        lead_company: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
        lead_Country: {
          select: { id: true, name: true, code: true },
        },
        lead_State: {
          select: { id: true, name: true },
        },
      },
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
    });
    // const totalCount = await prisma.crms_leads.count();
    const totalCount = await prisma.crms_leads.count();

    return {
      data: leads,
      currentPage: page,
      size,
      totalPages: Math.ceil(totalCount / size),
      totalCount: totalCount,
    };
  } catch (error) {
    console.log("Error in modal of Leads :", error);
    throw new CustomError("Error retrieving leads", 503);
  }
};

// Get all leads grouped by lost reasons
const getAllLeadsGroupedByLostReasons = async () => {
  try {
    const prisma = getPrisma();
    const leads = await prisma.LostReasons.findMany({
      select: {
        id: true,
        name: true,
        colorCode: true,
        crms_leads: {
          select: {
            id: true,
            company_id: true,
            first_name: true,
            last_name: true,
            email: true,
            phone: true,
            title: true,
            annual_revenue: true,
            street: true,
            city: true,
            state: true,
            zipcode: true,
            country: true,
            is_active: true,
            createdate: true,
            updatedate: true,
          },
        },
      },
      orderBy: {
        order: "asc", // Orders by name in ascending order
      },
    });

    return leads.map((lostReason) => {
      const total_lead = lostReason.crms_leads.length;
      const total_revenue = lostReason.crms_leads.reduce(
        (sum, lead) => sum + (lead.annual_revenue || 0),
        0
      );

      return {
        ...lostReason,
        total_lead,
        total_revenue,
      };
    });
  } catch (error) {
    console.log(error);
    throw new CustomError(
      `Error retrieving leads grouped by lost reasons: ${error.message}`,
      503
    );
  }
};

module.exports = {
  createLead,
  findLeadByEmail,
  findLeadById,
  updateLead,
  deleteLead,
  getAllLeads,
  getAllLeadsGroupedByLostReasons, // Export the new function
};

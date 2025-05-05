const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const prisma = new PrismaClient();

// Serialize `socialProfiles` before saving it
const serializeSocialProfiles = (data) => {
  if (data.socialProfiles) {
    data.socialProfiles = JSON.stringify(data.socialProfiles);
  }
  return data;
};

// Parse `socialProfiles` after retrieving it
const parseSocialProfiles = (contact) => {
  if (contact && contact.socialProfiles) {
    contact.socialProfiles = JSON.parse(contact.socialProfiles);
  }
  return contact;
};

const createContact = async (data) => {
  try {
    const serializedData = serializeSocialProfiles(data);

    const contact = await prisma.crms_m_contact.create({
      data: {
        ...serializedData,
        is_active: serializedData.is_active || "Y",
        log_inst: serializedData.log_inst || 1,
        state: Number(serializedData.state) || null,
        country: Number(serializedData.country) || null,
        createdate: new Date(),
        updatedate: new Date(),
      },
      include: {
        company_details: true,
        owner_details: true,
        deal_details: true,
        source_details: true,
        industry_details: true,
        contact_State: {
          select: {
            id: true,
            name: true,
          },
        },
        contact_Country: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });
    return parseSocialProfiles(contact);
  } catch (error) {
    console.log("Create Contact", error);
    throw new CustomError(`Error creating contact: ${error.message}`, 500);
  }
};

const findContactById = async (id) => {
  try {
    const contact = await prisma.crms_m_contact.findUnique({
      where: { id: parseInt(id) },
      include: {
        company_details: true,
        owner_details: true,
        deal_details: true,
        source_details: true,
        industry_details: true,
        contact_State: {
          select: {
            id: true,
            name: true,
          },
        },
        contact_Country: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });
    return parseSocialProfiles(contact);
  } catch (error) {
    throw new CustomError("Error finding contact by ID", 503);
  }
};

const findContactByEmail = async (email) => {
  try {
    const contact = await prisma.crms_m_contact.findFirst({
      where: { email },
      include: {
        company_details: true,
        owner_details: true,
        deal_details: true,
        source_details: true,
        industry_details: true,
        contact_State: {
          select: {
            id: true,
            name: true,
          },
        },
        contact_Country: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });
    return parseSocialProfiles(contact);
  } catch (error) {
    throw new CustomError("Error finding contact by email", 503);
  }
};

const updateContact = async (id, data) => {
  try {
    // Add a date field with the current timestamp
    const updatedData = {
      ...data,
      updatedate: new Date(), // Add or update the date field
    };
    const serializedData = serializeSocialProfiles(updatedData);
    const contact = await prisma.crms_m_contact.update({
      where: { id: parseInt(id) },
      data:  {
        ...serializedData,
        state: Number(serializedData.state) || null,
        country: Number(serializedData.country) || null,
        updatedate: new Date(),
      },
      include: {
        contact_State: {
          select: {
            id: true,
            name: true,
          },
        },
        contact_Country: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });
    return parseSocialProfiles(contact);
  } catch (error) {
    console.log("Update Contact Error : ", error);
    throw new CustomError(`Error updating contact: ${error.message}`, 500);
  }
};

const deleteContact = async (id) => {
  try {
    // Delete dependent rows in crms_d_deal_contacts
    await prisma.dealContacts.deleteMany({
      where: { contactId: parseInt(id) },
    });

    await prisma.crms_m_contact.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    throw new CustomError(`Error deleting contact: ${error.message}`, 500);
  }
};

const getAllContacts = async (search ,page , size ,startDate, endDate) => {
  try {
    page = page || 1 ;
    size = size || 10;
    const skip = (page - 1) * size;
    const filters = {};
    // Handle search
    if (search) {
      filters.OR = [
        {
          firstName: {
            contains: search,
          },
        },
        {
          lastName: {
            contains: search,
          },
        },
      ];
    }
    // Handle date filtering
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
    const contacts = await prisma.crms_m_contact.findMany({
      where: filters,
      skip,
      take: size,
      include: {
        company_details: true,
        owner_details: true,
        deal_details: true,
        source_details: true,
        industry_details: true,
        contact_State: {
          select: {
            id: true,
            name: true,
          },
        },
        contact_Country: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
      orderBy: [
        { createdate: "desc" }, // Then sort by createdate in descending order
        { updatedate: "desc" }, // Sort by updatedate in descending order
      ],
    });
    const totalCount = await prisma.crms_m_contact.count();

    return {
      data: contacts,
      currentPage: page,
      size,
      totalPages: Math.ceil(totalCount / size),
      totalCount : totalCount  ,
    };
  } catch (error) {
    console.log("Error", error);
    throw new CustomError("Error retrieving contacts", 503);
  }
};

module.exports = {
  createContact,
  findContactById,
  findContactByEmail,
  updateContact,
  deleteContact,
  getAllContacts,
};

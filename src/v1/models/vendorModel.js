const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const prisma = new PrismaClient();

// Helper function to define fields returned for a user
const getUserFields = (is_password = false) => ({
  id: true,
  username: true,
  email: true,
  password: is_password,
  full_name: true,
  phone: true,
  address: true,
  profile_img: true,
  is_active: true,
  createdate: true,
  updatedate: true,
});

// Common method to fetch a user with role name
const getUserWithRole = async (userId, is_password = false) => {
  const user = await prisma.crms_m_vendor.findUnique({
    where: { id: userId },
    select: {
      ...getUserFields(is_password),
      crms_d_user_role: {
        select: {
          crms_m_role: {
            select: {
              role_name: true,
              id: true,
            },
          },
        },
      },
    },
  });

  if (!user) throw new CustomError("User not found", 404);

  return {
    ...user,
    role: user.crms_d_user_role?.[0]?.crms_m_role?.role_name || null,
    role_id: user.crms_d_user_role?.[0]?.crms_m_role?.id || null,
  };
};

// Create a new Vendor
const createVendor = async (data) => {
  try {
    // Create the Vendor
    const user = await prisma.crms_m_vendor.create({
      data: {
        ...data,
        account_owner: Number(data?.account_owner),
        is_active: data.is_active || "Y",
        log_inst: data.log_inst || 1,
        billing_state: Number(data.billing_state) || null,
        billing_country: Number(data.billing_country) || null,
        createdate: new Date(),
        updatedate: new Date(),
        updatedby: data.createdby || 1,
        createdby: data.createdby || 1,
      },
      include: {
        crms_m_user: {
          select: {
            full_name: true,
            id: true,
          },
        },
      },
    });
    return user;
  } catch (error) {
    console.log("Creating Vendor Error : ", error);
    throw new CustomError(`Error creating Vendor: ${error.message}`, 500);
  }
};

// Update a Vendor
const updateVendor = async (id, data) => {
  try {
    const updatedVendor = await prisma.crms_m_vendor.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        billing_state: Number(data.billing_state) || null,
        billing_country: Number(data.billing_country) || null,
        account_owner: Number(data?.account_owner),
        updatedate: new Date(),
      },
      include: {
        crms_m_user: {
          select: {
            full_name: true,
            id: true,
          },
        },
      },
    });

    return updatedVendor;
  } catch (error) {
    console.log("Vendor uUpdate error : ", error);
    throw new CustomError(`Error updating user: ${error.message}`, 500);
  }
};

// Find a user by email and include role
const findUserByEmail = async (email) => {
  try {
    const user = await prisma.crms_m_vendor.findFirst({
      where: { email },
    });

    if (!user) throw new CustomError("User not found", 404);

    return await getUserWithRole(user.id, true);
  } catch (error) {
    console.log(error);
    throw new CustomError(`Error finding user by email: ${error.message}`, 503);
  }
};

// Find a user by ID and include role
const findVendorById = async (id) => {
  try {
    const users = await prisma.crms_m_vendor.findUnique({
      where: { id: parseInt(id) },
      include: {
        crms_m_user: {
          select: {
            full_name: true,
            id: true,
          },
        },
        state: {
          select: {
            id: true,
            name: true,
          },
        },
        country: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });
    return users;
  } catch (error) {
    console.log("Error in Details of Vendor ", error);
    throw new CustomError(`Error finding user by ID: ${error.message}`, 503);
  }
};

// Delete a Vendor
const deleteVendor = async (id) => {
  try {
    await prisma.crms_m_vendor.delete({
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

// Get all users and include their roles
const getAllVendors = async (search, page, size, startDate, endDate) => {
  try {
    page = page || 1;
    size = size || 10;
    const skip = (page - 1) * size;

    const filters = {};

    // Handle search
    if (search) {
      filters.OR = [
        {
          crms_m_user: {
            full_name: { contains: search, mode: "insensitive" },
          },
        },
        {
          phone: { contains: search, mode: "insensitive" },
        },
        {
          email: { contains: search, mode: "insensitive" },
        },
        {
          name: { contains: search, mode: "insensitive" },
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

    const users = await prisma.crms_m_vendor.findMany({
      where: filters,
      skip,
      take: size,
      include: {
        crms_m_user: {
          select: {
            full_name: true,
            id: true,
          },
        },
        state: {
          select: {
            id: true,
            name: true,
          },
        },
        country: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
    });

    const totalCount = await prisma.crms_m_vendor.count();

    return {
      data: users,
      currentPage: page,
      size,
      totalPages: Math.ceil(totalCount / size),
      totalCount: totalCount,
    };
  } catch (error) {
    console.log("Error in vedor get : ", error);
    throw new CustomError("Error retrieving vendor", 503);
  }
};

module.exports = {
  createVendor,
  findUserByEmail,
  findVendorById,
  updateVendor,
  deleteVendor,
  getAllVendors,
};

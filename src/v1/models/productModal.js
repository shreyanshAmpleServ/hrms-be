const { prisma } = require("../../utils/prismaProxy");
const CustomError = require("../../utils/CustomError");

// Create a new Product
const createProduct = async (data) => {
  try {
    // Create the Product
    const user = await prisma.crms_m_products.create({
      data: {
        ...data,
        tax_id: Number(data?.tax_id) || null,
        vendor_id: Number(data?.vendor_id) || null,
        manufacturer_id: Number(data?.manufacturer_id) || null,
        ordered: Number(data?.ordered) || null,
        currency: Number(data?.currency) || null,
        is_active: data.is_active || "Y",
        log_inst: data.log_inst || 1,
        createdate: new Date(),
        updatedate: new Date(),
        updatedby: data.createdby || 1,
        createdby: data.createdby || 1,
      },
      include: {
        vendor: {
          select: {
            name: true,
            id: true,
          },
        },
        manufacturer: {
          select: {
            name: true,
            id: true,
          },
        },
        Currency: {
          select: {
            name: true,
            id: true,
            code: true,
          },
        },
      },
    });
    return user;
  } catch (error) {
    console.log("Error to create product : ", error);
    throw new CustomError(`Error creating Product: ${error.message}`, 500);
  }
};

// Update a Product
const updateProduct = async (id, data) => {
  try {
    const updatedProduct = await prisma.crms_m_products.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        tax_id: Number(data?.tax_id) || null,
        vendor_id: Number(data?.vendor_id),
        manufacturer_id: Number(data?.manufacturer_id),
        currency: Number(data?.currency) || null,
        updatedate: new Date(),
      },
      include: {
        vendor: {
          select: {
            name: true,
            id: true,
          },
        },
        manufacturer: {
          select: {
            name: true,
            id: true,
          },
        },
        Currency: {
          select: {
            name: true,
            id: true,
            code: true,
          },
        },
      },
    });

    return updatedProduct;
  } catch (error) {
    console.log("Product uUpdate error : ", error);
    throw new CustomError(`Error updating user: ${error.message}`, 500);
  }
};

// Find a user by ID and include role
const findProductById = async (id) => {
  try {
    const users = await prisma.crms_m_products.findUnique({
      where: { id: parseInt(id) },
      include: {
        vendor: {
          select: {
            name: true,
            id: true,
          },
        },
        manufacturer: {
          select: {
            name: true,
            id: true,
          },
        },
        Currency: {
          select: {
            name: true,
            code: true,
            id: true,
          },
        },
      },
    });
    return users;
  } catch (error) {
    console.log("Error in Details of Product ", error);
    throw new CustomError(`Error finding user by ID: ${error.message}`, 503);
  }
};

// Delete a Product
const deleteProduct = async (id) => {
  try {
    await prisma.crms_m_products.delete({
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
// const getAllProduct = async () => {
//   try {
//     const users = await prisma.crms_m_products.findMany({
//       include:{
//         vendor:{
//           select:{
//             name:true,
//             id:true
//           }
//         },
//         manufacturer:{
//           select:{
//             name:true,
//             id:true
//           }
//         },
//         Currency:{
//           select:{
//             name:true,
//             code:true,
//             id:true
//           }
//         },
//       },
//       orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
//     });

//     // Fetch roles for each user
//     return users;
//   } catch (error) {
//     throw new CustomError("Error retrieving users", 503);
//   }
// };
const getAllProduct = async (search, page, size, startDate, endDate) => {
  try {
    page = page || 1;
    size = size || 10;
    const skip = (page - 1) * size;

    const filters = {};
    // Handle search
    if (search) {
      filters.OR = [
        {
          vendor: {
            name: { contains: search.toLowerCase() },
          },
        },
        {
          manufacturer: {
            name: { contains: search.toLowerCase() },
          },
        },
        {
          code: { contains: search.toLowerCase() },
        },
        {
          name: { contains: search.toLowerCase() },
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

    const products = await prisma.crms_m_products.findMany({
      where: filters,
      skip,
      take: size,
      include: {
        vendor: {
          select: {
            name: true,
            id: true,
          },
        },
        manufacturer: {
          select: {
            name: true,
            id: true,
          },
        },
        Currency: {
          select: {
            name: true,
            code: true,
            id: true,
          },
        },
      },
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
    });

    const totalCount = await prisma.crms_m_products.count();

    return {
      data: products,
      currentPage: page,
      size,
      totalPages: Math.ceil(totalCount / size),
      totalCount: totalCount,
    };
  } catch (error) {
    throw new CustomError("Error retrieving products", 503);
  }
};

module.exports = {
  createProduct,
  findProductById,
  updateProduct,
  deleteProduct,
  getAllProduct,
};

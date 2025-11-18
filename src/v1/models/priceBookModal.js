const { prisma } = require("../../utils/prismaProxy.js");
const CustomError = require("../../utils/CustomError");

// Create a new price book
const createPriceBook = async (orderData, orderItemsData) => {
  try {
    console.log("Modal of Create price book : ", orderData);
    const result = await prisma.$transaction(async (prisma) => {
      // Step 1: Create the Order
      const createdPriceBook = await prisma.crms_m_pricebook.create({
        data: {
          ...orderData,
          is_active: "Y",
          createdate: new Date(),
          updatedate: new Date(),
          updatedby: orderData.createdby || 1,
          updatedby: orderData.createdby || 1,
        },
      });
      // Step 2: Create OrderItems using the created order's ID
      const orderItems = await prisma.crms_m_pricebook_details.createMany({
        data: orderItemsData.map((item) => ({
          ...item,
          parent_id: Number(createdPriceBook.id),
        })),
      });

      // Fetch the newly created order with associated data
      const priceBookWithDetails = await prisma.crms_m_pricebook.findUnique({
        where: { id: createdPriceBook.id },
        include: {
          price_book_details: true,
        },
      });

      return priceBookWithDetails;
    });

    return result;
  } catch (error) {
    console.error("Transaction failed:", error);
    throw new Error("Failed to create price book");
  }
};

// Update a quotation
const updatePriceBook = async (orderId, orderData, orderItemsData) => {
  try {
    const result = await prisma.$transaction(async (prisma) => {
      // Step 1: Update the Order
      const updatedOrder = await prisma.crms_m_pricebook.update({
        where: { id: Number(orderId) },
        data: {
          ...orderData,
          is_active: "Y",
          updatedate: new Date(),
          updatedby: orderData?.updatedby || 1,
        },
      });

      // Step 2: Delete existing OrderItems for this order (if necessary)
      await prisma.crms_m_pricebook_details.deleteMany({
        where: { parent_id: Number(orderId) },
      });

      // Step 3: Insert the updated OrderItems
      const orderItems = await prisma.crms_m_pricebook_details.createMany({
        data: orderItemsData.map((item) => ({
          ...item,
          parent_id: Number(orderId),
        })),
      });

      // Fetch the newly created order with associated data
      const orderWithDetails = await prisma.crms_m_pricebook.findUnique({
        where: { id: updatedOrder.id },
        include: {
          price_book_details: true,
        },
      });

      return orderWithDetails;
    });

    return result;
  } catch (error) {
    console.error("Transaction failed:", error);
    throw new Error("Failed to update price book");
  }
};

// Find a quotation by ID
const findPriceBookById = async (id) => {
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

// Delete a Order
const deletePriceBook = async (orderId) => {
  try {
    const result = await prisma.$transaction(async (prisma) => {
      // Delete Order Items first
      await prisma.crms_m_pricebook_details.deleteMany({
        where: { parent_id: Number(orderId) },
      });

      // Delete the Order
      const deletedOrder = await prisma.crms_m_pricebook.delete({
        where: { id: Number(orderId) },
      });

      return deletedOrder;
    });

    return result;
  } catch (error) {
    throw new Error("Failed to delete price book");
  }
};

const getAllPriceBook = async (search, page, size, startDate, endDate) => {
  try {
    page = page || 1;
    size = size || 10;
    const skip = (page - 1) * size;

    const filters = {};

    // Handle search
    if (search) {
      filters.OR = [{ name: { contains: search.toLowerCase() } }];
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

    const priceBooks = await prisma.crms_m_pricebook.findMany({
      where: filters,
      skip,
      take: size,
      include: {
        price_book_details: true, // Include the related order items
      },
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
    });

    const totalCount = await prisma.crms_m_pricebook.count();

    return {
      data: priceBooks,
      currentPage: page,
      size,
      totalPages: Math.ceil(totalCount / size),
      totalCount: totalCount,
    };
  } catch (error) {
    console.log("Error price books Modal : ", error);
    throw new CustomError("Error retrieving price books", 503);
  }
};
module.exports = {
  createPriceBook,
  findPriceBookById,
  updatePriceBook,
  deletePriceBook,
  getAllPriceBook,
};

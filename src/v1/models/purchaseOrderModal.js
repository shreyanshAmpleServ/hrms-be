const CustomError = require("../../utils/CustomError");
const { getPrisma } = require("../../config/prismaContext.js");

// Create a new  Purchase Order
const createPurchaseOrder = async (orderData, orderItemsData) => {
  const prisma = getPrisma();
  try {
    const prisma = getPrisma();
    const result = await prisma.$transaction(async () => {
      // Step 1: Create the Order
      const createdOrder = await prisma.crms_d_purchase_orders.create({
        data: {
          ...orderData,
          cust_id: Number(orderData?.cust_id) || null,
          currency: Number(orderData?.currency) || null,
          sales_type: Number(orderData?.sales_type) || null,
          rounding_amount: Number(orderData?.rounding_amount) || null,
          createdate: new Date(),
          updatedate: new Date(),
          updatedby: orderData.createdby || 1,
          updatedby: orderData.createdby || 1,
        },
      });
      console.log("Created Order : ", createdOrder);
      // Step 2: Create OrderItems using the created order's ID
      const orderItems = await prisma.crms_d_purchase_order_items.createMany({
        data: orderItemsData.map((item) => ({
          ...item,
          item_id: Number(item?.item_id) || null,
          tax_id: Number(item?.tax_id) || null,
          parent_id: Number(createdOrder.id),
        })),
      });

      // Fetch the newly created order with associated data
      const orderWithDetails = await prisma.crms_d_purchase_orders.findUnique({
        where: { id: createdOrder.id },
        include: {
          purchase_order_items: true,
          purchase_order_vendor: {
            select: {
              id: true,
              name: true,
              email: true,
              billing_zipcode: true,
              billing_city: true,
              country: true,
              state: true,
              billing_street: true,
            },
          },
          purchase_order_currency: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      });

      return orderWithDetails;
    });

    return result;
  } catch (error) {
    console.error("Transaction failed:", error);
    throw new Error("Failed to create purchase order and order items");
  }
};

// Update a Purchase Order
const updatePurchaseOrder = async (orderId, orderData, orderItemsData) => {
  const prisma = getPrisma();
  try {
    const prisma = getPrisma();
    const result = await prisma.$transaction(async () => {
      // Step 1: Update the Order
      const updatedOrder = await prisma.crms_d_purchase_orders.update({
        where: { id: Number(orderId) },
        data: {
          ...orderData,
          cust_id: orderData?.cust_id ? Number(orderData.cust_id) : null,
          currency: orderData?.currency ? Number(orderData.currency) : null,
          sales_type: orderData?.sales_type
            ? Number(orderData.sales_type)
            : null,
          rounding_amount: orderData?.rounding_amount
            ? Number(orderData.rounding_amount)
            : null,
          updatedate: new Date(),
          updatedby: orderData?.updatedby || 1,
        },
      });

      // Step 2: Delete existing OrderItems for this order (if necessary)
      await prisma.crms_d_purchase_order_items.deleteMany({
        where: { parent_id: Number(orderId) },
      });

      // Step 3: Insert the updated OrderItems
      const orderItems = await prisma.crms_d_purchase_order_items.createMany({
        data: orderItemsData.map((item) => ({
          ...item,
          item_id: Number(item?.item_id) || null,
          tax_id: Number(item?.tax_id) || null,
          parent_id: Number(orderId),
        })),
      });
      // Fetch the newly created order with associated data
      const orderWithDetails = await prisma.crms_d_purchase_orders.findUnique({
        where: { id: updatedOrder.id },
        include: {
          purchase_order_items: true,
          purchase_order_vendor: {
            select: {
              id: true,
              name: true,
              email: true,
              billing_zipcode: true,
              billing_city: true,
              country: true,
              state: true,
              billing_street: true,
            },
          },
          purchase_order_currency: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      });

      return orderWithDetails;
    });

    return result;
  } catch (error) {
    console.error("Transaction failed:", error);
    throw new Error("Failed to update purchase order and order items");
  }
};

// Find a Order by ID
const findPurchaseOrderById = async (id) => {
  const prisma = getPrisma();
  try {
    const prisma = getPrisma();
    const users = await prisma.crms_d_purchase_orders.findUnique({
      where: { id: parseInt(id) },
      include: {
        purchase_order_items: true, // Include the related order items
        purchase_order_vendor: {
          select: {
            id: true,
            name: true,
            email: true,
            billing_zipcode: true,
            billing_city: true,
            country: true,
            state: true,
            billing_street: true,
          },
        },
        purchase_order_currency: {
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
    console.log("Error in Details of Product ", error);
    throw new CustomError(`Error finding user by ID: ${error.message}`, 503);
  }
};

// Delete a Order
const deletePurchaseOrder = async (orderId) => {
  const prisma = getPrisma();
  try {
    const prisma = getPrisma();
    const result = await prisma.$transaction(async () => {
      // Delete Order Items first
      await prisma.crms_d_purchase_order_items.deleteMany({
        where: { parent_id: Number(orderId) },
      });

      // Delete the Order
      const deletedOrder = await prisma.crms_d_purchase_orders.delete({
        where: { id: Number(orderId) },
      });

      return deletedOrder;
    });

    return result;
  } catch (error) {
    console.error("Failed to delete purchase order and order items:", error);
    throw new Error("Failed to delete purchase order and associated items");
  }
};
const getAllPurchaseOrder = async (search, page, size, startDate, endDate) => {
  const prisma = getPrisma();
  try {
    page = page || 1;
    size = size || 10;
    const skip = (page - 1) * size;
    const filters = {};
    // Handle search
    if (search) {
      filters.OR = [
        {
          purchase_order_vendor: {
            name: { contains: search.toLowerCase() },
          },
        },
        {
          order_code: { contains: search.toLowerCase() },
        },
        {
          shipto: { contains: search.toLowerCase() },
        },
        {
          billto: { contains: search.toLowerCase() },
        },
        {
          cont_person: { contains: search.toLowerCase() },
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
    const orders = await prisma.crms_d_purchase_orders.findMany({
      where: filters,
      skip,
      take: size,
      include: {
        purchase_order_items: true, // Include the related order items
        purchase_order_vendor: {
          select: {
            id: true,
            name: true,
            email: true,
            billing_zipcode: true,
            billing_city: true,
            country: true,
            state: true,
            billing_street: true,
          },
        },
        purchase_order_currency: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
    });

    const totalCount = await prisma.crms_d_purchase_orders.count();

    return {
      data: orders,
      currentPage: page,
      size,
      totalPages: Math.ceil(totalCount / size),
      totalCount: totalCount,
    };
  } catch (error) {
    console.log("Error Order Modal : ", error);
    throw new CustomError("Error retrieving purchase order", 503);
  }
};

// Generate Order Code
const generatePurchaseOrderCode = async () => {
  const prisma = getPrisma();
  try {
    const prisma = getPrisma();
    const latestOrder = await prisma.crms_d_purchase_orders.findFirst({
      orderBy: { id: "desc" },
    });
    const nextId = latestOrder ? latestOrder.id + 1 : 1;
    return `PO-00${nextId}`;
  } catch (error) {
    console.log("Error to generation purchase order code : ", error);
    throw new CustomError("Error retrieving purchase order code", 503);
  }
};
module.exports = {
  createPurchaseOrder,
  updatePurchaseOrder,
  deletePurchaseOrder,
  findPurchaseOrderById,
  getAllPurchaseOrder,
  generatePurchaseOrderCode,
};

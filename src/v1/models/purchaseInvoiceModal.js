const { prisma } = require("../../utils/prismaProxy");
const CustomError = require("../../utils/CustomError");

// Create a new  Purchase invoice
const createPurchaseInvoice = async (orderData, orderItemsData) => {
  try {
    const result = await prisma.$transaction(async (prisma) => {
      // Step 1: Create the Order
      const createdOrder = await prisma.crms_d_purchase_invoice.create({
        data: {
          ...orderData,
          cust_id: Number(orderData?.cust_id) || null,
          currency: Number(orderData?.currency) || null,
          sales_type: Number(orderData?.sales_type) || null,
          rounding_amount: Number(orderData?.rounding_amount) || null,
          // due_date:  null,
          createdate: new Date(),
          updatedate: new Date(),
          updatedby: orderData.createdby || 1,
          updatedby: orderData.createdby || 1,
        },
      });
      // Step 2: Create OrderItems using the created order's ID
      const orderItems = await prisma.crms_d_purchase_invoice_items.createMany({
        data: orderItemsData.map((item) => ({
          ...item,
          item_id: Number(item?.item_id) || null,
          tax_id: Number(item?.tax_id) || null,
          parent_id: Number(createdOrder.id),
        })),
      });

      // Fetch the newly created order with associated data
      const orderWithDetails = await prisma.crms_d_purchase_invoice.findUnique({
        where: { id: createdOrder.id },
        include: {
          purchase_invoice_items: true,
          purchase_invoice_vendor: {
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
          purchase_invoice_currency: {
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
    throw new Error("Failed to create purchase invoice and order items");
  }
};

// Update a Purchase invoice
const updatePurchaseInvoice = async (orderId, orderData, orderItemsData) => {
  try {
    const result = await prisma.$transaction(async (prisma) => {
      // Step 1: Update the Order
      const updatedOrder = await prisma.crms_d_purchase_invoice.update({
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
      await prisma.crms_d_purchase_invoice_items.deleteMany({
        where: { parent_id: Number(orderId) },
      });

      // Step 3: Insert the updated OrderItems
      const orderItems = await prisma.crms_d_purchase_invoice_items.createMany({
        data: orderItemsData.map((item) => ({
          ...item,
          item_id: Number(item?.item_id) || null,
          tax_id: Number(item?.tax_id) || null,
          parent_id: Number(orderId),
        })),
      });

      // Fetch the newly created order with associated data
      const orderWithDetails = await prisma.crms_d_purchase_invoice.findUnique({
        where: { id: updatedOrder.id },
        include: {
          purchase_invoice_items: true,
          purchase_invoice_vendor: {
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
          purchase_invoice_currency: {
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
    throw new Error("Failed to update purchase invoice and order items");
  }
};

// Find a Order by ID
const findPurchaseInvoiceById = async (id) => {
  try {
    const users = await prisma.crms_d_purchase_invoice.findUnique({
      where: { id: parseInt(id) },
      include: {
        purchase_invoice_items: true, // Include the related order items
        purchase_invoice_vendor: {
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
        purchase_invoice_currency: {
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
const deletePurchaseInvoice = async (orderId) => {
  try {
    const result = await prisma.$transaction(async (prisma) => {
      // Delete Order Items first
      await prisma.crms_d_purchase_invoice_items.deleteMany({
        where: { parent_id: Number(orderId) },
      });

      // Delete the Order
      const deletedOrder = await prisma.crms_d_purchase_invoice.delete({
        where: { id: Number(orderId) },
      });

      return deletedOrder;
    });

    return result;
  } catch (error) {
    console.error("Failed to delete purchase invoice and order items:", error);
    throw new Error("Failed to delete purchase invoice and associated items");
  }
};

const getAllPurchaseInvoice = async (
  search,
  page,
  size,
  startDate,
  endDate
) => {
  try {
    page = page || 1;
    size = size || 10;
    const skip = (page - 1) * size;
    const filters = {};
    // Handle search
    if (search) {
      filters.OR = [
        {
          purchase_invoice_vendor: {
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
    const orders = await prisma.crms_d_purchase_invoice.findMany({
      where: filters,
      skip,
      take: size,
      include: {
        purchase_invoice_items: true, // Include the related order items
        purchase_invoice_vendor: {
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
        purchase_invoice_currency: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
    });

    const totalCount = await prisma.crms_d_purchase_invoice.count();

    return {
      data: orders,
      currentPage: page,
      size,
      totalPages: Math.ceil(totalCount / size),
      totalCount: totalCount,
    };
  } catch (error) {
    console.log("Error Order Modal : ", error);
    throw new CustomError("Error retrieving purchase invoice", 503);
  }
};

// Get Sales Type
const getSalesType = async () => {
  try {
    const notes = await prisma.crms_d_sales_types.findMany();
    return notes;
  } catch (error) {
    throw new CustomError("Error retrieving Sales Type", 503);
  }
};
// Generate Order Code
const generatePurchaseInvoiceCode = async () => {
  try {
    const latestOrder = await prisma.crms_d_purchase_invoice.findFirst({
      orderBy: { id: "desc" },
    });
    const nextId = latestOrder ? latestOrder.id + 1 : 1;
    return `PINV-00${nextId}`;
  } catch (error) {
    console.log("Error to generation purchase invoice code : ", error);
    throw new CustomError("Error retrieving purchase invoice code", 503);
  }
};

module.exports = {
  createPurchaseInvoice,
  updatePurchaseInvoice,
  deletePurchaseInvoice,
  getAllPurchaseInvoice,
  findPurchaseInvoiceById,
  generatePurchaseInvoiceCode,
};

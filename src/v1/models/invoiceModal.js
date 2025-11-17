const { prisma } = require("../../utils/prismaProxy");
const CustomError = require("../../utils/CustomError");

// Create a new  invoice
const createInvoice = async (orderData, orderItemsData) => {
  try {
    const result = await prisma.$transaction(async (prisma) => {
      // Step 1: Create the Order
      const createdOrder = await prisma.crms_d_invoice.create({
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
      // Step 2: Create OrderItems using the created order's ID
      const orderItems = await prisma.crms_d_invoice_items.createMany({
        data: orderItemsData.map((item) => ({
          ...item,
          item_id: Number(item?.item_id) || null,
          tax_id: Number(item?.tax_id) || null,
          parent_id: Number(createdOrder.id),
        })),
      });

      // Fetch the newly created order with associated data
      const orderWithDetails = await prisma.crms_d_invoice.findUnique({
        where: { id: createdOrder.id },
        include: {
          invoice_items: true,
          invoice_vendor: {
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
          invoice_currency: {
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
    throw new Error("Failed to create invoice and order items");
  }
};

// Update a invoice
const updateInvoice = async (orderId, orderData, orderItemsData) => {
  try {
    const result = await prisma.$transaction(async (prisma) => {
      // Step 1: Update the Order
      const updatedOrder = await prisma.crms_d_invoice.update({
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
      await prisma.crms_d_invoice_items.deleteMany({
        where: { parent_id: Number(orderId) },
      });

      // Step 3: Insert the updated OrderItems
      const orderItems = await prisma.crms_d_invoice_items.createMany({
        data: orderItemsData.map((item) => ({
          ...item,
          item_id: Number(item?.item_id) || null,
          tax_id: Number(item?.tax_id) || null,
          parent_id: Number(orderId),
        })),
      });

      // Fetch the newly created order with associated data
      const orderWithDetails = await prisma.crms_d_invoice.findUnique({
        where: { id: updatedOrder.id },
        include: {
          invoice_items: true,
          invoice_vendor: {
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
          invoice_currency: {
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
    throw new Error("Failed to update invoice and order items");
  }
};

// Find a Order by ID
const findInvoiceById = async (id) => {
  try {
    const users = await prisma.crms_d_invoice.findUnique({
      where: { id: parseInt(id) },
      include: {
        invoice_items: true, // Include the related order items
        invoice_vendor: {
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
        invoice_currency: {
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
const deleteInvoice = async (orderId) => {
  try {
    const result = await prisma.$transaction(async (prisma) => {
      // Delete Order Items first
      await prisma.crms_d_invoice_items.deleteMany({
        where: { parent_id: Number(orderId) },
      });

      // Delete the Order
      const deletedOrder = await prisma.crms_d_invoice.delete({
        where: { id: Number(orderId) },
      });

      return deletedOrder;
    });

    return result;
  } catch (error) {
    console.error("Failed to delete invoice and order items:", error);
    throw new Error("Failed to delete invoice and associated items");
  }
};

const getAllInvoice = async (search, page, size, startDate, endDate) => {
  try {
    page = page || 1;
    size = size || 10;
    const skip = (page - 1) * size;
    const filters = {};
    // Handle search
    if (search) {
      filters.OR = [
        {
          invoice_vendor: {
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
    const orders = await prisma.crms_d_invoice.findMany({
      where: filters,
      skip,
      take: size,
      include: {
        invoice_items: true, // Include the related order items
        invoice_vendor: {
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
        invoice_currency: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
    });

    const totalCount = await prisma.crms_d_invoice.count();

    return {
      data: orders,
      currentPage: page,
      size,
      totalPages: Math.ceil(totalCount / size),
      totalCount: totalCount,
    };
  } catch (error) {
    console.log("Error Order Modal : ", error);
    throw new CustomError("Error retrieving invoice", 503);
  }
};

// Generate Order Code
const generateInvoiceCode = async () => {
  try {
    const latestOrder = await prisma.crms_d_invoice.findFirst({
      orderBy: { id: "desc" },
    });
    const nextId = latestOrder ? latestOrder.id + 1 : 1;
    return `INV-00${nextId}`;
  } catch (error) {
    console.log("Error to generation invoice code : ", error);
    throw new CustomError("Error retrieving invoice code", 503);
  }
};

module.exports = {
  createInvoice,
  updateInvoice,
  deleteInvoice,
  findInvoiceById,
  getAllInvoice,
  generateInvoiceCode,
};

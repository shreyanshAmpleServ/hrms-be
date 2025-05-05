const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const prisma = new PrismaClient();

// Create a new quotation
const createQuotation = async (orderData,orderItemsData) => {
  try {
    console.log("Modal of Create quotation : ", orderData)
    const result = await prisma.$transaction(async (prisma) => {
      // Step 1: Create the Order
      const createdOrder = await prisma.crms_d_quotations.create({
        data: {
          ...orderData,
          vendor_id : Number(orderData?.vendor_id) || null,
          currency : Number(orderData?.currency) || null,
          sales_type : Number(orderData?.sales_type) || null,
          rounding_amount : Number(orderData?.rounding_amount) || null,
          createdate: new Date(),
          updatedate: new Date(),
          updatedby: orderData.createdby || 1,
          updatedby: orderData.createdby || 1,
        },
      });
      // Step 2: Create OrderItems using the created order's ID
      const orderItems = await prisma.crms_d_quotation_items.createMany({
        data: orderItemsData.map(item => ({
          ...item,
          item_id : Number(item?.item_id) || null,
          tax_id : Number(item?.tax_id) || null,
          parent_id: Number(createdOrder.id),
        })),
      });

     // Fetch the newly created order with associated data
     const orderWithDetails = await prisma.crms_d_quotations.findUnique({
      where: { id: createdOrder.id },
      include: {
        quotation_items: true,
        quotation_vendor:{
          select:{
            id:true,
            name:true,
            email:true,
            billing_zipcode:true,
            billing_city:true,
            country:true,
            state:true,
            billing_street:true

          }
        },
        quotation_currency: {
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
    throw new Error("Failed to create quotation and quotation items");
  }
};

// Update a quotation
const updateQuotaion = async (orderId, orderData, orderItemsData) => {
  try {
    const result = await prisma.$transaction(async (prisma) => {
      // Step 1: Update the Order
      const updatedOrder = await prisma.crms_d_quotations.update({
        where: { id: Number(orderId) },
        data: {
          ...orderData,
          vendor_id: orderData?.vendor_id ? Number(orderData.vendor_id) : null,
          currency: orderData?.currency ? Number(orderData.currency) : null,
          sales_type: orderData?.sales_type ? Number(orderData.sales_type) : null,
          rounding_amount: orderData?.rounding_amount ? Number(orderData.rounding_amount) : null,
          // due_date: orderData?.due_date ? due_date.toISOString() : "",
          // apr_date: orderData?.apr_date ? apr_date.toISOString() : "",
          updatedate: new Date(),
          updatedby: orderData?.updatedby || 1,
        },
      });

      // Step 2: Delete existing OrderItems for this order (if necessary)
      await prisma.crms_d_quotation_items.deleteMany({
        where: { parent_id: Number(orderId) },
      });

      // Step 3: Insert the updated OrderItems
      const orderItems = await prisma.crms_d_quotation_items.createMany({
        data: orderItemsData.map((item) => ({
          ...item,
          item_id: Number(item?.item_id) || null,
          tax_id: Number(item?.tax_id) || null,
          parent_id: Number(orderId),
        })),
      });
      

     // Fetch the newly created order with associated data
     const orderWithDetails = await prisma.crms_d_quotations.findUnique({
      where: { id: updatedOrder.id },
      include: {
        quotation_items: true,
        quotation_vendor:{
          select:{
            id:true,
            name:true,
            email:true,
            billing_zipcode:true,
            billing_city:true,
            country:true,
            state:true,
            billing_street:true

          }
        },
        quotation_currency: {
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
    throw new Error("Failed to update quotation and quotation items");
  }
};

// Find a quotation by ID 
const findQuotationById = async (id) => {
  try {
    const users = await prisma.crms_d_quotations.findUnique({
      where:{ id: parseInt(id)},
      include: {
        quotation_items: true, // Include the related order items
        quotation_vendor:{
          select:{
            id:true,
            name:true,
            email:true,
            billing_zipcode:true,
            billing_city:true,
            country:true,
            state:true,
            billing_street:true

          }
        },
        quotation_currency:{
          select:{
            id:true,
            name:true,
            code:true
          }
        }
      },
     
    });
    return users;
  } catch (error) {
    console.log("Error in Details of Product ", error)
    throw new CustomError(`Error finding user by ID: ${error.message}`, 503);
  }
};

// Delete a Order
const deleteQuotation = async (orderId) => {
  try {
    const result = await prisma.$transaction(async (prisma) => {
      // Delete Order Items first
      await prisma.crms_d_quotation_items.deleteMany({
        where: { parent_id: Number(orderId) },
      });

      // Delete the Order
      const deletedOrder = await prisma.crms_d_quotations.delete({
        where: { id: Number(orderId) },
      });

      return deletedOrder;
    });

    return result;
  } catch (error) {
    console.error("Failed to delete quotation and quotation items:", error);
    throw new Error("Failed to delete quotation and associated items");
  }
};


const getAllQuotaion = async (search ,page , size ,startDate, endDate) => {
  try {
    page = page || 1 ;
    size = size || 10;
    const skip = (page - 1) * size;
    const filters = {};
    // Handle search
    if (search) {
      filters.OR = [
        {
          quotation_vendor: {
                name: { contains: search.toLowerCase() },
            },
        },
        {
          quotation_code: { contains: search.toLowerCase() },
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
    const quotations = await prisma.crms_d_quotations.findMany({
      where: filters,
      skip,
      take: size,
      include: {
        quotation_items: true, // Include the related order items
        quotation_vendor:{
          select:{
            id:true,
            name:true,
            email:true,
            billing_zipcode:true,
            billing_city:true,
            country:true,
            state:true,
            billing_street:true

          }
        },
        quotation_currency:{
          select:{
            id:true,
            name:true,
            code:true
          }
        }
      },
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
    });

    const totalCount = await prisma.crms_d_quotations.count();

    return {
      data: quotations,
      currentPage: page,
      size,
      totalPages: Math.ceil(totalCount / size),
      totalCount : totalCount  ,
    };
  } catch (error) {
    console.log("Error quotation Modal : ", error)
    throw new CustomError("Error retrieving quotation", 503);
  }
};

// Generate Order Code
const generateQuotaionCode = async () => {
  try {
    const latestOrder = await prisma.crms_d_quotations.findFirst({
      orderBy: { id: 'desc' }
    });
     const nextId = latestOrder ? latestOrder.id + 1 : 1;
    return `QUO-00${nextId}`;
} catch (error) {
    console.log("Error to generation Quotation code : ", error)
    throw new CustomError('Error retrieving quotation code', 503);
}
};



module.exports = {
  createQuotation,
  findQuotationById,
  updateQuotaion,
  deleteQuotation,
  getAllQuotaion,
  generateQuotaionCode
};

const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const moment = require("moment");
const prisma = new PrismaClient();

// Parse `tags` after retrieving it
const parseTags = (deal) => {
  if (deal && deal.tags) {
    deal.tags = JSON.parse(deal.tags);
  }
  return deal;
};

// Find a deal by its ID
const findDealById = async (id) => {
  try {
    const deal = await prisma.Deal.findUnique({
      where: { id: parseInt(id) },
      include: {
        DealContacts: {
          include: {
            contact: true, // Include contact details
          },
        },
        DealHistory: true,
      },
    });
    return parseTags(deal);
  } catch (error) {
    throw new CustomError("Error finding deal by ID", 503);
  }
};

// Get all deals
const getDashboardData = async (filterDays) => {
  try {
    const { startDate, endDate } = filterDays;
    const startMoment = moment(startDate);
    const endMoment = moment(endDate);
    //  const days = Number(filterDays) || 30;
    //  const today = new Date();
    //  const startDate = new Date(today);
    //  startDate.setDate(today.getDate() - days);

    if (!startMoment.isValid() || !endMoment.isValid()) {
      throw new Error("Invalid date range provided");
    }
    const deal = await prisma.Deal.findMany({
      where: {
        createdDate: {
          gte: startMoment.toDate(), // Get deals from the selected range
          lte: endMoment.toDate(), // Get deals from the last `filterDays`
        },
      },
      include: {
        deals: true,
        pipeline: true,
      },
     
      orderBy: [{ updatedDate: "desc" }, { createdDate: "desc" }],
    });
    const deals = await prisma.Deal.findMany({
      where: {
        ...(startMoment && endMoment && {
          createdDate: {
            gte: startMoment.toDate(),
            lte: endMoment.toDate(),
          },
        }),
        ...(filterDays?.dealsPipelineFilter && {
          pipelineId: Number(filterDays?.dealsPipelineFilter),
        }),
      },
      include: {
        deals: true,
        pipeline: true,
      },
      orderBy: [{ updatedDate: "desc" }, { createdDate: "desc" }],
    });
    const dealsss = await prisma.Deal.findMany({
      where:{...(startMoment && endMoment && {
        createdDate: {
          gte: startMoment.toDate(),
          lte: endMoment.toDate(),
        },
      }),
      ...(filterDays?.wonDealFilter && {
        pipelineId: Number(filterDays?.wonDealFilter),
      }),
      
      },
      include: {
        deals: true,
        pipeline: true,
      },
    });
    const wonDeals = dealsss.filter((deal) => deal.status === "Won");
    const dealssss = await prisma.Deal.findMany({
      where:{...(startMoment && endMoment && {
        createdDate: {
          gte: startMoment.toDate(),
          lte: endMoment.toDate(),
        },
      }),
      ...(filterDays?.lostDealFilter && {pipelineId :Number(filterDays?.lostDealFilter)})},
      include: {
        deals: true,
        pipeline: true,
      },
    });
    const lostDeals = dealssss.filter((deal) => deal.status === "Lost");

    // Process deals to count them by month
    const dealss = await prisma.Deal.findMany({
      where:(filterDays?.monthlyDealFilter && {pipelineId :Number(filterDays?.monthlyDealFilter)}),
    });
    const monthlyDeals = {};
    dealss.forEach((deal) => {
      const month = new Date(deal.dueDate).getMonth() + 1; // Get month (1-12)
      monthlyDeals[month] = (monthlyDeals[month] || 0) + (deal.dealValue || 0); // Sum dealValue
    });

    const formattedDeals = deals.map((deal) => {
      const { deals, ...rest } = parseTags(deal); // Remove "deals" key
      return { ...rest, stages: deal.deals || [] }; // Rename "stages" to "deals"
    });

    return {
      deal:deal,
      deals: formattedDeals,
      monthlyDeals: monthlyDeals,
      wonDeals: wonDeals,
      lostDeals: lostDeals,
    };
  } catch (error) {
    console.log("Dashboard getting error : ", error);
    throw new CustomError("Error retrieving dashboard", 503);
  }
};
module.exports = {
  findDealById,
  getDashboardData,
};

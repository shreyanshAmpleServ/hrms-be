const CustomError = require("../../utils/CustomError");
const { getPrisma } = require("../../config/prismaContext.js");

// Utility Method: Formats pipeline data consistently
const formatPipelineData = (pipeline, isArray) => {
  if (!pipeline) return null;

  let totalDeals = 0;
  let totalDealValue = 0;

  isArray
    ? pipeline?.stages?.forEach((stage) => {
        totalDeals += stage?.deals?.length;
        totalDealValue += stage?.deals?.reduce(
          (sum, deal) => sum + (deal.dealValue || 0),
          0
        );
      })
    : (totalDealValue = pipeline.stages?.reduce(
        (sum, deal) => sum + (deal.valuealue || 0),
        0
      ));
  !isArray && (totalDeals = pipeline.deals?.length);

  return {
    id: pipeline.id,
    name: pipeline.name,
    description: pipeline.description,
    is_active: pipeline.is_active,
    log_inst: pipeline.log_inst,
    createdDate: pipeline.createdDate,
    updatedDate: pipeline.updatedDate,
    totalDealValue,
    totalDeals,
    stages: pipeline.stages?.map((stage) => ({
      id: stage.id,
      name: stage.name,
      colorCode: stage.colorCode,
      totalDeals: stage.deals ? stage.deals.length : 0,
      totalRevenue: stage.deals
        ? stage.deals.reduce((sum, deal) => sum + (deal.dealValue || 0), 0)
        : 0,
      deals: stage.deals
        ? stage.deals?.map((deal) => ({
            id: deal.id,
            name: deal.dealName,
            value: deal.dealValue,
            currency: deal.currency,
            dueDate: deal.dueDate,
            expectedCloseDate: deal.expectedCloseDate,
            followUpDate: deal.followUpDate,
            priority: deal.priority,
            status: deal.status,
            createdDate: deal.createdDate,
            contact: deal.DealContacts?.map((dealContact) => ({
              contactId: dealContact.contactId,
              roleInDeal: dealContact.roleInDeal,
              contact: dealContact.contact
                ? {
                    id: dealContact.contact.id,
                    firstName: dealContact.contact.firstName,
                    lastName: dealContact.contact.lastName,
                    email: dealContact.contact.email,
                    phone1: dealContact.contact.phone1,
                    streetAddress: dealContact.contact.streetAddress,
                    city: dealContact.contact.city,
                    state: dealContact.contact.state,
                    country: dealContact.contact.country,
                    zipcode: dealContact.contact.zipcode,
                  }
                : null,
            })),
          }))
        : [],
    })),
  };
};

// Create a new pipeline with or without stages
const createPipelineWithStages = async (data) => {
  const prisma = getPrisma();
  try {
    const prisma = getPrisma();
    const pipeline = await prisma.pipeline.create({
      data: {
        name: data.name,
        description: data.description,
        createdBy: data.createdBy,
        is_active: data.is_active,
        stages: {
          create: data.stages,
        },
      },
      include: {
        stages: { include: { deals: true } },
        pipeline: true,
      },
    });
    return formatPipelineData(pipeline, false);
  } catch (error) {
    throw new CustomError(`Error creating pipeline: ${error.message}`, 500);
  }
};

// Find a pipeline by ID
const findPipelineById = async (id) => {
  const prisma = getPrisma();
  try {
    const prisma = getPrisma();
    const pipeline = await prisma.pipeline.findUnique({
      where: { id: parseInt(id) },
      include: {
        stages: true,
        // deals: true,
      },
    });

    if (!pipeline) {
      throw new CustomError("Pipeline not found", 404);
    }
    console.log("PPPPPP", pipeline);

    return formatPipelineData(pipeline, false);
  } catch (error) {
    console.log("Error to get Stages : ", error);
    throw new CustomError(
      `Error finding pipeline by ID: ${error.message}`,
      503
    );
  }
};

// Update an existing pipeline
const updatePipeline = async (id, data) => {
  const prisma = getPrisma();
  try {
    const prisma = getPrisma();
    // Fetch existing pipeline and its stages
    const existingPipeline = await prisma.pipeline.findUnique({
      where: { id: parseInt(id) },
      include: { stages: true },
    });

    if (!existingPipeline) {
      throw new CustomError("Pipeline not found", 404);
    }

    const stagesToUpdate = [];
    const stagesToCreate = [];
    const existingStageIds = existingPipeline.stages.map((stage) => stage.id);

    // Categorize stages from the input
    data.stages.forEach((stage) => {
      if (stage.id) {
        stagesToUpdate.push(stage);
      } else {
        stagesToCreate.push(stage);
      }
    });

    // Identify stages to delete
    const stageIdsToDelete = existingStageIds.filter(
      (existingId) => !stagesToUpdate.some((stage) => stage.id === existingId)
    );

    // Perform updates within a transaction
    const updatedPipeline = await prisma.$transaction(
      async () => {
        // Delete stages that are no longer present in the input
        if (stageIdsToDelete.length > 0) {
          await prisma.stage.deleteMany({
            where: { id: { in: stageIdsToDelete } },
          });
        }

        // Update existing stages
        if (stagesToUpdate.length > 0) {
          for (const stage of stagesToUpdate) {
            await prisma.stage.update({
              where: { id: stage.id },
              data: {
                name: stage.name,
                colorCode: stage.colorCode,
                order: stage.order,
              },
            });
          }
        }

        // Create new stages
        if (stagesToCreate.length > 0) {
          await prisma.stage.createMany({
            data: stagesToCreate.map((stage) => ({
              name: stage.name,
              colorCode: stage.colorCode,
              order: stage.order,
              pipelineId: parseInt(id), // Ensure pipelineId is an integer
            })),
          });
        }

        // Update the pipeline itself
        return prisma.pipeline.update({
          where: { id: parseInt(id) },
          data: {
            name: data.name,
            description: data.description,
            is_active: data.is_active,
            updatedDate: new Date(),
          },
          include: {
            stages: { include: { deals: true } },
            pipeline: true,
          },
        });
      },
      { maxWait: 10000, timeout: 10000 } // Increase timeout to 10 seconds
    );

    return formatPipelineData(updatedPipeline, false);
  } catch (error) {
    console.log("Update Pipeline Error :", error);
    throw new CustomError(`Error updating pipeline: ${error.message}`, 500);
  }
};

// Delete a pipeline along with its stages and deals
const deletePipeline = async (id) => {
  const prisma = getPrisma();
  try {
    const prisma = getPrisma();
    // Delete DealContacts first (child table)
    await prisma.dealContacts.deleteMany({ where: { dealId: parseInt(id) } });
    await prisma.stage.deleteMany({ where: { pipelineId: parseInt(id) } });
    await prisma.Deal.deleteMany({ where: { pipelineId: parseInt(id) } });

    await prisma.pipeline.delete({ where: { id: parseInt(id) } });
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

// Retrieve all pipelines
const getAllPipelines = async (
  page,
  size,
  search,
  startDate,
  endDate,
  status
) => {
  try {
    const prisma = getPrisma();
    page = !page || page == 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size || 0;

    const filters = {};
    // Handle search
    if (search) {
      filters.OR = [
        {
          name: { contains: search.toLowerCase() },
        },
      ];
    }
    if (status) {
      filters.is_active = { equals: status };
    }
    // if(priority){filters.priority = {equals :priority} }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        filters.createdDate = {
          gte: start,
          lte: end,
        };
      }
    }
    const pipelines = await prisma.pipeline.findMany({
      where: filters,
      skip: skip,
      take: size,
      include: {
        stages: {
          select: {
            id: true,
            deals: true,
            name: true,
            colorCode: true,
          },
        },
        pipeline: true,
      },
      orderBy: [{ updatedDate: "desc" }, { createdDate: "desc" }],
    });

    // return pipelines.map(pipeline => {
    //   let totalDeals = 0;
    //   let totalValue = 0;

    //   pipeline.stages.forEach(stage => {
    //     totalDeals += stage.deals.length;
    //     totalValue += stage.deals.reduce((sum, deal) => sum + (deal.value || 0), 0);
    //   });

    //   return {
    //     ...pipelines.map(formatPipelineData),
    //     totalDeals,
    //     totalValue
    //   };
    // });

    const pipelineData = pipelines.map((pipeline) =>
      formatPipelineData(pipeline, true)
    );
    const totalCount = await prisma.pipeline.count();
    return {
      data: pipelineData,
      currentPage: page,
      size,
      totalPages: Math.ceil(totalCount / size),
      totalCount: totalCount,
    };
  } catch (error) {
    console.log("pipline geting error : ", error);
    throw new CustomError(`Error retrieving pipelines: ${error.message}`, 503);
  }
};

// Retrieve pipeline data with deals
const getPipelineDataWithDeals = async (pipelineId) => {
  const prisma = getPrisma();
  try {
    const pipeline = await prisma.pipeline.findUnique({
      where: { id: parseInt(pipelineId) },
      include: {
        stages: {
          include: {
            deals: {
              select: {
                id: true,
                dealName: true,
                dealValue: true,
                currency: true,
                dueDate: true,
                expectedCloseDate: true,
                followUpDate: true,
                priority: true,
                status: true,
                createdDate: true,
                // Include DealContacts (Contact info related to the deal)
                DealContacts: {
                  select: {
                    contactId: true,
                    roleInDeal: true,
                    contact: {
                      select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone1: true,
                        streetAddress: true,
                        city: true,
                        state: true,
                        country: true,
                        zipcode: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!pipeline) {
      throw new Error("Pipeline not found");
    }

    // Format the response data
    const formattedResponse = {
      pipeline: {
        id: pipeline.id,
        name: pipeline.name,
        stages: pipeline.stages.map((stage) => {
          const totalDeals = stage.deals.length;
          const totalRevenue = stage.deals.reduce(
            (sum, deal) => sum + (deal.dealValue || 0),
            0
          );

          return {
            id: stage.id,
            name: stage.name,
            colorCode: stage.colorCode,
            totalDeals,
            totalRevenue,
            deals: stage.deals.map((deal) => ({
              id: deal.id,
              name: deal.dealName,
              value: deal.dealValue,
              currency: deal.currency,
              dueDate: deal.dueDate,
              expectedCloseDate: deal.expectedCloseDate,
              followUpDate: deal.followUpDate,
              priority: deal.priority,
              status: deal.status,
              createdDate: deal.createdDate,
              // DealContacts for each deal
              contact: deal.DealContacts.map((dealContact) => ({
                contactId: dealContact.contactId,
                roleInDeal: dealContact.roleInDeal,
                contact: dealContact.contact
                  ? {
                      id: dealContact.contact.id,
                      firstName: dealContact.contact.firstName,
                      lastName: dealContact.contact.lastName,
                      email: dealContact.contact.email,
                      phone1: dealContact.contact.phone1,
                      streetAddress: dealContact.contact.streetAddress,
                      city: dealContact.contact.city,
                      state: dealContact.contact.state,
                      country: dealContact.contact.country,
                      zipcode: dealContact.contact.zipcode,
                    }
                  : null,
              })),
            })),
          };
        }),
      },
    };

    return formattedResponse;
  } catch (error) {
    console.error(`Error retrieving pipeline data: ${error.message}`);
    throw new Error(`Error retrieving pipeline data: ${error.message}`);
  }
};

const updateDealStage = async (dealId, data) => {
  const prisma = getPrisma();
  try {
    // Update the deal's stage
    await prisma.deal.update({
      where: { id: parseInt(dealId) },
      data: { stageId: parseInt(data?.stageId) },
    });

    return await getPipelineDataWithDeals(data?.pipelineId);
  } catch (error) {
    throw new CustomError(`Error updating deal stage: ${error.message}`, 500);
  }
};

module.exports = {
  createPipelineWithStages,
  findPipelineById,
  updatePipeline,
  deletePipeline,
  getAllPipelines,
  getPipelineDataWithDeals,
  updateDealStage,
};

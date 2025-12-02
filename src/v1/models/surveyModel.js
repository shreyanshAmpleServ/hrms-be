const { prisma } = require("../../utils/prismaProxy.js");
const CustomError = require("../../utils/CustomError");
const { checkDuplicate } = require("../../utils/duplicateCheck.js");

const createSurvey = async (data) => {
  try {
    await checkDuplicate({
      model: "hrms_m_survey_master",
      field: "survey_title",
      value: data.survey_title,
      errorMessage: "Survey title already exists",
    });
    const finalData = await prisma.hrms_m_survey_master.create({
      data: {
        survey_title: data.survey_title || "",
        description: data.description || "",
        launch_date: data.launch_date || new Date(),
        is_active: data.is_active || "Y",

        close_date: data.close_date || null,
        createdby: data.createdby || 1,
        log_inst: data.log_inst || 1,
        createdate: new Date(),
        updatedate: new Date(),
        updatedby: 1,
      },
    });
    return finalData;
  } catch (error) {
    console.log("Create survey ", error);
    throw new CustomError(error.message, 500);
  }
};

const findSurveyById = async (id) => {
  try {
    const data = await prisma.hrms_m_survey_master.findUnique({
      where: { id: parseInt(id) },
    });
    if (!data) {
      throw new CustomError("survey not found", 404);
    }
    return data;
  } catch (error) {
    console.log("survey By Id  ", error);
    throw new CustomError(`Error finding survey by ID: ${error.message}`, 503);
  }
};

const updateSurvey = async (id, data) => {
  try {
    if (data.survey_title) {
      await checkDuplicate({
        model: "hrms_m_survey_master",
        field: "survey_title",
        value: data.survey_title,
        excludeId: id,
        errorMessage: "Survey title already exists",
      });
    }
    const updatedData = await prisma.hrms_m_survey_master.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        updatedate: new Date(),
      },
    });
    return updatedData;
  } catch (error) {
    throw new CustomError(error.message, 500);
  }
};

const deleteSurvey = async (id) => {
  try {
    await prisma.hrms_m_survey_master.delete({
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

const getAllSurvey = async (
  page,
  size,
  search,
  searchDate,
  endDate,
  is_active
) => {
  try {
    page = page || page == 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size || 0;

    const filters = {};
    if (search) {
      filters.OR = [
        {
          survey_title: { contains: search.toLowerCase() },
        },
      ];
    }

    if (typeof is_active === "boolean") {
      filters.is_active = is_active ? "Y" : "N";
    } else if (typeof is_active === "string") {
      if (is_active.toLowerCase() === "true") filters.is_active = "Y";
      else if (is_active.toLowerCase() === "false") filters.is_active = "N";
    }

    const data = await prisma.hrms_m_survey_master.findMany({
      where: filters,
      skip: skip,
      take: size,

      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
    });

    const totalCount = await prisma.hrms_m_survey_master.count({
      where: filters,
    });
    return {
      data: data,
      currentPage: page,
      size,
      totalPages: Math.ceil(totalCount / size),
      totalCount: totalCount,
    };
  } catch (error) {
    console.log(error);
    throw new CustomError("Error retrieving survey", 503);
  }
};

module.exports = {
  createSurvey,
  findSurveyById,
  updateSurvey,
  deleteSurvey,
  getAllSurvey,
};

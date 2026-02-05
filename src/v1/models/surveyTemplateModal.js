const { prisma } = require("../../utils/prismaProxy.js");
const CustomError = require("../../utils/CustomError");

const serializeSurveyQuestion = (q, surveyId) => ({
  question: q.question,
  type: q.type,
  isRequired: Boolean(q.isRequired),
  order: q.order || null,
  options: q.options ? JSON.stringify(q.options) : null,
  survey_id: surveyId,
  is_active: q.is_active || "Y",
});

const createSurveyTemplate = async (data) => {
  try {
    const survey = await prisma.hrms_m_survey_template.create({
      data: {
        title: data.title,
        description: data.description || null,
        is_active: "Y",
        createdAt: new Date(),
        questions: {
          create: (data.questions || []).map((q) => serializeSurveyQuestion(q)),
        },
      },
      include: {
        questions: true,
      },
    });

    return survey;
  } catch (error) {
    throw new CustomError(
      `Error creating survey template: ${error.message}`,
      500,
    );
  }
};

// const createSurveyTemplate = async (data) => {
//   try {
//     const result = await prisma.$transaction(async (tx) => {
//       // 1️⃣ Create survey
//       const survey = await tx.hrms_m_survey_template.create({
//         data: {
//           title: data.title,
//           description: data.description || null,
//           is_active: "Y",
//           createdAt: new Date(),
//         },
//       });

//       // 2️⃣ Create questions
//       if (Array.isArray(data.questions) && data.questions.length > 0) {
//         await tx.hrms_m_survey_question.createMany({
//           data: data.questions.map((q) =>
//             serializeSurveyQuestion(q, survey.id),
//           ),
//         });
//       }

//       return survey;
//     });

//     return result;
//   } catch (error) {
//     throw new CustomError(
//       `Error creating survey template: ${error.message}`,
//       500,
//     );
//   }
// };

const findSurveyById = async (id) => {
  try {
    const survey = await prisma.hrms_m_survey_template.findUnique({
      where: { id: Number(id) },
      include: {
        questions: {
          where: { is_active: "Y" },
          orderBy: { order: "asc" },
        },
      },
    });

    if (!survey) {
      throw new CustomError("Survey template not found", 404);
    }

    // Parse options JSON
    survey.questions = survey.questions.map((q) => ({
      ...q,
      options: q.options ? JSON.parse(q.options) : [],
    }));

    return survey;
  } catch (error) {
    throw new CustomError(
      `Error fetching survey template: ${error.message}`,
      503,
    );
  }
};

// const updateSurveyTemplate = async (id, data) => {
//   try {
//     const surveyId = Number(id);

//     if (isNaN(surveyId)) {
//       throw new CustomError("Invalid survey template ID", 400);
//     }

//     const existingSurvey = await prisma.hrms_m_survey_template.findUnique({
//       where: { id: surveyId },
//     });

//     if (!existingSurvey) {
//       throw new CustomError("Survey template not found", 404);
//     }

//     const result = await prisma.$transaction(async (tx) => {
//       // 1️⃣ Update survey master
//       const survey = await tx.hrms_m_survey_template.update({
//         where: { id: surveyId },
//         data: {
//           title: data.title,
//           description: data.description,
//           is_active: data.is_active || "Y",
//           updatedAt: new Date(),
//         },
//       });

//       // 2️⃣ Soft delete old questions
//       await tx.hrms_m_survey_question.updateMany({
//         where: { survey_id: surveyId },
//         data: { is_active: "N", updatedAt: new Date() },
//       });

//       // 3️⃣ Create new questions
//       if (Array.isArray(data.questions) && data.questions.length > 0) {
//         await tx.hrms_m_survey_question.createMany({
//           data: data.questions.map((q) => serializeSurveyQuestion(q, surveyId)),
//         });
//       }

//       return survey;
//     });

//     return result;
//   } catch (error) {
//     throw new CustomError(
//       `Error updating survey template: ${error.message}`,
//       500,
//     );
//   }
// };

const updateSurveyTemplate = async (id, data) => {
  try {
    const surveyId = Number(id);
    if (isNaN(surveyId)) {
      throw new CustomError("Invalid survey template ID", 400);
    }

    const existingSurvey = await prisma.hrms_m_survey_template.findUnique({
      where: { id: surveyId },
    });

    if (!existingSurvey) {
      throw new CustomError("Survey template not found", 404);
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1️⃣ Update survey master
      const survey = await tx.hrms_m_survey_template.update({
        where: { id: surveyId },
        data: {
          title: data.title,
          description: data.description,
          is_active: data.is_active || "Y",
          updatedAt: new Date(),
        },
      });

      // 2️⃣ Handle questions ONLY if sent
      if (Array.isArray(data.questions)) {
        const incomingIds = data.questions.filter((q) => q.id).map((q) => q.id);

        // Soft delete removed questions
        await tx.hrms_m_survey_question.updateMany({
          where: {
            survey_id: surveyId,
            id: { notIn: incomingIds },
          },
          data: { is_active: "N", updatedAt: new Date() },
        });

        // Upsert questions
        for (const q of data.questions) {
          if (q.id) {
            // 🔁 Update existing
            await tx.hrms_m_survey_question.update({
              where: { id: q.id },
              data: serializeSurveyQuestion(q, surveyId),
            });
          } else {
            // ➕ Create new
            await tx.hrms_m_survey_question.create({
              data: {
                ...serializeSurveyQuestion(q, surveyId),
                createdAt: new Date(),
              },
            });
          }
        }
      }

      return survey;
    });

    return result;
  } catch (error) {
    throw new CustomError(
      `Error updating survey template: ${error.message}`,
      500,
    );
  }
};

const replaceSurveyQuestions = async (surveyId, questions) => {
  try {
    if (!Array.isArray(questions)) {
      throw new CustomError("Questions must be an array", 400);
    }

    await prisma.$transaction(async (tx) => {
      // 1️⃣ Soft delete existing questions
      await tx.hrms_m_survey_question.updateMany({
        where: { survey_id: Number(surveyId) },
        data: { is_active: "N", updatedAt: new Date() },
      });

      // 2️⃣ Insert new questions (if any)
      if (questions.length > 0) {
        await tx.hrms_m_survey_question.createMany({
          data: questions.map((q) =>
            serializeSurveyQuestion(q, Number(surveyId)),
          ),
        });
      }
    });

    return true;
  } catch (error) {
    throw new CustomError(
      `Error replacing survey questions: ${error.message}`,
      500,
    );
  }
};

const deleteSurveyTemplate = async (id) => {
  try {
    await prisma.hrms_m_survey_template.update({
      where: { id: Number(id) },
      data: {
        is_active: "N",
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    if (error.code === "P2003") {
      throw new CustomError("Survey is linked with other records.", 400);
    }
    throw new CustomError(error.message, 500);
  }
};

const getAllSurveyTemplates = async (search, page, size) => {
  try {
    page = !page || page == 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size;

    const filters = {
      is_active: "Y",
    };

    if (search) {
      filters.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const data = await prisma.hrms_m_survey_template.findMany({
      where: filters,
      skip,
      take: size,
      orderBy: { createdAt: "desc" },
    });

    const totalCount = await prisma.hrms_m_survey_template.count({
      where: filters,
    });

    return {
      data,
      currentPage: page,
      size,
      totalPages: Math.ceil(totalCount / size),
      totalCount,
    };
  } catch (error) {
    throw new CustomError("Error retrieving survey templates", 503);
  }
};

module.exports = {
  createSurveyTemplate,
  findSurveyById,
  updateSurveyTemplate,
  replaceSurveyQuestions,
  deleteSurveyTemplate,
  getAllSurveyTemplates,
};

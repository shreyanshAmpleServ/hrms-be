const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getRequestDetailsByType = async (request_type, reference_id) => {
  switch (request_type) {
    case "leave_request":
      const leave = await prisma.hrms_d_leave_application.findUnique({
        where: { id: reference_id },
        select: {
          start_date: true,
          end_date: true,
          reason: true,
          leave_types: {
            select: {
              leave_type: true,
            },
          },
        },
      });

      if (leave) {
        return {
          leave_type: leave.leave_types?.leave_type || "N/A",
          start_date: leave.start_date,
          end_date: leave.end_date,
          reason: leave.reason,
        };
      }
      return null;

    case "loan_request":
      return await prisma.hrms_d_loan_request.findUnique({
        where: { id: reference_id },
        select: { loan_type_id: true, amount: true },
      });

    case "advance_request":
      return await prisma.hrms_d_advance_payment_entry.findUnique({
        where: { id: reference_id },
        select: { amount_approved: true, reason: true },
      });

    case "asset_request":
      return await prisma.hrms_d_asset_assignment.findUnique({
        where: { id: reference_id },
        select: { asset_name: true, issued_on: true },
      });

    case "probation_review":
      return await prisma.hrms_d_probation_review.findUnique({
        where: { id: reference_id },
        select: { review_notes: true, confirmation_status: true },
      });

    case "appraisal_review":
      return await prisma.hrms_d_appraisal.findUnique({
        where: { id: reference_id },
        select: { rating: true, reviewer_comments: true },
      });

    case "leave_encashment":
      return await prisma.hrms_d_leave_encashment.findUnique({
        where: { id: reference_id },
        select: { leave_days: true, approval_status: true },
      });
    case "hiring_stage":
      // ADD THIS NEW CASE
      if (reference_id) {
        const hiringStage = await prisma.hrms_d_hiring_stage.findUnique({
          where: { id: parseInt(reference_id) },
          include: {
            hiring_stage_hiring_value: {
              select: {
                id: true,
                value: true,
              },
            },
          },
        });

        if (hiringStage) {
          return `
        <strong>Hiring Stage:</strong> ${hiringStage.name || "N/A"}<br>
        <strong>Stage Code:</strong> ${hiringStage.code || "N/A"}<br>
        <strong>Stage Type:</strong> ${
          hiringStage.hiring_stage_hiring_value?.value || "N/A"
        }<br>
        <strong>Status:</strong> ${
          hiringStage.status === "P"
            ? "Pending"
            : hiringStage.status === "A"
            ? "Approved"
            : "Rejected"
        }<br>
        <strong>Remarks:</strong> ${hiringStage.remarks || "N/A"}<br>
        <strong>Feedback:</strong> ${hiringStage.feedback || "N/A"}<br>
        <strong>Competency Level:</strong> ${
          hiringStage.competency_level || "N/A"
        }<br>
        <strong>Completion Date:</strong> ${
          hiringStage.completion_date
            ? new Date(hiringStage.completion_date).toLocaleDateString()
            : "N/A"
        }
      `;
        }
      }

    default:
      return null;
  }
};

module.exports = getRequestDetailsByType;

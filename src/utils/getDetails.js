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

    case "job_posting":
      if (reference_id) {
        return await prisma.hrms_d_job_posting.findUnique({
          where: { id: parseInt(reference_id) },
          select: {
            job_title: true,
            job_code: true,
            description: true,
            required_experience: true,
            posting_date: true,
            closing_date: true,
            status: true,
          },
        });
      }
      return null;

    case "offer_letter":
      if (reference_id) {
        const offerLetter = await prisma.hrms_d_offer_letter.findUnique({
          where: { id: parseInt(reference_id) },
          include: {
            offered_candidate: {
              select: {
                full_name: true,
                email: true,
              },
            },
            offer_letter_currencyId: {
              select: {
                currency_code: true,
                currency_name: true,
              },
            },
          },
        });

        if (offerLetter) {
          return {
            position: offerLetter.position || "N/A",
            offered_salary: offerLetter.offered_salary || 0,
            offer_date: offerLetter.offer_date
              ? new Date(offerLetter.offer_date).toLocaleDateString()
              : "N/A",
            valid_until: offerLetter.valid_until
              ? new Date(offerLetter.valid_until).toLocaleDateString()
              : "N/A",
            candidate_name: offerLetter.offered_candidate?.full_name || "N/A",
            candidate_email: offerLetter.offered_candidate?.email || "N/A",
            currency_code:
              offerLetter.offer_letter_currencyId?.currency_code || "N/A",
            currency_name:
              offerLetter.offer_letter_currencyId?.currency_name || "N/A",
            status:
              offerLetter.status === "P"
                ? "Pending"
                : offerLetter.status === "A"
                ? "Approved"
                : offerLetter.status === "R"
                ? "Rejected"
                : offerLetter.status || "N/A",
          };
        }
      }
      return null;
    case "appointment_letter":
      if (reference_id) {
        const appointmentLetter =
          await prisma.hrms_d_appointment_letter.findUnique({
            where: { id: parseInt(reference_id) },
            include: {
              appointment_candidate: {
                select: {
                  full_name: true,
                  email: true,
                },
              },
              appointment_designation: {
                select: {
                  designation_name: true,
                },
              },
            },
          });

        if (appointmentLetter) {
          return {
            candidate_name:
              appointmentLetter.appointment_candidate?.full_name || "N/A",
            candidate_email:
              appointmentLetter.appointment_candidate?.email || "N/A",
            designation:
              appointmentLetter.appointment_designation?.designation_name ||
              "N/A",
            position:
              appointmentLetter.appointment_designation?.designation_name ||
              "N/A",
            joining_date: appointmentLetter.joining_date
              ? new Date(appointmentLetter.joining_date).toLocaleDateString()
              : "N/A",
            issue_date: appointmentLetter.issue_date
              ? new Date(appointmentLetter.issue_date).toLocaleDateString()
              : "N/A",
            employment_type: appointmentLetter.employment_type || "N/A",
            contract_duration_months:
              appointmentLetter.contract_duration_months || "N/A",
            probation_period_months:
              appointmentLetter.probation_period_months || "N/A",
            reporting_manager_id:
              appointmentLetter.reporting_manager_id || "N/A",
            status: appointmentLetter.status || "Draft",
            terms_summary: appointmentLetter.terms_summary || "N/A",
            remarks: appointmentLetter.remarks || "N/A",
          };
        }
      }
      return null;
    case "pay_component":
      if (reference_id) {
        const payComponent = await prisma.hrms_m_pay_component.findUnique({
          where: { id: parseInt(reference_id) },
          select: {
            component_name: true,
            component_code: true,
            component_type: true,
            is_taxable: true,
            is_statutory: true,
            pay_or_deduct: true,
            is_advance: true,
            status: true,
            factor: true,
            execution_order: true,
          },
        });

        if (payComponent) {
          return {
            component_name: payComponent.component_name || "N/A",
            component_code: payComponent.component_code || "N/A",
            component_type: payComponent.component_type || "N/A",
            is_taxable: payComponent.is_taxable === "Y" ? "Yes" : "No",
            is_statutory: payComponent.is_statutory === "Y" ? "Yes" : "No",
            pay_or_deduct:
              payComponent.pay_or_deduct === "P" ? "Payment" : "Deduction",
            is_advance: payComponent.is_advance === "Y" ? "Yes" : "No",
            factor: payComponent.factor || "N/A",
            execution_order: payComponent.execution_order || "N/A",
            status:
              payComponent.status === "P"
                ? "Pending"
                : payComponent.status === "A"
                ? "Approved"
                : payComponent.status === "R"
                ? "Rejected"
                : payComponent.status || "N/A",
          };
        }
      }
      return null;
  }
};

module.exports = getRequestDetailsByType;

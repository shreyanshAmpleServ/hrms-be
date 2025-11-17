const { prisma } = require("../utils/prismaProxy.js");

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
    case "component_assignment":
      if (reference_id) {
        const payComponent =
          await prisma.hrms_d_employee_pay_component_assignment_header.findUnique(
            {
              where: { id: parseInt(reference_id) },
              include: {
                hrms_d_employee: {
                  select: {
                    id: true,
                    full_name: true,
                    employee_code: true,
                    hrms_employee_department: {
                      select: {
                        id: true,
                        department_name: true,
                      },
                    },
                  },
                },
                hrms_d_employee_pay_component_assignment_line: {
                  include: {
                    pay_component_for_line: {
                      select: {
                        id: true,
                        component_name: true,
                        component_code: true,
                      },
                    },
                    pay_component_line_currency: {
                      select: {
                        id: true,
                        currency_name: true,
                        currency_code: true,
                      },
                    },
                  },
                },
                branch_pay_component_header: {
                  select: {
                    id: true,
                    branch_name: true,
                  },
                },
              },
            }
          );

        if (payComponent) {
          return {
            id: payComponent.id,
            employee_name: payComponent.hrms_d_employee?.full_name,
            employee_code: payComponent.hrms_d_employee?.employee_code,
            department:
              payComponent.hrms_d_employee?.hrms_employee_department
                ?.department_name,
            branch: payComponent.branch_pay_component_header?.branch_name,
            status: payComponent.status,
            effective_from: payComponent.effective_from,
            effective_to: payComponent.effective_to,
            components:
              payComponent.hrms_d_employee_pay_component_assignment_line?.map(
                (line) => ({
                  component_name: line.pay_component_for_line?.component_name,
                  amount: line.amount,
                  currency: line.pay_component_line_currency?.currency_code,
                })
              ),
          };
        }
        return null;
      }
    case "kpi_approval":
      if (reference_id) {
        const kpiData = await prisma.hrms_d_employee_kpi.findUnique({
          where: { id: parseInt(reference_id) },
          include: {
            kpi_employee: {
              select: {
                id: true,
                full_name: true,
                employee_code: true,
                hrms_employee_department: {
                  select: {
                    id: true,
                    department_name: true,
                  },
                },
              },
            },
            kpi_reviewer: {
              select: {
                id: true,
                full_name: true,
                employee_code: true,
              },
            },
            kpi_contents: {
              select: {
                id: true,
                kpi_name: true,
                target_point: true,
                achieved_point: true,
                weightage_percentage: true,
                achieved_percentage: true,
                kpi_remarks: true,
              },
            },
          },
        });

        if (kpiData) {
          return {
            id: kpiData.id,
            employee_name: kpiData.kpi_employee?.full_name,
            employee_code: kpiData.kpi_employee?.employee_code,
            department:
              kpiData.kpi_employee?.hrms_employee_department?.department_name,
            reviewer_name: kpiData.kpi_reviewer?.full_name,
            review_date: kpiData.review_date,
            rating: kpiData.rating,
            status: kpiData.status,
            contents: kpiData.kpi_contents || [],
          };
        }
        return null;
      }
  }
};

module.exports = getRequestDetailsByType;

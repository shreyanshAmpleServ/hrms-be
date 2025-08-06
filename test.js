// Fetch requester details
const requester = await prisma.hrms_d_employee.findUnique({
  where: { id: parentData.requester_id },
  select: { full_name: true },
});

// Fetch first approver from workflow (first in sequence)
const firstApproverId = approvalsToInsert[0]?.approver_id;
const firstApprover = await prisma.hrms_d_employee.findUnique({
  where: { id: firstApproverId },
  select: { email: true, full_name: true },
});

// Get company name (optional)
const company = await prisma.hrms_d_default_configurations.findUnique({
  where: { id: parentData.log_inst },
  select: { company_name: true },
});
const companyName = company?.company_name || "HRMS System";

// Send email to first approver if valid
if (firstApprover?.email && requester?.full_name) {
  const template = emailTemplates.notifyNextApprover({
    approverName: firstApprover.full_name,
    previousApprover: requester.full_name, // creator of the request
    requestType: request_type,
    action: "Created",
    companyName,
  });

  await sendEmail({
    to: firstApprover.email,
    subject: template.subject,
    html: template.html,
    createdby: parentData.createdby,
    log_inst: parentData.log_inst,
  });

  console.log(`[Email Sent] → First Approver: ${firstApprover.email}`);
}

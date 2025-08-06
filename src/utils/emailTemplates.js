const formatRequestType = (type) =>
  type.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

const renderDetailsHtml = (details) => {
  if (!details) return "";
  let html = `<h4 style="margin-top: 10px;">Request Details:</h4><ul style="padding-left: 15px;">`;

  for (const [key, value] of Object.entries(details)) {
    const label = key
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

    const formattedValue =
      value instanceof Date
        ? value.toLocaleDateString("en-IN", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
        : value;

    html += `<li><strong>${label}:</strong> ${formattedValue ?? "N/A"}</li>`;
  }

  html += `</ul>`;
  return html;
};

const emailTemplates = {
  requestApproved: ({ fullName, requestType, companyName, details }) => ({
    subject: `${companyName} - ${formatRequestType(requestType)} Approved`,
    html: `
      <p>Dear ${fullName},</p>
      <p>Your request of type <strong>${formatRequestType(
        requestType
      )}</strong> has been <strong>approved</strong> by all approvers.</p>
      ${renderDetailsHtml(details)}
      <p>Regards,<br/>${companyName}</p>
    `,
  }),

  requestRejected: ({
    fullName,
    requestType,
    remarks,
    companyName,
    details,
  }) => ({
    subject: `${companyName} - ${formatRequestType(requestType)} Rejected`,
    html: `
      <p>Dear ${fullName},</p>
      <p>Your request of type <strong>${formatRequestType(
        requestType
      )}</strong> has been <strong>rejected</strong>.</p>
      <p><strong>Remarks:</strong> ${remarks || "N/A"}</p>
      ${renderDetailsHtml(details)}
      <p>Regards,<br/>${companyName}</p>
    `,
  }),

  notifyApprover: ({
    approverName,
    previousApprover,
    requestType,
    action,
    companyName,
    details,
  }) => ({
    subject: `Action Required: ${requestType} has been ${action}`,
    html: `
      <p>Dear ${approverName},</p>
      <p>The request <strong>${requestType}</strong> has been <strong>${action}</strong> by <strong>${previousApprover}</strong>.</p>
            ${renderDetailsHtml(details)}

      <p>It is now pending your action. Please review and take appropriate action.</p>
      <p>Regards,<br/>${companyName}</p>
    `,
  }),
  notifyNextApprover: ({
    approverName,
    previousApprover,
    requestType,
    action,
    companyName,
    details,
  }) => ({
    subject: `${companyName} - ${formatRequestType(requestType)} ${action}`,
    html: `
      <p>Dear ${approverName},</p>
      <p>A <strong>${formatRequestType(
        requestType
      )}</strong> has been <strong>${action.toLowerCase()}</strong> by <strong>${previousApprover}</strong>.</p>
      ${renderDetailsHtml(details)}
      <p>Please login to the HRMS to take necessary action.</p>
      <p>Regards,<br>${companyName}</p>
    `,
  }),
};

module.exports = emailTemplates;

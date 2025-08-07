// const formatRequestType = (type) =>
//   type.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

// const renderDetailsHtml = (details) => {
//   if (!details) return "";
//   let html = `<h4 style="margin-top: 10px;">Request Details:</h4><ul style="padding-left: 15px;">`;

//   for (const [key, value] of Object.entries(details)) {
//     const label = key
//       .replace(/_/g, " ")
//       .replace(/\b\w/g, (c) => c.toUpperCase());

//     const formattedValue =
//       value instanceof Date
//         ? value.toLocaleDateString("en-IN", {
//             year: "numeric",
//             month: "short",
//             day: "numeric",
//           })
//         : value;

//     html += `<li><strong>${label}:</strong> ${formattedValue ?? "N/A"}</li>`;
//   }

//   html += `</ul>`;
//   return html;
// };

// const emailTemplates = {
//   requestApproved: ({ fullName, requestType, companyName, details }) => ({
//     subject: `${companyName} - ${formatRequestType(requestType)} Approved`,
//     html: `
//       <p>Dear ${fullName},</p>
//       <p>Your request of type <strong>${formatRequestType(
//         requestType
//       )}</strong> has been <strong>approved</strong> by all approvers.</p>
//       ${renderDetailsHtml(details)}
//       <p>Regards,<br/>${companyName}</p>
//     `,
//   }),

//   requestRejected: ({
//     fullName,
//     requestType,
//     remarks,
//     companyName,
//     details,
//   }) => ({
//     subject: `${companyName} - ${formatRequestType(requestType)} Rejected`,
//     html: `
//       <p>Dear ${fullName},</p>
//       <p>Your request of type <strong>${formatRequestType(
//         requestType
//       )}</strong> has been <strong>rejected</strong>.</p>
//       <p><strong>Remarks:</strong> ${remarks || "N/A"}</p>
//       ${renderDetailsHtml(details)}
//       <p>Regards,<br/>${companyName}</p>
//     `,
//   }),

//   notifyApprover: ({
//     approverName,
//     previousApprover,
//     requestType,
//     action,
//     companyName,
//     details,
//   }) => ({
//     subject: `Action Required: ${requestType} has been ${action}`,
//     html: `
//       <p>Dear ${approverName},</p>
//       <p>The request <strong>${requestType}</strong> has been <strong>${action}</strong> by <strong>${previousApprover}</strong>.</p>
//             ${renderDetailsHtml(details)}

//       <p>It is now pending your action. Please review and take appropriate action.</p>
//       <p>Regards,<br/>${companyName}</p>
//     `,
//   }),
//   notifyNextApprover: ({
//     approverName,
//     previousApprover,
//     requestType,
//     action,
//     companyName,
//     details,
//   }) => ({
//     subject: `${companyName} - ${formatRequestType(requestType)} ${action}`,
//     html: `
//       <p>Dear ${approverName},</p>
//       <p>A <strong>${formatRequestType(
//         requestType
//       )}</strong> has been <strong>${action.toLowerCase()}</strong> by <strong>${previousApprover}</strong>.</p>
//       ${renderDetailsHtml(details)}
//       <p>Please login to the HRMS to take necessary action.</p>
//       <p>Regards,<br>${companyName}</p>
//     `,
//   }),
// };

// module.exports = emailTemplates;
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const formatRequestType = (type) =>
  type?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) ?? "";

const renderDetailsHtml = (details) => {
  if (!details) return "";

  let html = `<h4>Request Details:</h4><ul>`;
  for (const [key, value] of Object.entries(details)) {
    const label = key
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    const formatted =
      value instanceof Date
        ? value.toLocaleDateString("en-IN", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
        : value ?? "N/A";
    html += `<li><strong>${label}:</strong> ${formatted}</li>`;
  }
  html += `</ul>`;
  return html;
};

const generateEmailContent = async (key, variables = {}) => {
  const template = await prisma.hrms_d_templates.findUnique({
    where: { key },
  });

  if (!template) throw new Error(`Email template with key "${key}" not found.`);

  // Add computed replacements
  const computedVars = {
    ...variables,
    request_type: formatRequestType(variables.request_type),
    request_detail: renderDetailsHtml(variables.details), // HTML block
  };

  const render = (str) =>
    (str || "").replace(/\{\{(\w+)\}\}/g, (_, key) => computedVars[key] || "");
  console.log("TEMPLATE DEBUG:");
  console.log("Template Key:", template.key);
  console.log("Raw Body:", template.body);
  console.log("Variables:", variables);
  console.log("Rendered Body:", render(template.body));

  return {
    subject: render(template.subject),
    body: render(template.body),
  };
};

module.exports = { generateEmailContent, formatRequestType, renderDetailsHtml };

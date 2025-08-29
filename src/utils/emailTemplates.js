// const { PrismaClient } = require("@prisma/client");

// const prisma = new PrismaClient();

// const formatRequestType = (type) =>
//   type?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) ?? "";

// const renderDetailsHtml = (request_detail) => {
//   if (!request_detail) return "";

//   let html = `<h4 style="margin: 0; margin-bottom: 5px;">Request Details:</h4><ul style="margin: 0; padding-left: 10px;">`;
//   for (const [key, value] of Object.entries(request_detail)) {
//     const label = key
//       .replace(/_/g, " ")
//       .replace(/\b\w/g, (c) => c.toUpperCase());
//     const formatted =
//       value instanceof Date
//         ? value.toLocaleDateString("en-IN", {
//             year: "numeric",
//             month: "short",
//             day: "numeric",
//           })
//         : value ?? "N/A";
//     html += `<li style="margin: 0; line-height: 1.2;"><strong>${label}:</strong> ${formatted}</li>`;
//   }
//   html += `</ul>`;
//   return html;
// };
// const generateEmailContent = async (key, variables = {}) => {
//   const template = await prisma.hrms_d_templates.findUnique({
//     where: { key },
//   });

//   if (!template) throw new Error(`Email template with key "${key}" not found.`);

//   if (!variables.employee_name && variables.approver_name) {
//     variables.employee_name = variables.approver_name;
//   }

//   const computedVars = {
//     ...variables,
//     request_type: formatRequestType(variables.request_type),
//     request_detail: renderDetailsHtml(variables.request_detail),
//   };

//   console.log("Template key:", key);
//   console.log("Variables received:", variables);
//   console.log("Computed variables:", computedVars);
//   console.log("Template body:", template.body);

//   const render = (str) => {
//     if (!str) return "";

//     let rendered = str.replace(/\$\{\s*(\w+)\s*\}/g, (_, key) => {
//       console.log(`Replacing \${${key}} with:`, computedVars[key]);
//       return computedVars[key] || "";
//     });

//     rendered = rendered.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => {
//       console.log(`Replacing {{${key}}} with:`, computedVars[key]);
//       return computedVars[key] || "";
//     });

//     return rendered;
//   };

//   const result = {
//     subject: render(template.subject),
//     body: render(template.body),
//   };

//   console.log("Final rendered body:", result.body);
//   return result;
// };

// module.exports = { generateEmailContent, formatRequestType, renderDetailsHtml };

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const formatRequestType = (type) =>
  type?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) ?? "";

const renderDetailsHtml = (request_detail) => {
  if (!request_detail) return "";

  let html = `<h4 style="margin: 0; margin-bottom: 5px;">Request Details:</h4><ul style="margin: 0; padding-left: 10px;">`;
  for (const [key, value] of Object.entries(request_detail)) {
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
    html += `<li style="margin: 0; line-height: 1.2;"><strong>${label}:</strong> ${formatted}</li>`;
  }
  html += `</ul>`;
  return html;
};

const extractPlaceholders = (str) => {
  const matches = str.match(/\$\{\s*(\w+)\s*\}|\{\{\s*(\w+)\s*\}\}/g) || [];
  return matches.map((m) => m.replace(/\$\{|\{|\}|\s/g, ""));
};

const autoMapVariables = (template, vars) => {
  const placeholders = [
    ...extractPlaceholders(template.subject || ""),
    ...extractPlaceholders(template.body || ""),
  ];

  const mapped = { ...vars };

  placeholders.forEach((key) => {
    if (!mapped[key]) {
      const aliasMap = {
        employee_name: [
          "employee_name",
          "user_name",
          "staff_name",
          "candidate_name",
        ],
        candidate_name: ["candidate_name"],
        requester_name: ["applicant_name", "initiator_name"],
        approver_name: ["manager_name", "reviewer_name"],
        days: ["remaining_days", "days"],
      };

      if (aliasMap[key]) {
        const alias = aliasMap[key].find((a) => vars[a]);
        if (alias) {
          mapped[key] = vars[alias];
          return;
        }
      }

      const candidate = Object.keys(vars).find(
        (k) =>
          k.toLowerCase().includes(key.toLowerCase().split("_")[0]) ||
          key.toLowerCase().includes(k.toLowerCase().split("_")[0])
      );
      if (candidate) {
        mapped[key] = vars[candidate];
      }
    }
  });

  return mapped;
};

const generateEmailContent = async (key, variables = {}) => {
  const template = await prisma.hrms_d_templates.findUnique({ where: { key } });

  if (!template) throw new Error(`Email template with key "${key}" not found.`);

  const normalizedVars = autoMapVariables(template, variables);

  const computedVars = {
    ...normalizedVars,
    request_type: formatRequestType(normalizedVars.request_type),
    request_detail: renderDetailsHtml(normalizedVars.request_detail),
  };

  const render = (str) => {
    if (!str) return "";
    return str
      .replace(/\$\{\s*(\w+)\s*\}/g, (_, key) => computedVars[key] || "")
      .replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => computedVars[key] || "");
  };

  return {
    subject: render(template.subject),
    body: render(template.body),
  };
};

module.exports = { generateEmailContent, formatRequestType, renderDetailsHtml };

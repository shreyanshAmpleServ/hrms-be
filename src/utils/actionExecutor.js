const logger = require("./../Comman/logger");
// const sendEmail = require("./../utils/mailer.js");
async function sendEmail(to, template) {
  console.log("Email:", to, template);
}
async function sendSMS(to, template) {
  console.log("SMS:", to, template);
}
async function sendSystemAlert(to, template) {
  console.log("System:", to, template);
}

const executeActions = async (employees, actions = []) => {
  const results = [];
  for (const action of actions) {
    const { type, recipients, template } = action;
    const to = recipients?.split(",").map((r) => r.trim()) || [];
    try {
      if (type === "Email") {
        const subject = template || "Contract Expiry Alert";
        const html = `<p>Dear Recipient,</p><p>The following managers have contracts expiring soon:</p><ul>${employees
          .map(
            (emp) =>
              `<li>${emp.full_name} (${
                emp.contract_expiry_date
                  ? emp.contract_expiry_date.toISOString().slice(0, 10)
                  : "N/A"
              })</li>`
          )
          .join("")}</ul>`;
        for (const recipient of to) {
          await sendEmail({ to: recipient, subject, html, log_inst: 1 }); // <-- Here’s the magic!
        }
      } else if (type === "SMS") {
      } else if (type === "System") {
      } else {
        logger.warn(`Unknown action type: ${type}`);
      }
      results.push({ type, status: "SUCCESS" });
    } catch (error) {
      results.push({ type, status: "FAILED", error: error.message });
      logger.error(`Failed to execute action ${type}: ${error.message}`);
    }
  }
  return results;
};
module.exports = { executeActions };

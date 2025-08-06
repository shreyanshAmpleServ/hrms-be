const emailTemplates = {
  requestApproved: ({ fullName, requestType }) => ({
    subject: "Your request has been approved",
    html: `
    <p> Dear ${fullName}, </p>
    <p> Your request of type <strong>${requestType}</strong> has been <strong>approved</strong> by all approvers.</p>
    <p>Regards,<br/> Team</p>
    `,
  }),

  requestRejected: ({ fullName, requestType, remarks }) => ({
    subject: "Your request has been rejected",
    html: `
    <p>Dear ${fullName},</p>
    <p>Your request of type <strong>${requestType}</strong> has been <strong>rejected</strong>.</p>
      <p><strong>Remarks:</strong> ${remarks || "N/A"}</p>
      <p>Regards,<br/> Team</p>
    `,
  }),

  requestPending: ({ fullName, requestType, remarks }) => ({
    subject: "Your request is pending",
    html: `
    <p>Dear ${fullName}, </p>
    <p>Your request of this type <strong>${requestType}</strong> is currently in <strong>pending</strong> state.</p>
    <p><strong>Remarks: </strong>${remarks} is being reviewd by team.  
    `,
  }),
};
module.exports = emailTemplates;

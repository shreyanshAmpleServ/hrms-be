const employeeKPIModel = require("../models/employeeKPIModel");
const { uploadToBackblaze } = require("../../utils/uploadBackblaze");

const createEmployeeKPI = async (req, res, next) => {
  try {
    let data = {};

    if (req.body.employee_id) data.employee_id = req.body.employee_id;
    if (req.body.reviewer_id) data.reviewer_id = req.body.reviewer_id;
    if (req.body.review_date) data.review_date = req.body.review_date;
    if (req.body.next_review_date)
      data.next_review_date = req.body.next_review_date;
    if (req.body.contract_expiry_date)
      data.contract_expiry_date = req.body.contract_expiry_date;
    if (req.body.review_remarks) data.review_remarks = req.body.review_remarks;
    if (req.body.employment_type)
      data.employment_type = req.body.employment_type;
    if (req.body.employment_remarks)
      data.employment_remarks = req.body.employment_remarks;
    if (req.body.revise_component_assignment)
      data.revise_component_assignment = req.body.revise_component_assignment;

    if (req.body.contents) {
      try {
        data.contents = JSON.parse(req.body.contents);
      } catch (e) {
        data.contents = [];
      }
    }

    if (req.body.component_assignment) {
      try {
        data.component_assignment = JSON.parse(req.body.component_assignment);
      } catch (e) {
        data.component_assignment = null;
      }
    }

    const attachments = [];
    const filesMap = {};
    const attachmentIndices = new Set();

    let attachmentsFromBody = [];

    if (req.body.attachments) {
      try {
        const parsedAttachments =
          typeof req.body.attachments === "string"
            ? JSON.parse(req.body.attachments)
            : req.body.attachments;
        if (Array.isArray(parsedAttachments)) {
          attachmentsFromBody = parsedAttachments;
        }
      } catch (e) {
        attachmentsFromBody = [];
      }
    }
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        const match = file.fieldname.match(
          /attachments\[(\d+)\]\[attachment_url\]/
        );
        if (match) {
          const index = parseInt(match[1]);
          if (!filesMap[index]) {
            filesMap[index] = {};
          }
          filesMap[index].file = file;
          attachmentIndices.add(index);
        }
      });
    }

    const attachmentsKeys = Object.keys(req.body).filter(
      (key) => key.startsWith("attachments[") && !key.includes("attachment_url")
    );

    if (attachmentsKeys.length > 0) {
      attachmentsKeys.forEach((key) => {
        const match = key.match(/attachments\[(\d+)\]\[(\w+)\]/);
        if (match) {
          const index = parseInt(match[1]);
          const field = match[2];
          attachmentIndices.add(index);

          if (!attachmentsFromBody[index]) {
            attachmentsFromBody[index] = {};
          }
          const value = req.body[key];
          attachmentsFromBody[index][field] = value !== undefined ? value : "";
        }
      });
    }

    if (attachmentsFromBody.length === 0 && Object.keys(filesMap).length > 0) {
      Object.keys(filesMap).forEach((index) => {
        const idx = parseInt(index);
        if (!attachmentsFromBody[idx]) {
          attachmentsFromBody[idx] = {};
        }
        attachmentIndices.add(idx);
      });
    }

    attachmentsFromBody = Array.from(attachmentIndices).map(
      (index) => attachmentsFromBody[index] || {}
    );

    const maxLength = Math.max(
      attachmentsFromBody.length,
      Object.keys(filesMap).length > 0
        ? Math.max(...Object.keys(filesMap).map((k) => parseInt(k))) + 1
        : 0
    );

    for (let i = 0; i < maxLength; i++) {
      const attachment = attachmentsFromBody[i] || {};
      let attachmentUrl = attachment.attachment_url || "";

      if (filesMap[i] && filesMap[i].file) {
        const file = filesMap[i].file;
        try {
          attachmentUrl = await uploadToBackblaze(
            file.buffer,
            file.originalname,
            file.mimetype,
            "kpi-attachments"
          );
        } catch (error) {
          attachmentUrl = attachment.attachment_url || "";
        }
      } else if (
        attachment.attachment_url &&
        typeof attachment.attachment_url === "string" &&
        attachment.attachment_url.startsWith("http")
      ) {
        attachmentUrl = attachment.attachment_url;
      }

      const hasData =
        (attachment.document_type_id &&
          attachment.document_type_id !== "" &&
          attachment.document_type_id !== null) ||
        (attachment.document_name &&
          attachment.document_name !== "" &&
          attachment.document_name.trim() !== "") ||
        (attachment.issue_date &&
          attachment.issue_date !== "" &&
          attachment.issue_date !== null) ||
        (attachment.expiry_date &&
          attachment.expiry_date !== "" &&
          attachment.expiry_date !== null) ||
        (attachment.remarks &&
          attachment.remarks !== "" &&
          attachment.remarks.trim() !== "") ||
        (attachmentUrl && attachmentUrl !== "") ||
        (filesMap[i] && filesMap[i].file);

      if (hasData) {
        const attachmentData = {
          document_type_id:
            attachment.document_type_id &&
            attachment.document_type_id !== "" &&
            attachment.document_type_id !== null &&
            attachment.document_type_id !== "null"
              ? Number(attachment.document_type_id)
              : null,
          document_name: attachment.document_name || "",
          issue_date: attachment.issue_date || new Date().toISOString(),
          expiry_date:
            attachment.expiry_date &&
            attachment.expiry_date !== "" &&
            attachment.expiry_date !== "null"
              ? attachment.expiry_date
              : null,
          remarks: attachment.remarks || "",
          attachment_url: attachmentUrl,
        };
        attachments.push(attachmentData);
      }
    }

    data.attachments = attachments;
    data.createdby = req.user?.id || 1;

    const result = await employeeKPIModel.createEmployeeKPI(data);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const getEmployeeKPIById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await employeeKPIModel.findEmployeeKPIById(id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const approveEmployeeKPI = async (req, res, next) => {
  try {
    const { id } = req.params;
    const approverId = req.user?.id || 1;
    const result = await employeeKPIModel.approveEmployeeKPI(id, approverId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const getLastKPIForEmployee = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const result = await employeeKPIModel.getLastKPIForEmployee(employeeId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const getLastComponentAssignment = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const result = await employeeKPIModel.getLastComponentAssignmentForEmployee(
      employeeId
    );
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const updateEmployeeKPI = async (req, res, next) => {
  try {
    const { id } = req.params;
    let data = {};

    if (req.body.employee_id) data.employee_id = req.body.employee_id;
    if (req.body.reviewer_id) data.reviewer_id = req.body.reviewer_id;
    if (req.body.review_date) data.review_date = req.body.review_date;
    if (req.body.next_review_date)
      data.next_review_date = req.body.next_review_date;
    if (req.body.contract_expiry_date)
      data.contract_expiry_date = req.body.contract_expiry_date;
    if (req.body.review_remarks) data.review_remarks = req.body.review_remarks;
    if (req.body.employment_type)
      data.employment_type = req.body.employment_type;
    if (req.body.employment_remarks)
      data.employment_remarks = req.body.employment_remarks;
    if (req.body.revise_component_assignment)
      data.revise_component_assignment = req.body.revise_component_assignment;

    if (req.body.contents) {
      try {
        data.contents = JSON.parse(req.body.contents);
      } catch (e) {
        data.contents = [];
      }
    }

    if (req.body.component_assignment) {
      try {
        data.component_assignment = JSON.parse(req.body.component_assignment);
      } catch (e) {
        data.component_assignment = null;
      }
    }

    const attachments = [];
    const filesMap = {};
    const attachmentIndices = new Set();

    let attachmentsFromBody = [];

    if (req.body.attachments) {
      try {
        const parsedAttachments =
          typeof req.body.attachments === "string"
            ? JSON.parse(req.body.attachments)
            : req.body.attachments;
        if (Array.isArray(parsedAttachments)) {
          attachmentsFromBody = parsedAttachments;
        }
      } catch (e) {
        attachmentsFromBody = [];
      }
    }
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        const match = file.fieldname.match(
          /attachments\[(\d+)\]\[attachment_url\]/
        );
        if (match) {
          const index = parseInt(match[1]);
          if (!filesMap[index]) {
            filesMap[index] = {};
          }
          filesMap[index].file = file;
          attachmentIndices.add(index);
        }
      });
    }

    const attachmentsKeys = Object.keys(req.body).filter(
      (key) => key.startsWith("attachments[") && !key.includes("attachment_url")
    );

    if (attachmentsKeys.length > 0) {
      attachmentsKeys.forEach((key) => {
        const match = key.match(/attachments\[(\d+)\]\[(\w+)\]/);
        if (match) {
          const index = parseInt(match[1]);
          const field = match[2];
          attachmentIndices.add(index);

          if (!attachmentsFromBody[index]) {
            attachmentsFromBody[index] = {};
          }
          const value = req.body[key];
          attachmentsFromBody[index][field] = value !== undefined ? value : "";
        }
      });
    }

    if (attachmentsFromBody.length === 0 && Object.keys(filesMap).length > 0) {
      Object.keys(filesMap).forEach((index) => {
        const idx = parseInt(index);
        if (!attachmentsFromBody[idx]) {
          attachmentsFromBody[idx] = {};
        }
        attachmentIndices.add(idx);
      });
    }

    attachmentsFromBody = Array.from(attachmentIndices).map(
      (index) => attachmentsFromBody[index] || {}
    );

    const maxLength = Math.max(
      attachmentsFromBody.length,
      Object.keys(filesMap).length > 0
        ? Math.max(...Object.keys(filesMap).map((k) => parseInt(k))) + 1
        : 0
    );

    for (let i = 0; i < maxLength; i++) {
      const attachment = attachmentsFromBody[i] || {};
      let attachmentUrl = attachment.attachment_url || "";

      if (filesMap[i] && filesMap[i].file) {
        const file = filesMap[i].file;
        try {
          attachmentUrl = await uploadToBackblaze(
            file.buffer,
            file.originalname,
            file.mimetype,
            "kpi-attachments"
          );
        } catch (error) {
          attachmentUrl = attachment.attachment_url || "";
        }
      } else if (
        attachment.attachment_url &&
        typeof attachment.attachment_url === "string" &&
        attachment.attachment_url.startsWith("http")
      ) {
        attachmentUrl = attachment.attachment_url;
      }

      const hasData =
        (attachment.document_type_id &&
          attachment.document_type_id !== "" &&
          attachment.document_type_id !== null) ||
        (attachment.document_name &&
          attachment.document_name !== "" &&
          attachment.document_name.trim() !== "") ||
        (attachment.issue_date &&
          attachment.issue_date !== "" &&
          attachment.issue_date !== null) ||
        (attachment.expiry_date &&
          attachment.expiry_date !== "" &&
          attachment.expiry_date !== null) ||
        (attachment.remarks &&
          attachment.remarks !== "" &&
          attachment.remarks.trim() !== "") ||
        (attachmentUrl && attachmentUrl !== "") ||
        (filesMap[i] && filesMap[i].file);

      if (hasData) {
        const attachmentData = {
          document_type_id:
            attachment.document_type_id &&
            attachment.document_type_id !== "" &&
            attachment.document_type_id !== null &&
            attachment.document_type_id !== "null"
              ? Number(attachment.document_type_id)
              : null,
          document_name: attachment.document_name || "",
          issue_date: attachment.issue_date || new Date().toISOString(),
          expiry_date:
            attachment.expiry_date &&
            attachment.expiry_date !== "" &&
            attachment.expiry_date !== "null"
              ? attachment.expiry_date
              : null,
          remarks: attachment.remarks || "",
          attachment_url: attachmentUrl,
        };
        attachments.push(attachmentData);
      }
    }

    data.attachments = attachments;
    data.createdby = req.user?.id || 1;
    data.updatedby = req.user?.id || 1;

    const result = await employeeKPIModel.updateEmployeeKPI(id, data);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const deleteEmployeeKPI = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await employeeKPIModel.deleteEmployeeKPI(id);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

const getAllEmployeeKPI = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate, employee_id, status } =
      req.query;
    const result = await employeeKPIModel.getAllEmployeeKPI(
      page,
      size,
      search,
      startDate,
      endDate,
      employee_id,
      status
    );
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createEmployeeKPI,
  getEmployeeKPIById,
  approveEmployeeKPI,
  getLastKPIForEmployee,
  getLastComponentAssignment,
  getAllEmployeeKPI,
  updateEmployeeKPI,
  deleteEmployeeKPI,
};

const emailTemplateService = require("../services/emailTemplateService.js");
const moment = require("moment");

const createEmailTemplate = async (req, res) => {
  try {
    const result = await emailTemplateService.createEmailTemplate(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// const getAllEmailTemplate = async (req, res, next) => {
//   try {
//     const { page, size, search, startDate, endDate } = req.query;
//     const data = await emailTemplateService.getAllEmailTemplate(
//       search,
//       Number(page),
//       Number(size),
//       startDate || null,
//       endDate || null
//     );
//     res.status(200).success(null, data);
//   } catch (error) {
//     next(error);
//   }
// };

const getAllEmailTemplate = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate, type, channel } = req.query;

    console.log("search:", search);
    console.log("type:", type);
    console.log("channel:", channel);
    console.log("startDate:", startDate);
    console.log("endDate:", endDate);

    const data = await emailTemplateService.getAllEmailTemplate(
      search,
      Number(page),
      Number(size),
      startDate,
      endDate,
      type,
      channel
    );
    res.status(200).success(null, data);
  } catch (error) {
    next(error);
  }
};
const getEmailTemplateById = async (req, res) => {
  try {
    const result = await emailTemplateService.getEmailTemplateById(
      req.params.id
    );
    if (!result) return res.status(404).json({ error: "Not found" });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateEmailTemplate = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      updatedby: req.user.employee_id,
      log_inst: req.user.log_inst,
    };
    const result = await emailTemplateService.updateEmailTemplate(
      req.params.id,
      data
    );
    res.status(200).success("Email Template updated successfully", result);
  } catch (error) {
    next(error);
  }
};

const deleteEmailTemplate = async (req, res) => {
  try {
    await emailTemplateService.deleteEmailTemplate(+req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  createEmailTemplate,
  getAllEmailTemplate,
  getEmailTemplateById,
  updateEmailTemplate,
  deleteEmailTemplate,
};

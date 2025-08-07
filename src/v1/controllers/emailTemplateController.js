const emailTemplateService = require("../services/emailTemplateService.js");

const createEmailTemplate = async (req, res) => {
  try {
    const result = await emailTemplateService.createEmailTemplate(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getAllEmailTemplate = async (req, res) => {
  try {
    const result = await emailTemplateService.getAllEmailTemplate();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
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

const updateEmailTemplate = async (req, res) => {
  try {
    const result = await emailTemplateService.updateEmailTemplate(
      +req.params.id,
      req.body
    );
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
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

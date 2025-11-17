const { getPrisma } = require("../../config/prismaContext.js");
// src/middleware/responseLogger.js
const { logActivity } = require("../utils/ActivityLogger");

module.exports = function responseLogger(req, res, next) {
  res.success = async (message = "Success", data = null) => {
    try {
      const action_type = req.method === "GET" ? "GET" : "POST";

      const module = (req.baseUrl || req.originalUrl || "")
        .replace("/api", "")
        .replace(/^\//, "")
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());

      let reference_id = null;
      if (data?.id) reference_id = data.id;
      else if (Array.isArray(data) && data[0]?.id) reference_id = data[0].id;
      else if (req.body?.id) reference_id = req.body.id;

      if (req.user?.employee_id) {
        await logActivity({
          employee_id: req.user.employee_id,
          module,
          activity: message,
          reference_id,
          description: null,
          action_type,
        });
      } else {
        console.warn("⚠️ req.user.employee_id is missing");
      }
    } catch (e) {
      console.warn("⚠️ Activity log skipped:", e.message);
    }

    return res.status(200).json({
      success: true,
      message,
      data,
    });
  };

  res.error = (message = "Something went wrong", status = 500) => {
    return res.status(status).json({
      success: false,
      message,
      data: null,
      status,
    });
  };

  next();
};

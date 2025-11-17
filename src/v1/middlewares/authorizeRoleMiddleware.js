const { getPrisma } = require("../../config/prismaContext.js");
const authorizeRole = (allowedRoles = []) => {
  return (req, res, next) => {
    const userRole = req.user?.role;

    if (!userRole) {
      return res.error("Access denied: no role assigned to user", 403);
    }

    const normalizedUserRole = userRole.toLowerCase();
    const normalizedAllowed = allowedRoles.map((r) => r.toLowerCase());

    if (!normalizedAllowed.includes(normalizedUserRole)) {
      console.warn(`Access denied for role: ${userRole}`);
      return res.error("Access denied: insufficient role", 403);
    }

    next();
  };
};

module.exports = { authorizeRole };

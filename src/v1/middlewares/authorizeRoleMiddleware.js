const authorizeRole = (allowedRoles = []) => {
  return (req, res, next) => {
    const userRole = req.user?.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.error("Access denied: insufficient role", 403);
    }

    next();
  };
};

module.exports = { authorizeRole };

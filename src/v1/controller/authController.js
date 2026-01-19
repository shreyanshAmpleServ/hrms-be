const { registerUser, loginUser } = require("../services/authService");

const register = async (req, res, next) => {
  try {
    const { email, password, full_name = null, role_id } = req.body;

    const tenantDb = req.headers["x-tenant-db"] || req.body.dbName;

    if (!tenantDb) {
      return res.status(400).json({
        success: false,
        message: "Please provide tenant database name (x-tenant-db header)",
      });
    }

    const user = await registerUser(
      email,
      password,
      full_name,
      role_id,
      tenantDb
    );
    res.status(201).success("User registered successfully", user);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const tenantDb = req.headers["x-tenant-db"] || req.body.dbName;

    if (!tenantDb) {
      return res.status(400).json({
        success: false,
        message: "Please provide tenant database name (x-tenant-db header)",
      });
    }

    const data = await loginUser(email, password, tenantDb);

    res.cookie("authToken", data.token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(200).success("Login successful", data.user);
  } catch (error) {
    next(error);
  }
};
const logout = (req, res, next) => {
  try {
    res.clearCookie("authToken", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });

    res.status(200).success("Logout successful", null);
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, logout };

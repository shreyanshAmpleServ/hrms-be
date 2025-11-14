const express = require("express");
const router = express.Router();
const seederController = require("../controller/seederController");

/**
 * Public route to run Super Admin seeder
 * GET /api/v1/seed-super-admin?dbName=your_database_name&email=admin@hrms.com&password=admin@123&fullName=Super Admin
 * POST /api/v1/seed-super-admin
 * Body: { dbName: "your_database_name", email: "admin@hrms.com", password: "admin@123", fullName: "Super Admin" }
 */
router.get("/seed-super-admin", seederController.runSeeder);
router.post("/seed-super-admin", seederController.runSeeder);

module.exports = router;

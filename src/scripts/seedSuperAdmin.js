#!/usr/bin/env node

/**
 * CLI Script to seed Super Admin user
 * Usage: npm run seed:admin -- <dbName> [email] [password] [fullName]
 * Example: npm run seed:admin -- hrms_production admin@hrms.com admin@123 "Super Admin"
 */

require("dotenv").config();
const seederService = require("../v1/services/seederService");

// Get command line arguments
const args = process.argv.slice(2);

// Parse arguments
const dbName = args[0];
const email = args[1] || "admin@hrms.com";
const password = args[2] || "admin@123";
const fullName = args[3] || "Super Admin";

// Validate required arguments
if (!dbName) {
  console.error("\n❌ Error: Database name is required!");
  console.log("\nUsage:");
  console.log("  npm run seed:admin -- <dbName> [email] [password] [fullName]");
  console.log("\nExamples:");
  console.log("  npm run seed:admin -- hrms_production");
  console.log(
    '  npm run seed:admin -- hrms_production admin@example.com "SecurePass123" "Super Admin"'
  );
  console.log("\nOptions:");
  console.log("  dbName    - Database name (required)");
  console.log("  email     - Admin email (default: admin@hrms.com)");
  console.log("  password  - Admin password (default: admin@123)");
  console.log("  fullName  - Admin full name (default: Super Admin)");
  process.exit(1);
}

// Validate database name format
if (!/^[a-zA-Z0-9_-]+$/.test(dbName)) {
  console.error("\n❌ Error: Invalid database name format!");
  console.log(
    "Database name should only contain alphanumeric characters, underscores, and hyphens."
  );
  process.exit(1);
}

// Run seeder
(async () => {
  try {
    console.log("\n🌱 Starting Super Admin seeder...");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`📦 Database: ${dbName}`);
    console.log(`📧 Email: ${email}`);
    console.log(`👤 Full Name: ${fullName}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    const result = await seederService.seedSuperAdmin(dbName, {
      email,
      password,
      fullName,
    });

    console.log("✅ Success! Super Admin created successfully");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`👤 User ID: ${result.data.user.id}`);
    console.log(`📧 Email: ${result.data.user.email}`);
    console.log(`👤 Full Name: ${result.data.user.full_name}`);
    console.log(`🔑 Role: ${result.data.role.role_name}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(
      "\n⚠️  Important: Change the default password after first login!\n"
    );

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error running seeder:");
    console.error(`   ${error.message}`);
    console.error("\n");

    if (error.status === 400) {
      console.log(
        "💡 Tip: Make sure the database is empty before running the seeder."
      );
    }

    process.exit(1);
  }
})();

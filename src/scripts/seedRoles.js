#!/usr/bin/env node

require("dotenv").config();
const seederService = require("../v1/services/seederService");

const args = process.argv.slice(2);

const dbName = args[0];

if (!dbName) {
  console.error("\n❌ Error: Database name is required!");
  console.log("\nUsage:");
  console.log("  npm run seed:roles -- <dbName>");
  console.log("\nExamples:");
  console.log("  npm run seed:roles -- hrms_production");
  console.log("  npm run seed:roles -- hrms_development");
  console.log("\nOptions:");
  console.log("  dbName    - Database name (required)");
  process.exit(1);
}

if (!/^[a-zA-Z0-9_-]+$/.test(dbName)) {
  console.error("\n❌ Error: Invalid database name format!");
  console.log(
    "Database name should only contain alphanumeric characters, underscores, and hyphens."
  );
  process.exit(1);
}

(async () => {
  try {
    console.log("\n🌱 Starting Roles seeder...");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`📦 Database: ${dbName}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    const result = await seederService.seedRoles(dbName);

    console.log("✅ Success! Roles seeding completed");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`📊 Total Created: ${result.data.totalCreated}`);
    console.log(`⏭️  Total Skipped: ${result.data.totalSkipped}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    if (result.data.created.length > 0) {
      console.log("\n✅ Created Roles:");
      result.data.created.forEach((role) => {
        console.log(`   • ${role.role_name} (ID: ${role.id})`);
      });
    }

    if (result.data.skipped.length > 0) {
      console.log("\n⏭️  Skipped Roles (already exist):");
      result.data.skipped.forEach((role) => {
        console.log(`   • ${role.role_name}`);
      });
    }

    console.log("\n");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error running seeder:");
    console.error(`   ${error.message}`);
    console.error("\n");

    process.exit(1);
  }
})();

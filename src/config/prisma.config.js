// This file is kept for backward compatibility
// For dynamic database connections, use prismaContext.js instead
const { getPrisma } = require("./prismaContext.js");

// Export getPrisma as default for backward compatibility
module.exports = getPrisma;

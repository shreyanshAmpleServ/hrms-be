const { AsyncLocalStorage } = require("async_hooks");
const { getPrismaClient } = require("../config/db.js");

const asyncLocalStorage = new AsyncLocalStorage();

const createPrismaProxy = () => {
  return new Proxy(
    {},
    {
      get(_target, prop) {
        const store = asyncLocalStorage.getStore();

        if (!store || !store.tenantDb) {
          throw new Error(
            `No tenant database context found.
          Current property accessed: ${String(prop)}`
          );
        }

        const tenantPrisma = getPrismaClient(store.tenantDb);
        return tenantPrisma[prop];
      },
    }
  );
};

const prisma = createPrismaProxy();

function withTenantContext(tenantDb, fn) {
  return asyncLocalStorage.run({ tenantDb }, fn);
}

/**
 * Ensures an operation runs within the tenant context
 * If context is already set, uses it; otherwise uses the provided tenantDb
 */
function ensureTenantContext(tenantDb, fn) {
  const store = asyncLocalStorage.getStore();
  if (store && store.tenantDb) {
    // Context already exists, just run the function
    return fn();
  }
  // No context, create one
  return withTenantContext(tenantDb, fn);
}

module.exports = {
  prisma,
  withTenantContext,
  ensureTenantContext,
  asyncLocalStorage,
};

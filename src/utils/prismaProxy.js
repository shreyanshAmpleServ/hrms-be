const { AsyncLocalStorage } = require("async_hooks");
const { getPrismaClient } = require("../config/db.js");

const asyncLocalStorage = new AsyncLocalStorage();

/**
 * Creates a Prisma proxy that routes database calls to the correct tenant database.
 * The proxy uses AsyncLocalStorage to determine which tenant database to use.
 * @returns {Proxy} A proxy object that intercepts property access and routes to tenant-specific Prisma client
 */
const createPrismaProxy = () => {
  return new Proxy(
    {},
    {
      /**
       * Intercepts property access on the prisma proxy.
       * Retrieves the tenant database from AsyncLocalStorage and returns the corresponding Prisma model.
       * @param {Object} _target - The proxy target (unused)
       * @param {string} prop - The property name being accessed (e.g., 'hrms_d_candidate_master')
       * @returns {Object} The Prisma model for the current tenant
       * @throws {Error} If no tenant database context is found
       */
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

/**
 * Executes a function within a tenant database context.
 * The context is maintained for all async operations within the function.
 * @param {string} tenantDb - The tenant database identifier
 * @param {Function} fn - The function to execute within the tenant context
 * @returns {Promise|any} The result of the function execution
 */
function withTenantContext(tenantDb, fn) {
  return asyncLocalStorage.run({ tenantDb }, fn);
}

/**
 * Ensures an operation runs within the tenant context.
 * If a context is already set, uses it; otherwise creates a new context with the provided tenantDb.
 * @param {string} tenantDb - The tenant database identifier (used if no context exists)
 * @param {Function} fn - The function to execute within the tenant context
 * @returns {Promise|any} The result of the function execution
 */
function ensureTenantContext(tenantDb, fn) {
  const store = asyncLocalStorage.getStore();
  if (store && store.tenantDb) {
    return fn();
  }
  return withTenantContext(tenantDb, fn);
}

module.exports = {
  prisma,
  withTenantContext,
  ensureTenantContext,
  asyncLocalStorage,
};

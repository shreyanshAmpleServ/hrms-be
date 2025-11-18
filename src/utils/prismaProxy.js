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

module.exports = {
  prisma,
  withTenantContext,
  asyncLocalStorage,
};

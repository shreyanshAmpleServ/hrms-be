const { PrismaClient, Prisma } = require("@prisma/client");
const prisma = new PrismaClient();

const saveContractPayComponents = async (contractId, components, userId) => {
  if (!components || components.length === 0) {
    console.log("No pay components to save");
    return;
  }

  await prisma.hrms_d_pay_component_contract.deleteMany({
    where: { contract_id: contractId },
  });

  const result = await prisma.hrms_d_pay_component_contract.createMany({
    data: components.map((c) => ({
      contract_id: contractId,
      pay_component_id: c.pay_component_id,
      amount: new Prisma.Decimal(c.amount),
      currency_id: c.currency_id || null,
      createdby: userId,
      log_inst: 1,
    })),
  });

  console.log(" Saved components result:", result);
};

module.exports = { saveContractPayComponents };

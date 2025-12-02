const createLoanType = async (data) => {
  try {
    // Check if loan_name already exists
    const existing = await prisma.hrms_m_loan_type.findFirst({
      where: {
        loan_name: data.loan_name,
      },
    });

    if (existing) {
      throw new CustomError("Loan name already exists", 400);
    }

    const reqData = await prisma.hrms_m_loan_type.create({
      data: {
        ...serializeData(data),
        createdby: data.createdby || 1,
        createdate: new Date(),
        log_inst: data.log_inst || 1,
      },
    });

    return reqData;
  } catch (error) {
    console.error("Error creating loan type:", error);
    throw new CustomError(`Error creating loan type: ${error.message}`, 500);
  }
};

const updateLoanType = async (id, data) => {
  try {
    // Check duplicate loan_name with different id
    const existing = await prisma.hrms_m_loan_type.findFirst({
      where: {
        loan_name: data.loan_name,
        NOT: { id: parseInt(id) },
      },
    });

    if (existing) {
      throw new CustomError("Loan name already exists", 400);
    }

    const updatedLoanType = await prisma.hrms_m_loan_type.update({
      where: { id: parseInt(id) },
      data: {
        ...serializeData(data),
        updatedby: data.updatedby || 1,
        updatedate: new Date(),
      },
    });

    return updatedLoanType;
  } catch (error) {
    throw new CustomError(`Error updating loan type: ${error.message}`, 500);
  }
};

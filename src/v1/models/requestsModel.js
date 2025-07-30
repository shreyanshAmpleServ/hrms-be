const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const { log } = require("winston");
const prisma = new PrismaClient();

const serializeRequestsData = (data) => ({
  requester_id: Number(data.requester_id),
  request_type: data.request_type || null,
  request_data: data.request_data || null,
  status: data.status || "N",
  title: data.title || null,
  no_of_approvers: Number(data.no_of_approvers) || 0,
});

// const createRequest = async (data) => {
//   try {
//     const reqData = await prisma.hrms_d_requests.create({
//       data: {
//         ...serializeRequestsData(data),
//         createdby: data.createdby || 1,
//         createdate: new Date(),
//         log_inst: data.log_inst || 1,
//       },
//       include: {
//         requests_employee: {
//           select: { id: true, full_name: true, employee_code: true },
//         },
//       },
//     });
//     return reqData;
//   } catch (error) {
//     throw new CustomError(`Error creating request model ${error.message}`, 500);
//   }
// };

const createRequest = async (data) => {
  const { children = [], ...parentData } = data;
  try {
    if (parentData.request_type) {
      const existingRequest = await prisma.hrms_d_requests.findFirst({
        where: { request_type: parentData.request_type },
      });
      if (existingRequest) {
        throw new CustomError(
          `Request type '${parentData.request_type}' already exists`,
          400
        );
      }
    }

    const reqData = await prisma.hrms_d_requests.create({
      data: {
        ...serializeRequestsData(parentData),
        createdby: parentData.createdby || 1,
        createdate: new Date(),
        log_inst: parentData.log_inst || 1,
      },
    });

    if (children.length > 0) {
      const approvalsToInsert = children.map((child, index) => ({
        request_id: reqData.id,
        approver_id: Number(child.approver_id),
        sequence: Number(child.sequence) || index + 1,
        status: child.status || "Pending",
        action_at: child.action_at ? new Date(child.action_at) : null,
        createdby: parentData.createdby || 1,
        createdate: new Date(),
        updatedby: parentData.updatedby || null,
        updatedate: new Date(),
        log_inst: parentData.log_inst || 1,
      }));
      console.log("reqData =>", reqData);

      await prisma.hrms_d_requests_approval.createMany({
        data: approvalsToInsert,
      });
    }

    const fullData = await prisma.hrms_d_requests.findUnique({
      where: { id: reqData.id },
      include: {
        requests_employee: {
          select: {
            id: true,
            full_name: true,
            employee_code: true,
          },
        },
        request_approval_request: {
          select: {
            id: true,
            request_id: true,
            approver_id: true,
            sequence: true,
            status: true,
            action_at: true,
            createdate: true,
            createdby: true,
            updatedate: true,
            updatedby: true,
            log_inst: true,
            request_approval_approver: {
              select: {
                id: true,
                full_name: true,
                employee_code: true,
              },
            },
          },
        },
      },
    });

    return {
      ...fullData,
    };
  } catch (error) {
    throw new CustomError(`Error creating request model ${error.message}`, 500);
  }
};

const updateRequests = async (id, data) => {
  try {
    const updatedEntry = await prisma.hrms_d_requests.update({
      where: { request_id: parseInt(id) },
      include: {
        requests_employee: {
          select: { id: true, full_name: true, employee_code: true },
        },
      },
      data: {
        ...serializeRequestsData(data),
        updatedby: data.updatedby || 1,
        updatedate: new Date(),
      },
    });

    return updatedEntry;
  } catch (error) {
    throw new CustomError(`Error updating requets: ${error.message}`, 500);
  }
};

// const deleteRequests = async (id) => {
//   try {
//     await prisma.hrms_d_requests.delete({
//       where: { request_id: parseInt(id) },
//     });
//   } catch (error) {
//     throw new CustomError(`Error deleting requets: ${error.message}`, 500);
//   }
// };

const deleteRequests = async (id) => {
  try {
    await prisma.hrms_d_requests_approval.deleteMany({
      where: { request_id: parseInt(id) },
    });

    await prisma.hrms_d_requests.delete({
      where: { request_id: parseInt(id) },
    });
  } catch (error) {
    throw new CustomError(`Error deleting requets: ${error.message}`, 500);
  }
};
const getAllRequests = async (search, page, size, startDate, endDate) => {
  try {
    page = !page || page == 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size || 0;

    const filters = {};
    if (search) {
      filters.OR = [
        { request_type: { contains: search.toLowerCase() } },
        { request_data: { contains: search.toLowerCase() } },
      ];
    }
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        filters.createdate = { gte: start, lte: end };
      }
    }

    const datas = await prisma.hrms_d_requests.findMany({
      where: filters,
      skip,
      take: size,
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
      include: {
        requests_employee: {
          select: {
            id: true,
            full_name: true,
            employee_code: true,
          },
        },
        request_approval_request: {
          select: {
            id: true,
            request_id: true,
            approver_id: true,
            sequence: true,
            status: true,
            action_at: true,
            createdate: true,
            createdby: true,
            updatedate: true,
            updatedby: true,
            log_inst: true,
            request_approval_approver: {
              select: {
                id: true,
                full_name: true,
                employee_code: true,
              },
            },
          },
        },
      },
    });

    const totalCount = await prisma.hrms_d_requests.count({ where: filters });

    return {
      data: datas,
      currentPage: page,
      size,
      totalPages: Math.ceil(totalCount / size),
      totalCount,
    };
  } catch (error) {
    throw new CustomError("Error retrieving requests", 503);
  }
};

const findRequests = async (request_id) => {
  try {
    const reqData = await prisma.hrms_d_requests.findUnique({
      where: { request_id: parseInt(request_id) },
    });
    if (!reqData) {
      throw new CustomError("Request  not found", 404);
    }
    return reqData;
  } catch (error) {
    throw new CustomError(`Error finding Request by ID: ${error.message}`, 503);
  }
};
module.exports = {
  createRequest,
  deleteRequests,
  updateRequests,
  findRequests,
  getAllRequests,
};

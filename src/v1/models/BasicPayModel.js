const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const prisma = new PrismaClient();
const xlsx = require("xlsx");

const moment = require("moment");
const { errorNotExist } = require("../../Comman/errorNotExist");
const requiredFields = {
  pay_component_id: "Pay Component is required",
  amount: "Amount is required",
  is_taxable: "Is Taxable is required",
  is_recurring: "Is Recurring is required",
  is_worklife_related: "Is Worklife Related is required",
  is_grossable: "Is Grossable is required",
  component_type: "Component Type is required",
};
// Serialize  before saving it
const serializeHeaders = (data) => {
  const serialized = {};

  // Required fields
  if ("employee_id" in data) serialized.employee_id = Number(data.employee_id);
  if ("effective_from" in data) {
    serialized.effective_from = new Date(data.effective_from);
  }
  if ("effective_to" in data && data.effective_to) {
    serialized.effective_to = new Date(data.effective_to);
  }
  // Optional fields
  if ("department_id" in data)
    serialized.department_id = Number(data.department_id);
  if ("branch_id" in data) serialized.branch_id = Number(data.branch_id);
  if ("position_id" in data) serialized.position_id = Number(data.position_id);
  if ("pay_grade_id" in data)
    serialized.pay_grade_id = Number(data.pay_grade_id);
  if ("pay_grade_level" in data)
    serialized.pay_grade_level = Number(data.pay_grade_level);
  if ("allowance_group" in data)
    serialized.allowance_group = data.allowance_group;
  if ("work_life_entry" in data)
    serialized.work_life_entry = Number(data.work_life_entry);
  if ("status" in data) serialized.status = data.status;
  if ("remarks" in data) serialized.remarks = data.remarks;

  return serialized;
};

const serializePayLine = (data) => {
  return {
    line_num: Number(data?.line_num) || 0,
    pay_component_id: Number(data?.pay_component_id),
    amount: Number(data?.amount) || 0,
    type_value: Number(data?.type_value) || 0,
    currency_id: data?.currency_id ? Number(data.currency_id) : null,
    is_taxable: data?.is_taxable || "Y",
    is_recurring: data?.is_recurring || "Y",
    is_worklife_related: data?.is_worklife_related || "N",
    is_grossable: data?.is_grossable || "N",
    remarks: data?.remarks || null,
    tax_code_id: data?.tax_code_id ? Number(data.tax_code_id) : null,
    gl_account_id: data?.gl_account_id ? Number(data.gl_account_id) : null,
    factor: data?.factor ? Number(data.factor) : null,
    payable_glaccount_id: data?.payable_glaccount_id
      ? Number(data.payable_glaccount_id)
      : null,
    component_type: data?.component_type || "O",
    project_id: data?.project_id ? Number(data.project_id) : null,
    cost_center1_id: data?.cost_center1_id
      ? Number(data.cost_center1_id)
      : null,
    cost_center2_id: data?.cost_center2_id
      ? Number(data.cost_center2_id)
      : null,
    cost_center3_id: data?.cost_center3_id
      ? Number(data.cost_center3_id)
      : null,
    cost_center4_id: data?.cost_center4_id
      ? Number(data.cost_center4_id)
      : null,
    cost_center5_id: data?.cost_center5_id
      ? Number(data.cost_center5_id)
      : null,
    column_order: data?.column_order ? Number(data.column_order) : null,
  };
};

// Parse  after retrieving it
const parseData = (data) => {
  if (data && data.social_medias) {
    data.social_medias = JSON.parse(data.social_medias);
  }
  return data;
};

// Check if contactIds are valid and exist
const validateContactsExist = async (contactIds) => {
  const contacts = await prisma.crms_m_contact.findMany({
    where: {
      id: {
        in: contactIds.map((contactId) => parseInt(contactId)), // Ensure all are valid integers
      },
    },
  });

  if (contacts?.length !== contactIds.length) {
    throw new CustomError(
      "One or more contact IDs are invalid or do not exist.",
      400
    );
  }
};

// Create a new employee
const createBasicPay = async (data) => {
  const { payLineData, ...headerDatas } = data; // Separate `contactIds` from other deal data
  try {
    await errorNotExist("hrms_d_employee", data.employee_id, "Employee");
    if (!data.employee_id) {
      throw new CustomError(`Employee is required`, 400);
    }
    if (!data.effective_from) {
      throw new CustomError(`Effective from  is required`, 400);
    }
    if (!data.status) {
      throw new CustomError(`Status Type is required`, 400);
    }

    const existing =
      await prisma.hrms_d_employee_pay_component_assignment_header.findFirst({
        where: { employee_id: Number(data.employee_id) },
      });
    if (existing) {
      throw new CustomError(
        "Component is already assigned for this employee.",
        400
      );
    }
    const serializedData = serializeHeaders(headerDatas);
    // Use transaction for atomicity
    const result = await prisma.$transaction(async (prisma) => {
      // Create the employee
      const payHeader =
        await prisma.hrms_d_employee_pay_component_assignment_header.create({
          data: {
            ...serializedData,
            // is_active: data.is_active || "Y",
            createdate: new Date(),
            createdby: data.createdby || 1,
            log_inst: data.log_inst || 1,
          },
        });
      // const serializedAddres = serializePayLine(payLineData);
      // // Map contacts to the employee
      // const addressDatas = {
      //   ...serializedAddres,
      //   employee_id: employee.id,
      // };
      const lineDatas = payLineData.map((addr) => ({
        ...serializePayLine(addr),
        parent_id: payHeader.id,
        createdate: new Date(),
        createdby: headerDatas.createdby || 1,
      }));
      for (const addr of payLineData) {
        for (const [field, message] of Object.entries(requiredFields)) {
          if (!addr[field]) {
            throw new CustomError(message, 400);
          }
        }
      }

      await prisma.hrms_d_employee_pay_component_assignment_line.createMany({
        data: lineDatas,
      });

      return payHeader?.id;
      // return fullData;
    });
    const fullData =
      await prisma.hrms_d_employee_pay_component_assignment_header.findFirst({
        where: { id: result },
        include: {
          hrms_d_employee_pay_component_assignment_line: {
            include: {
              pay_component_line_currency: {
                select: {
                  id: true,
                  currency_name: true,
                  currency_code: true,
                },
              },
              // pay_component_line_tax_slab: {
              //   select: {
              //     id: true,
              //     pay_component_id: true,
              //     rule_type: true,
              //   },
              // },
              pay_component_line_project: {
                select: {
                  id: true,
                  code: true,
                  name: true,
                },
              },
              pay_component_line_cost_center1: {
                select: {
                  id: true,
                  name: true,
                  dimension_id: true,
                },
              },
              pay_component_line_cost_center2: {
                select: {
                  id: true,
                  name: true,
                  dimension_id: true,
                },
              },
              pay_component_line_cost_center3: {
                select: {
                  id: true,
                  name: true,
                  dimension_id: true,
                },
              },
              pay_component_line_cost_center4: {
                select: {
                  id: true,
                  name: true,
                  dimension_id: true,
                },
              },
              pay_component_line_cost_center5: {
                select: {
                  id: true,
                  name: true,
                  dimension_id: true,
                },
              },
            },
          },
          work_life_entry_pay_header: {
            select: {
              id: true,
              event_type: true,
              work_life_event_type: {
                select: {
                  id: true,
                  event_type_name: true,
                },
              },
            },
          },
          branch_pay_component_header: {
            select: { id: true, branch_name: true },
          },
          hrms_d_employee: {
            include: {
              hrms_employee_department: {
                select: {
                  id: true,
                  department_name: true,
                },
              },
              hrms_employee_designation: {
                select: {
                  id: true,
                  designation_name: true,
                },
              },
            },
          },
        },
      });

    return parseData(fullData);
  } catch (error) {
    console.log("Error to Create employee : ", error);
    throw new CustomError(
      `Error creating employee: ${error.message}`,
      error.status || 500
    );
  }
};

// Update an existing employee
const updateBasicPay = async (id, data) => {
  const { payLineData, ...headerDatas } = data; // Separate `contactIds` from other employee data
  try {
    if (data.employee_id) {
      const existing =
        await prisma.hrms_d_employee_pay_component_assignment_header.findFirst({
          where: {
            employee_id: Number(data.employee_id),
            NOT: { id: Number(id) },
          },
        });
      if (existing) {
        throw new CustomError(
          "Another basic pay record already exists for this employee.",
          400
        );
      }
    }
    const updatedData = {
      ...headerDatas,
    };
    const serializedData = serializeHeaders(updatedData);

    // Filter address by existence of ID
    const newAddresses = payLineData?.filter((addr) => !addr.id) || [];
    const existingAddresses = payLineData?.filter((addr) => addr.id) || [];

    // Prepare address data
    const newSerialized =
      newAddresses?.map((addr) => ({
        ...serializePayLine(addr),
        parent_id: parseInt(id),
        createdate: new Date(),
        createdby: data.createdby || 1,
      })) || [];

    // Use transaction for atomicity
    const result = await prisma.$transaction(
      async (prisma) => {
        // Update the employee
        const employee =
          await prisma.hrms_d_employee_pay_component_assignment_header.update({
            where: { id: parseInt(id) },
            data: {
              ...serializedData,
            },
            select: {
              hrms_d_employee_pay_component_assignment_line: {
                select: {
                  id: true,
                },
              },
            },
          });

        // 2. Fetch current DB address IDs
        // const dbAddresses = await prisma.hrms_d_employee_pay_component_assignment_header.findMany({
        //   where: { employee_id: parseInt(id) },
        //   select: { id: true },
        // });

        if (Array.isArray(payLineData) && payLineData.length > 0) {
          const dbIds =
            employee?.hrms_d_employee_pay_component_assignment_line?.map(
              (a) => a.id
            );
          const requestIds = existingAddresses?.map((a) => a.id);

          for (const addr of payLineData) {
            for (const [field, message] of Object.entries(requiredFields)) {
              if (!addr[field]) {
                throw new CustomError(message, 400);
              }
            }
          }
          // 3. Delete removed addresses (if any)
          const toDeleteIds = payLineData
            ? dbIds.filter((id) => !requestIds.includes(id))
            : [];
          if (toDeleteIds.length > 0) {
            await prisma.hrms_d_employee_pay_component_assignment_line.deleteMany(
              {
                where: { id: { in: toDeleteIds } },
              }
            );
          }

          // 4. Update existing addresses
          for (const addr of existingAddresses) {
            await prisma.hrms_d_employee_pay_component_assignment_line.update({
              where: { id: addr.id },
              data: serializePayLine(addr),
            });
          }

          // 5. Create new addresses in bulk
          if (newSerialized.length > 0) {
            await prisma.hrms_d_employee_pay_component_assignment_line.createMany(
              {
                data: newSerialized,
              }
            );
          }
        }
        //  const serializedAddres = serializePayLine(payLineData);
        // // Map contacts to the employee
        // const addressDatas = {
        //   ...serializedAddres,
        //   employee_id: employee.id,
        // };
        // await prisma.hrms_d_employee_pay_component_assignment_header.update({ data: addressDatas });
        // Retrieve the updated employee with hrms_d_employee_pay_component_assignment_header and employeeHistory included
        const updatedEmp =
          await prisma.hrms_d_employee_pay_component_assignment_header.findUnique(
            {
              where: { id: parseInt(id) },
              include: {
                hrms_d_employee_pay_component_assignment_line: {
                  include: {
                    pay_component_line_currency: {
                      select: {
                        id: true,
                        currency_name: true,
                        currency_code: true,
                      },
                    },
                    // pay_component_line_tax_slab: {
                    //   select: {
                    //     id: true,
                    //     pay_component_id: true,
                    //     rule_type: true,
                    //   },
                    // },
                    pay_component_line_project: {
                      select: {
                        id: true,
                        code: true,
                        name: true,
                      },
                    },
                    pay_component_line_cost_center1: {
                      select: {
                        id: true,
                        name: true,
                        dimension_id: true,
                      },
                    },
                    pay_component_line_cost_center2: {
                      select: {
                        id: true,
                        name: true,
                        dimension_id: true,
                      },
                    },
                    pay_component_line_cost_center3: {
                      select: {
                        id: true,
                        name: true,
                        dimension_id: true,
                      },
                    },
                    pay_component_line_cost_center4: {
                      select: {
                        id: true,
                        name: true,
                        dimension_id: true,
                      },
                    },
                    pay_component_line_cost_center5: {
                      select: {
                        id: true,
                        name: true,
                        dimension_id: true,
                      },
                    },
                  },
                },
                work_life_entry_pay_header: {
                  select: {
                    id: true,
                    event_type: true,
                    work_life_event_type: {
                      select: {
                        id: true,
                        event_type_name: true,
                      },
                    },
                  },
                },
                branch_pay_component_header: {
                  select: { id: true, branch_name: true },
                },
                hrms_d_employee: {
                  include: {
                    hrms_employee_department: {
                      select: {
                        id: true,
                        department_name: true,
                      },
                    },
                    hrms_employee_designation: {
                      select: {
                        id: true,
                        designation_name: true,
                      },
                    },
                  },
                },
              },
            }
          );

        return updatedEmp;
      },
      { timeout: 20000 }
    );

    return parseData(result);
  } catch (error) {
    console.log("Updating error in basic pay", error);
    throw new CustomError(
      `Error updating basic pay: ${error.message}`,
      error.status || 500
    );
  }
};

// Find a employee by its ID
const findBasicPayById = async (id) => {
  try {
    const employee =
      await prisma.hrms_d_employee_pay_component_assignment_header.findUnique({
        where: { id: parseInt(id) },
        include: {
          hrms_d_employee_pay_component_assignment_line: {
            include: {
              pay_component_line_currency: {
                select: {
                  id: true,
                  currency_name: true,
                  currency_code: true,
                },
              },
              pay_component_for_line: {
                select: {
                  id: true,
                  component_name: true,
                  pay_or_deduct: true,
                },
              },
              // pay_component_line_tax_slab: {
              //   select: {
              //     id: true,
              //     pay_component_id: true,
              //     rule_type: true,
              //   },
              // },
              pay_component_line_project: {
                select: {
                  id: true,
                  code: true,
                  name: true,
                },
              },
              pay_component_line_cost_center1: {
                select: {
                  id: true,
                  name: true,
                  dimension_id: true,
                },
              },
              pay_component_line_cost_center2: {
                select: {
                  id: true,
                  name: true,
                  dimension_id: true,
                },
              },
              pay_component_line_cost_center3: {
                select: {
                  id: true,
                  name: true,
                  dimension_id: true,
                },
              },
              pay_component_line_cost_center4: {
                select: {
                  id: true,
                  name: true,
                  dimension_id: true,
                },
              },
              pay_component_line_cost_center5: {
                select: {
                  id: true,
                  name: true,
                  dimension_id: true,
                },
              },
            },
          },
          work_life_entry_pay_header: {
            select: {
              id: true,
              event_type: true,
              work_life_event_type: {
                select: {
                  id: true,
                  event_type_name: true,
                },
              },
            },
          },
          branch_pay_component_header: {
            select: { id: true, branch_name: true },
          },
          hrms_d_employee: {
            include: {
              hrms_employee_department: {
                select: {
                  id: true,
                  department_name: true,
                },
              },
              hrms_employee_designation: {
                select: {
                  id: true,
                  designation_name: true,
                },
              },
            },
          },
        },
      });
    return parseData(employee);
  } catch (error) {
    throw new CustomError("Error finding basic pay by ID", error.status || 503);
  }
};

// Get all employees
const getAllBasicPay = async (
  page,
  size,
  search,
  startDate,
  endDate,
  status,
  employee_id
) => {
  try {
    page = !page || page == 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size || 0;
    const filters = {};
    // Handle search
    if (search) {
      filters.OR = [
        {
          hrms_d_employee: {
            full_name: { contains: search.toLowerCase() },
          }, // Include contact details
        },
        // {
        //   first_name: { contains: search.toLowerCase() },
        // },
      ];
    }
    if (employee_id) {
      filters.employee_id = { equals: parseInt(employee_id) };
    }
    // if (status) {
    //   filters.is_active = { equals: status };
    // }

    // if (startDate && endDate) {
    //   const start = new Date(startDate);
    //   const end = new Date(endDate);

    //   if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
    //     filters.createdate = {
    //       gte: start,
    //       lte: end,
    //     };
    //   }
    // }

    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);

      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        filters.createdate = { gte: start, lte: end };
      }
    }
    const employee =
      await prisma.hrms_d_employee_pay_component_assignment_header.findMany({
        where: filters,
        skip: skip,
        take: size,
        include: {
          hrms_d_employee_pay_component_assignment_line: {
            include: {
              pay_component_line_currency: {
                select: {
                  id: true,
                  currency_name: true,
                  currency_code: true,
                },
              },
              pay_component_for_line: {
                select: {
                  id: true,
                  component_name: true,
                  component_code: true,
                  is_basic: true,
                  pay_or_deduct: true,
                },
              },
            },
          },
          work_life_entry_pay_header: {
            select: {
              id: true,
              event_type: true,
              work_life_event_type: {
                select: {
                  id: true,
                  event_type_name: true,
                },
              },
            },
          },
          branch_pay_component_header: {
            select: { id: true, branch_name: true },
          },
          hrms_d_employee: {
            include: {
              hrms_employee_department: {
                select: {
                  id: true,
                  department_name: true,
                },
              },
              hrms_employee_designation: {
                select: {
                  id: true,
                  designation_name: true,
                },
              },
            },
          },
        },
        orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
      });
    // const formattedDeals = employee.map((deal) => {
    //   const { employee_contact, ...rest } = parseData(deal); // Remove "deals" key
    //   const finalContact = employee_contact.map((item) => item.camp_contact);
    //   return { ...rest, employee_contact: finalContact }; // Rename "stages" to "deals"
    // });
    const totalCount =
      await prisma.hrms_d_employee_pay_component_assignment_header.count({
        where: filters,
      });
    return {
      data: employee,
      currentPage: page,
      size,
      totalPages: Math.ceil(totalCount / size),
      totalCount: totalCount,
    };
  } catch (error) {
    console.log("Error basic pay get : ", error);
    throw new CustomError("Error retrieving basic pays", error || 503);
  }
};

const deleteBasicPay = async (id) => {
  try {
    const result = await prisma.$transaction(async (prisma) => {
      // Step 1: Delete related data from DealContacts
      await prisma.hrms_d_employee_pay_component_assignment_line.deleteMany({
        where: { parent_id: parseInt(id) },
      });

      // Step 2: Delete the deal
      await prisma.hrms_d_employee_pay_component_assignment_header.delete({
        where: { id: parseInt(id) },
      });
    });
  } catch (error) {
    console.log("Error to delete Basic pay : ", error);
    throw new CustomError(
      `Error deleting Basic pay: ${error.message}`,
      error.status || 500
    );
  }
};

// const importFromExcel = async (rows) => {
//   const importedData = [];

//   for (const row of rows) {
//     const { employee_code, component_code, amount, createdby, log_inst } = row;

//     if (!employee_code || !component_code) continue; // skip invalid rows

//     // Check if record exists
//     const existing = await prisma.hrms_d_employee_pay_assignment.findFirst({
//       where: {
//         employee_code,
//         component_code,
//       },
//     });

//     if (existing) {
//       const updated = await prisma.hrms_d_employee_pay_assignment.update({
//         where: { id: existing.id },
//         data: {
//           amount,
//           updatedby: createdby,
//           log_inst,
//         },
//       });
//       importedData.push(updated);
//     } else {
//       // ➕ Insert new
//       const created = await prisma.hrms_d_employee_pay_assignment.create({
//         data: {
//           employee_code,
//           component_code,
//           amount,
//           createdby,
//           log_inst,
//         },
//       });
//       importedData.push(created);
//     }
//   }

//   return { count: importedData.length, data: importedData };
// };

const importFromExcel = async (rows) => {
  const importedData = [];

  const normalizeRow = (row) => ({
    employee_id: row.employee_id,
    pay_grade_id: row.pay_grade_id,
    pay_grade_level: row.pay_grade_level,
    createdby: 1,
    log_inst: 1,
    status: row.status || "Active",
    remarks: row.remarks || "",
    effective_from: new Date(row.effective_from),
    effective_to: new Date(row.effective_to),
    department_id: row.department_id,
    branch_id: row.branch_id,
    position_id: row.position_id,
    allowance_group: row.allowance_group,
    work_life_entry: row.work_life_entry,
  });

  for (const row of rows) {
    const data = normalizeRow(row);

    if (!data.employee_id || !data.pay_grade_id) continue;

    const existing =
      await prisma.hrms_d_employee_pay_component_assignment_header.findFirst({
        where: {
          employee_id: data.employee_id,
          pay_grade_id: data.pay_grade_id,
        },
      });

    if (existing) {
      const updated =
        await prisma.hrms_d_employee_pay_component_assignment_header.update({
          where: { id: existing.id },
          data: {
            ...data,
            updatedby: data.createdby,
            updatedate: new Date(),
          },
        });
      importedData.push(updated);
    } else {
      const created =
        await prisma.hrms_d_employee_pay_component_assignment_header.create({
          data: {
            ...data,
            createdate: new Date(),
          },
        });
      importedData.push(created);
    }
  }

  return { count: importedData.length, data: importedData };
};

module.exports = {
  createBasicPay,
  findBasicPayById,
  updateBasicPay,
  getAllBasicPay,
  deleteBasicPay,
  importFromExcel,
};

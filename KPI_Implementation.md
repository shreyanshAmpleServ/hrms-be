Reviewing the Prisma schema to align the Employee KPI implementation with your existing structure. Here are the schema additions and implementation details:

[3 tools called]

## Employee KPI System - Schema and Implementation

### Prisma Schema Additions

Add these models to your `schema.prisma` file following your existing patterns:

```prisma
// Employee KPI Header
model hrms_d_employee_kpi {
  id                          Int                                   @id @default(autoincrement())
  employee_id                 Int
  reviewer_id                 Int
  review_date                 DateTime                              @db.Date
  review_remarks              String?                               @db.NVarChar(500)
  next_review_date            DateTime?                             @db.Date
  employment_type             String?                               @db.VarChar(50)
  contract_expiry_date        DateTime?                             @db.Date
  employment_remarks           String?                              @db.NVarChar(500)
  rating                      Decimal?                              @db.Decimal(19, 6)
  revise_component_assignment String?                               @default("N") @db.Char(1)
  status                      String                                @default("Pending") @db.VarChar(20)
  last_kpi_id                 Int?
  createdate                  DateTime                              @default(now()) @db.DateTime
  createdby                   Int
  updatedate                  DateTime?                             @db.DateTime
  updatedby                   Int?
  log_inst                    Int?                                  @default(1)

  kpi_employee                hrms_d_employee                       @relation("EmployeeKPI", fields: [employee_id], references: [id], onUpdate: NoAction)
  kpi_reviewer                hrms_d_employee                       @relation("KPIReviewer", fields: [reviewer_id], references: [id], onUpdate: NoAction)
  last_kpi                    hrms_d_employee_kpi?                  @relation("LastKPI", fields: [last_kpi_id], references: [id], onUpdate: NoAction)
  next_kpi                    hrms_d_employee_kpi[]                 @relation("LastKPI")
  kpi_contents                hrms_d_employee_kpi_contents[]
  kpi_component_assignment    hrms_d_employee_kpi_component_assignment?
  kpi_attachments             hrms_d_employee_kpi_attachments[]
}

// Employee KPI Contents (Tab 1)
model hrms_d_employee_kpi_contents {
  id                              Int                  @id @default(autoincrement())
  employee_kpi_id                 Int
  kpi_name                        String?              @db.NVarChar(255)
  kpi_remarks                     String?             @db.NVarChar(500)
  weightage_percentage            Decimal?             @db.Decimal(19, 6)
  target_point                    Decimal?             @db.Decimal(19, 6)
  achieved_point                  Decimal?             @db.Decimal(19, 6)
  achieved_percentage             Decimal?             @db.Decimal(19, 6)
  kpi_drawing_type                String?              @db.NVarChar(100)
  target_point_for_next_kpi       Decimal?             @db.Decimal(19, 6)
  weightage_percentage_for_next_kpi Decimal?            @db.Decimal(19, 6)
  createdate                      DateTime             @default(now()) @db.DateTime
  createdby                       Int
  updatedate                      DateTime?             @db.DateTime
  updatedby                       Int?
  log_inst                        Int?                 @default(1)

  employee_kpi_header             hrms_d_employee_kpi                @relation(fields: [employee_kpi_id], references: [id], onUpdate: NoAction)
}

// Employee KPI Component Assignment (Sub-Form)
model hrms_d_employee_kpi_component_assignment {
  id                            Int                                    @id @default(autoincrement())
  employee_kpi_id               Int
  header_payroll_rule           String?                                @db.VarChar(100)
  effective_from                DateTime?                              @db.Date
  effective_to                  DateTime?                              @db.Date
  status                        String                                 @default("Pending") @db.VarChar(20)
  last_component_assignment_id  Int?
  change_percentage             Decimal?                                @db.Decimal(19, 6)
  department_id                 Int?
  designation_id                Int?
  position                      String?                                 @db.NVarChar(100)
  successor_id                  Int?
  createdate                    DateTime                                @default(now()) @db.DateTime
  createdby                     Int
  updatedate                    DateTime?                               @db.DateTime
  updatedby                     Int?
  log_inst                      Int?                                   @default(1)

  employee_kpi_header           hrms_d_employee_kpi                     @relation(fields: [employee_kpi_id], references: [id], onUpdate: NoAction)
  kpi_component_department      hrms_m_department_master?                @relation(fields: [department_id], references: [id], onDelete: NoAction, onUpdate: NoAction)
  kpi_component_designation     hrms_m_designation_master?               @relation(fields: [designation_id], references: [id], onDelete: NoAction, onUpdate: NoAction)
  kpi_component_successor       hrms_d_employee?                        @relation("KPISuccessor", fields: [successor_id], references: [id], onDelete: NoAction, onUpdate: NoAction)
  kpi_component_lines           hrms_d_employee_kpi_component_lines[]
}

// Employee KPI Component Assignment Lines
model hrms_d_employee_kpi_component_lines {
  id                          Int                                    @id @default(autoincrement())
  component_assignment_id     Int
  pay_component_id            Int
  amount                      Decimal                                 @db.Decimal(19, 6)
  createdate                  DateTime                                @default(now()) @db.DateTime
  createdby                   Int
  log_inst                    Int?                                    @default(1)

  kpi_component_assignment    hrms_d_employee_kpi_component_assignment @relation(fields: [component_assignment_id], references: [id], onUpdate: NoAction)
  kpi_component_pay_component hrms_m_pay_component                     @relation(fields: [pay_component_id], references: [id], onUpdate: NoAction)
}

// Employee KPI Attachments (Tab 2)
model hrms_d_employee_kpi_attachments {
  id                Int                    @id @default(autoincrement())
  employee_kpi_id   Int
  document_type_id  Int?
  document_name     String?                 @db.NVarChar(255)
  issue_date        DateTime?               @db.Date
  expiry_date       DateTime?               @db.Date
  status            String                  @default("Pending") @db.VarChar(20)
  remarks           String?                 @db.NVarChar(500)
  attachment_url    String?                 @db.NVarChar(500)
  createdate        DateTime                @default(now()) @db.DateTime
  createdby         Int
  updatedate        DateTime?               @db.DateTime
  updatedby         Int?
  log_inst          Int?                    @default(1)

  employee_kpi_header hrms_d_employee_kpi     @relation(fields: [employee_kpi_id], references: [id], onUpdate: NoAction)
  kpi_attachment_doc_type hrms_m_document_type? @relation(fields: [document_type_id], references: [id], onDelete: NoAction, onUpdate: NoAction)
}
```

### Update `hrms_d_employee` model

Add these relations to the `hrms_d_employee` model (around line 360):

```prisma
  // Add to hrms_d_employee relations section
  employee_kpi                  hrms_d_employee_kpi[]                 @relation("EmployeeKPI")
  kpi_reviewer                  hrms_d_employee_kpi[]                @relation("KPIReviewer")
  kpi_successor                 hrms_d_employee_kpi_component_assignment[] @relation("KPISuccessor")
```

### Update `hrms_m_department_master` model

Add relation (around line 1139):

```prisma
  kpi_component_department      hrms_d_employee_kpi_component_assignment[]
```

### Update `hrms_m_designation_master` model

Add relation (around line 1156):

```prisma
  kpi_component_designation     hrms_d_employee_kpi_component_assignment[]
```

### Update `hrms_m_pay_component` model

Add relation (around line 1379):

```prisma
  kpi_component_pay_component   hrms_d_employee_kpi_component_lines[]
```

### Update `hrms_m_document_type` model

Add relation (around line 1185):

```prisma
  kpi_attachment_doc_type       hrms_d_employee_kpi_attachments[]
```

---

## Backend Implementation Files

### 1. Model: `src/v1/models/employeeKPIModel.js`

```jsx
const { prisma } = require("../../utils/prismaProxy.js");
const CustomError = require("../../utils/CustomError");

const serializeEmployeeKPIData = (data, defaultEmploymentType = null) => ({
  employee_id: Number(data.employee_id),
  reviewer_id: Number(data.reviewer_id),
  review_date: data.review_date ? new Date(data.review_date) : new Date(),
  review_remarks: data.review_remarks || "",
  next_review_date: data.next_review_date
    ? new Date(data.next_review_date)
    : null,
  employment_type: data.employment_type || defaultEmploymentType || null, // Default from Employee Master if provided
  contract_expiry_date: data.contract_expiry_date
    ? new Date(data.contract_expiry_date)
    : null,
  employment_remarks: data.employment_remarks || "",
  rating: data.rating || 0,
  revise_component_assignment:
    data.revise_component_assignment === true ||
    data.revise_component_assignment === "Y"
      ? "Y"
      : "N",
  status: data.status || "Pending",
  last_kpi_id: data.last_kpi_id ? Number(data.last_kpi_id) : null,
});

const createEmployeeKPI = async (data) => {
  try {
    return await prisma.$transaction(async (tx) => {
      // Fetch employee to get default employment_type
      const employee = await tx.hrms_d_employee.findUnique({
        where: { id: Number(data.employee_id) },
        select: { employment_type: true },
      });

      // Get last active KPI
      const lastKPI = await tx.hrms_d_employee_kpi.findFirst({
        where: {
          employee_id: Number(data.employee_id),
          status: "Active",
        },
        orderBy: { createdate: "desc" },
        include: {
          kpi_contents: true,
        },
      });

      // Calculate rating from contents
      const contents = data.contents || [];
      let totalWeightedAchieved = 0;

      contents.forEach((item) => {
        const targetPoint = Number(item.target_point) || 0;
        const achievedPoint = Number(item.achieved_point) || 0;
        const weightage = Number(item.weightage_percentage) || 0;

        if (targetPoint > 0) {
          const achievedPercent = (achievedPoint / targetPoint) * 100;
          totalWeightedAchieved += (achievedPercent * weightage) / 100;
        }
      });

      const rating = totalWeightedAchieved / 20; // Divided by 20

      // Create Header
      const kpiHeader = await tx.hrms_d_employee_kpi.create({
        data: {
          ...serializeEmployeeKPIData(data, employee?.employment_type),
          rating: rating,
          last_kpi_id: lastKPI?.id || null,
          createdby: data.createdby || 1,
          createdate: new Date(),
          log_inst: data.log_inst || 1,
        },
      });

      // Create Contents - Filter based on last KPI's drawing type
      if (contents.length > 0) {
        const filteredContents = lastKPI
          ? contents.filter((content) => {
              const lastKpiContent = lastKPI.kpi_contents.find(
                (k) => k.kpi_name === content.kpi_name
              );
              return (
                !lastKpiContent ||
                lastKpiContent.kpi_drawing_type !== "Inactive for Next"
              );
            })
          : contents;

        for (const content of filteredContents) {
          const targetPoint = Number(content.target_point) || 0;
          const achievedPoint = Number(content.achieved_point) || 0;
          const achievedPercent =
            targetPoint > 0 ? (achievedPoint / targetPoint) * 100 : 0;

          await tx.hrms_d_employee_kpi_contents.create({
            data: {
              employee_kpi_id: kpiHeader.id,
              kpi_name: content.kpi_name || "",
              kpi_remarks: content.kpi_remarks || "",
              weightage_percentage: Number(content.weightage_percentage) || 0,
              target_point: targetPoint,
              achieved_point: achievedPoint,
              achieved_percentage: achievedPercent,
              kpi_drawing_type:
                content.kpi_drawing_type || "Active for Current & Next KPI",
              target_point_for_next_kpi:
                Number(content.target_point_for_next_kpi) || 0,
              weightage_percentage_for_next_kpi:
                Number(content.weightage_percentage_for_next_kpi) || 0,
              createdby: data.createdby || 1,
              createdate: new Date(),
            },
          });
        }
      }

      // Create Component Assignment if requested
      if (
        data.revise_component_assignment === "Y" &&
        data.component_assignment
      ) {
        const lastComponentAssignment =
          await tx.hrms_d_employee_pay_component_assignment_header.findFirst({
            where: {
              employee_id: Number(data.employee_id),
              status: "Active",
            },
            orderBy: { createdate: "desc" },
            include: {
              hrms_d_employee_pay_component_assignment_line: true,
            },
          });

        const componentAssignment =
          await tx.hrms_d_employee_kpi_component_assignment.create({
            data: {
              employee_kpi_id: kpiHeader.id,
              header_payroll_rule: (() => {
                const rule = data.component_assignment.header_payroll_rule;
                // Validate: Only "Biometric/Manual Attendance" or "Standard" allowed
                if (
                  rule &&
                  rule !== "Biometric/Manual Attendance" &&
                  rule !== "Standard"
                ) {
                  throw new CustomError(
                    'Header Payroll Rule must be either "Biometric/Manual Attendance" or "Standard"',
                    400
                  );
                }
                return rule || "Standard";
              })(),
              effective_from: data.component_assignment.effective_from
                ? new Date(data.component_assignment.effective_from)
                : new Date(),
              effective_to: data.component_assignment.effective_to
                ? new Date(data.component_assignment.effective_to)
                : null,
              status: "Pending",
              last_component_assignment_id: lastComponentAssignment?.id || null,
              change_percentage:
                Number(data.component_assignment.change_percentage) || 0,
              department_id: data.component_assignment.department_id
                ? Number(data.component_assignment.department_id)
                : null,
              designation_id: data.component_assignment.designation_id
                ? Number(data.component_assignment.designation_id)
                : null,
              position: data.component_assignment.position || "",
              successor_id: data.component_assignment.successor_id
                ? Number(data.component_assignment.successor_id)
                : null,
              createdby: data.createdby || 1,
              createdate: new Date(),
            },
          });

        // Get component lines - from form or last assignment
        const componentLines = data.component_assignment.component_lines || [];
        const linesToProcess =
          componentLines.length > 0
            ? componentLines
            : (
                lastComponentAssignment?.hrms_d_employee_pay_component_assignment_line ||
                []
              ).map((l) => ({
                pay_component_id: l.pay_component_id,
                amount: l.amount,
              }));

        for (const line of linesToProcess) {
          let amount = Number(line.amount) || 0;

          // If copying from last assignment and amount not provided
          if (!line.amount && lastComponentAssignment) {
            const lastLine =
              lastComponentAssignment.hrms_d_employee_pay_component_assignment_line.find(
                (l) => l.pay_component_id === Number(line.pay_component_id)
              );
            if (lastLine) {
              amount = Number(lastLine.amount);
            }
          }

          // Apply change percentage if provided
          if (data.component_assignment.change_percentage) {
            const changePercent =
              Number(data.component_assignment.change_percentage) / 100;
            amount = amount * (1 + changePercent);
          }

          await tx.hrms_d_employee_kpi_component_lines.create({
            data: {
              component_assignment_id: componentAssignment.id,
              pay_component_id: Number(line.pay_component_id),
              amount: amount,
              createdby: data.createdby || 1,
              createdate: new Date(),
            },
          });
        }
      }

      // Create Attachments
      if (data.attachments && data.attachments.length > 0) {
        for (const attachment of data.attachments) {
          await tx.hrms_d_employee_kpi_attachments.create({
            data: {
              employee_kpi_id: kpiHeader.id,
              document_type_id: attachment.document_type_id
                ? Number(attachment.document_type_id)
                : null,
              document_name: attachment.document_name || "",
              issue_date: attachment.issue_date
                ? new Date(attachment.issue_date)
                : new Date(),
              expiry_date: attachment.expiry_date
                ? new Date(attachment.expiry_date)
                : null,
              status: "Pending",
              remarks: attachment.remarks || "",
              attachment_url: attachment.attachment_url || "",
              createdby: data.createdby || 1,
              createdate: new Date(),
            },
          });
        }
      }

      // Create Approval Request
      await tx.hrms_d_requests.create({
        data: {
          request_type: "Employee KPI",
          requester_id: Number(data.createdby) || 1,
          request_data: JSON.stringify({ kpi_id: kpiHeader.id }),
          status: "Pending",
          createdby: data.createdby || 1,
          createdate: new Date(),
        },
      });

      return await findEmployeeKPIById(kpiHeader.id);
    });
  } catch (error) {
    throw new CustomError(`Error creating Employee KPI: ${error.message}`, 500);
  }
};

const approveEmployeeKPI = async (kpiId, approverId) => {
  try {
    return await prisma.$transaction(async (tx) => {
      const kpi = await tx.hrms_d_employee_kpi.findUnique({
        where: { id: Number(kpiId) },
        include: {
          kpi_contents: true,
          kpi_component_assignment: {
            include: { kpi_component_lines: true },
          },
          kpi_attachments: true,
        },
      });

      if (!kpi) {
        throw new CustomError("KPI not found", 404);
      }

      // Update KPI status
      await tx.hrms_d_employee_kpi.update({
        where: { id: Number(kpiId) },
        data: { status: "Active", updatedate: new Date() },
      });

      // Set previous KPIs to Inactive
      await tx.hrms_d_employee_kpi.updateMany({
        where: {
          employee_id: kpi.employee_id,
          id: { not: Number(kpiId) },
          status: "Active",
        },
        data: { status: "Inactive", updatedate: new Date() },
      });

      // Update Employee Master Data
      const updateEmployeeData = {};
      if (kpi.employment_type)
        updateEmployeeData.employment_type = kpi.employment_type;
      if (kpi.kpi_component_assignment?.department_id) {
        updateEmployeeData.department_id =
          kpi.kpi_component_assignment.department_id;
      }
      if (kpi.kpi_component_assignment?.designation_id) {
        updateEmployeeData.designation_id =
          kpi.kpi_component_assignment.designation_id;
      }
      if (kpi.kpi_component_assignment?.position) {
        updateEmployeeData.work_location =
          kpi.kpi_component_assignment.position;
      }

      if (Object.keys(updateEmployeeData).length > 0) {
        await tx.hrms_d_employee.update({
          where: { id: kpi.employee_id },
          data: updateEmployeeData,
        });
      }

      // Create new Component Assignment if exists
      if (
        kpi.revise_component_assignment === "Y" &&
        kpi.kpi_component_assignment
      ) {
        const newComponentAssignment =
          await tx.hrms_d_employee_pay_component_assignment_header.create({
            data: {
              employee_id: kpi.employee_id,
              effective_from:
                kpi.kpi_component_assignment.effective_from || new Date(),
              effective_to: kpi.kpi_component_assignment.effective_to,
              department_id: kpi.kpi_component_assignment.department_id,
              position_id: null, // Map from position field if needed
              status: "Active",
              remarks: `Created from Employee KPI #${kpi.id}`,
              createdby: approverId,
              createdate: new Date(),
            },
          });

        // Copy component lines
        let lineNum = 1; // Start from 1
        for (const line of kpi.kpi_component_assignment.kpi_component_lines) {
          await tx.hrms_d_employee_pay_component_assignment_line.create({
            data: {
              parent_id: newComponentAssignment.id,
              line_num: lineNum++, // Sequential line numbers
              pay_component_id: line.pay_component_id,
              amount: line.amount,
              type_value: line.amount,
              is_taxable: "Y",
              is_recurring: "Y",
              component_type: "O",
              createdby: approverId,
              createdate: new Date(),
            },
          });
        }
      }

      // Update attachments status and sync to Employee Master
      await tx.hrms_d_employee_kpi_attachments.updateMany({
        where: { employee_kpi_id: Number(kpiId) },
        data: { status: "Verified" },
      });

      // Sync attachments to Employee Master
      for (const attachment of kpi.kpi_attachments) {
        await tx.hrms_d_document_upload.create({
          data: {
            employee_id: kpi.employee_id,
            document_type: attachment.kpi_attachment_doc_type?.name || "",
            document_path: attachment.attachment_url || "",
            document_number: attachment.document_name || "",
            issued_date: attachment.issue_date,
            expiry_date: attachment.expiry_date,
            is_mandatory: "Y",
            document_owner_type: "employee",
            document_owner_id: kpi.employee_id,
            createdby: approverId,
            createdate: new Date(),
          },
        });
      }

      return await findEmployeeKPIById(kpiId);
    });
  } catch (error) {
    throw new CustomError(
      `Error approving Employee KPI: ${error.message}`,
      500
    );
  }
};

const findEmployeeKPIById = async (id) => {
  try {
    const kpi = await prisma.hrms_d_employee_kpi.findUnique({
      where: { id: parseInt(id) },
      include: {
        kpi_employee: {
          select: { id: true, full_name: true, employee_code: true },
        },
        kpi_reviewer: {
          select: { id: true, full_name: true, employee_code: true },
        },
        kpi_contents: true,
        kpi_component_assignment: {
          include: {
            kpi_component_lines: {
              include: {
                kpi_component_pay_component: {
                  select: {
                    id: true,
                    component_name: true,
                    component_code: true,
                  },
                },
              },
            },
            kpi_component_department: true,
            kpi_component_designation: true,
            kpi_component_successor: {
              select: { id: true, full_name: true, employee_code: true },
            },
          },
        },
        kpi_attachments: {
          include: {
            kpi_attachment_doc_type: true,
          },
        },
      },
    });
    if (!kpi) {
      throw new CustomError("Employee KPI not found", 404);
    }
    return kpi;
  } catch (error) {
    throw new CustomError(`Error finding Employee KPI: ${error.message}`, 503);
  }
};

const getLastKPIForEmployee = async (employeeId) => {
  try {
    const lastKPI = await prisma.hrms_d_employee_kpi.findFirst({
      where: {
        employee_id: Number(employeeId),
        status: "Active",
      },
      orderBy: { createdate: "desc" },
      include: {
        kpi_contents: true,
      },
    });
    return lastKPI;
  } catch (error) {
    throw new CustomError(`Error retrieving last KPI: ${error.message}`, 503);
  }
};

const getLastComponentAssignmentForEmployee = async (employeeId) => {
  try {
    const lastAssignment =
      await prisma.hrms_d_employee_pay_component_assignment_header.findFirst({
        where: {
          employee_id: Number(employeeId),
          status: "Active",
        },
        orderBy: { createdate: "desc" },
        include: {
          hrms_d_employee_pay_component_assignment_line: {
            include: {
              pay_component_for_line: {
                select: {
                  id: true,
                  component_name: true,
                  component_code: true,
                },
              },
            },
          },
        },
      });
    return lastAssignment;
  } catch (error) {
    throw new CustomError(
      `Error retrieving last component assignment: ${error.message}`,
      503
    );
  }
};

const getAllEmployeeKPI = async (
  page,
  size,
  search,
  startDate,
  endDate,
  employee_id,
  status
) => {
  try {
    page = page || page == 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size || 0;

    const filters = {};
    if (search) {
      filters.OR = [
        {
          kpi_employee: {
            full_name: { contains: search, mode: "insensitive" },
          },
        },
        {
          kpi_employee: {
            employee_code: { contains: search, mode: "insensitive" },
          },
        },
      ];
    }
    if (employee_id) {
      filters.employee_id = Number(employee_id);
    }
    if (status) {
      filters.status = status;
    }
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        filters.review_date = { gte: start, lte: end };
      }
    }

    const data = await prisma.hrms_d_employee_kpi.findMany({
      where: filters,
      skip: skip,
      take: size,
      orderBy: [{ createdate: "desc" }],
      include: {
        kpi_employee: {
          select: { id: true, full_name: true, employee_code: true },
        },
        kpi_reviewer: {
          select: { id: true, full_name: true, employee_code: true },
        },
      },
    });

    const totalCount = await prisma.hrms_d_employee_kpi.count({
      where: filters,
    });

    return {
      data: data,
      currentPage: page,
      size,
      totalPages: Math.ceil(totalCount / size),
      totalCount: totalCount,
    };
  } catch (error) {
    throw new CustomError("Error retrieving Employee KPIs", 503);
  }
};

module.exports = {
  createEmployeeKPI,
  findEmployeeKPIById,
  approveEmployeeKPI,
  getLastKPIForEmployee,
  getLastComponentAssignmentForEmployee,
  getAllEmployeeKPI,
};
```

### 2. Controller: `src/v1/controller/employeeKPIController.js`

```jsx
const employeeKPIModel = require("../models/employeeKPIModel");
const CustomError = require("../../utils/CustomError");

const createEmployeeKPI = async (req, res, next) => {
  try {
    const data = { ...req.body, createdby: req.user?.id || 1 };
    const result = await employeeKPIModel.createEmployeeKPI(data);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const getEmployeeKPIById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await employeeKPIModel.findEmployeeKPIById(id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const approveEmployeeKPI = async (req, res, next) => {
  try {
    const { id } = req.params;
    const approverId = req.user?.id || 1;
    const result = await employeeKPIModel.approveEmployeeKPI(id, approverId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const getLastKPIForEmployee = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const result = await employeeKPIModel.getLastKPIForEmployee(employeeId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const getLastComponentAssignment = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const result = await employeeKPIModel.getLastComponentAssignmentForEmployee(
      employeeId
    );
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const getAllEmployeeKPI = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate, employee_id, status } =
      req.query;
    const result = await employeeKPIModel.getAllEmployeeKPI(
      page,
      size,
      search,
      startDate,
      endDate,
      employee_id,
      status
    );
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createEmployeeKPI,
  getEmployeeKPIById,
  approveEmployeeKPI,
  getLastKPIForEmployee,
  getLastComponentAssignment,
  getAllEmployeeKPI,
};
```

### 3. Routes: `src/v1/routes/employeeKPIRoutes.js`

```jsx
const express = require("express");
const router = express.Router();
const employeeKPIController = require("../controller/employeeKPIController");
const { authenticateToken } = require("../../middleware/authMiddleware");

router.post("/", authenticateToken, employeeKPIController.createEmployeeKPI);
router.get("/", authenticateToken, employeeKPIController.getAllEmployeeKPI);
router.get("/:id", authenticateToken, employeeKPIController.getEmployeeKPIById);
router.post(
  "/:id/approve",
  authenticateToken,
  employeeKPIController.approveEmployeeKPI
);
router.get(
  "/employee/:employeeId/last",
  authenticateToken,
  employeeKPIController.getLastKPIForEmployee
);
router.get(
  "/employee/:employeeId/component-assignment",
  authenticateToken,
  employeeKPIController.getLastComponentAssignment
);

module.exports = router;
```

---

## Key Business Logic Implementation

1. Rating calculation: Sum of (Achieved% × Weightage%) / 20
2. KPI Drawing Type filter: Exclude rows where `kpi_drawing_type = "Inactive for Next"` from last KPI (Valid values: "Active for Current & Next KPI", "Active for Next KPI", "Inactive for Next")
3. Component Assignment: Copy from last active assignment, apply Change% globally if provided
4. Approval flow: On approval, sync to Employee Master and create new Component Assignment document
5. Employment Type default: Pull from Employee Master (`hrms_d_employee.employment_type`) if not provided in the form
6. Header Payroll Rule validation: Only accepts "Biometric/Manual Attendance" or "Standard" values
7. Component Assignment line numbers: Sequential numbering starting from 1 (not 0)

This matches your existing schema patterns. After adding these models, run `npx prisma generate` and `npx prisma migrate dev` to apply the changes.

const { z } = require("zod");

const leaveApplicationSchema = z.object({
  employee_id: z.number().int().positive(),
  leave_type_id: z.number().int().optional(),
  start_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid start date",
  }),
  end_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid end date",
  }),
  reason: z.string().optional(),
  status: z.string().optional(),
  createdby: z.number().optional(),
  updatedby: z.number().optional(),
  createdate: z.coerce.date().optional(),
  updatedate: z.coerce.date().optional(),
  log_inst: z.number().optional(),
}).refine(
  (data) => new Date(data.start_date) <= new Date(data.end_date),
  {
    message: "Start date must not be after end date",
    path: ["start_date"],
  }
);

module.exports = { leaveApplicationSchema };

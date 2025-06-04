const { z } = require("zod");

const leaveApplicationSchema = z
  .object({
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
  })
  .refine((data) => new Date(data.start_date) <= new Date(data.end_date), {
    message: "Start date must not be after end date",
    path: ["start_date"],
  });

/**
 * Middleware to validate req.body using a given Zod schema
 */
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const formattedErrors = result.error.errors.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: formattedErrors,
    });
  }

  req.body = result.data; // validated and possibly coerced
  next();
};

module.exports = {
  leaveApplicationSchema,
  validate,
};

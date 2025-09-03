const DEFAULT_WORKFLOW_TYPES = [
  "leave_request",
  "probation",
  "salary_increment",
  "expense_claim",
  "resignation",
  "transfer_request",
  "overtime_request",
  "training_request",
  "asset_request",
  "performance_review",
  "loan_request",
  "advance_salary",
  "medical_reimbursement",
  "disciplinary_action",
  "promotion_request",
  "attendance_correction",
  "travel_request",
  "bonus_request",
  "shift_change",
  "work_from_home",
  "vehicle_request",
  "maternity_leave",
  "paternity_leave",
  "casual_leave",
  "sick_leave",
  "annual_leave",
];

const DEFAULT_CREATOR_CONFIG = {
  createdby: 1,
  log_inst: 1,
  default_approver_id: 1,
  is_active: "Y",
};

module.exports = {
  DEFAULT_WORKFLOW_TYPES,
  DEFAULT_CREATOR_CONFIG,
};

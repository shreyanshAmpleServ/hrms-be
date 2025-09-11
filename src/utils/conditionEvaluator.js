// Evaluates if an employee matches all conditions (field, operator, value)
module.exports.evaluateConditions = (employee, conditions) => {
  if (!employee || !conditions?.length) return false;
  for (const cond of conditions) {
    const { field, operator, value } = cond;
    const empValue = employee[field];
    if (empValue === undefined) return false;
    if (operator === "<=" && !(empValue <= value)) return false;
    if (operator === ">=" && !(empValue >= value)) return false;
    if (operator === "=" && empValue != value) return false;
    if (operator === "<" && !(empValue < value)) return false;
    if (operator === ">" && !(empValue > value)) return false;
    if (operator === "!=" && !(empValue != value)) return false;
  }
  return true;
};

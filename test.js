// // Add this route to your existing candidate routes
// router.post(
//   "/candidate-master/:id/create-employee",
//   authenticateToken,
//   candidateMasterController.createEmployeeFromCandidate
// );

// // controler
// const createEmployeeFromCandidate = async (req, res, next) => {
//   try {
//     const candidateId = req.params.id;
//     const additionalEmployeeData = req.body; // Any additional fields needed for employee

//     const result = await candidateMasterService.createEmployeeFromCandidate(
//       candidateId,
//       additionalEmployeeData,
//       req.user.id,
//       req.user.log_inst
//     );

//     res
//       .status(201)
//       .success("Employee created successfully from candidate", result);
//   } catch (error) {
//     next(error);
//   }
// };

// // Update your existing updateCandidateMasterStatus to include auto-employee creation
// const updateCandidateMasterStatus = async (req, res, next) => {
//   try {
//     console.log("Approver ID from token:", req.user.employee_id);

//     const status = req.body.status;
//     const status_remarks = req.body.status_remarks || "";
//     const autoCreateEmployee = req.body.autoCreateEmployee || false; // New flag
//     const employeeData = req.body.employeeData || {}; // Additional employee data

//     const data = {
//       status,
//       status_remarks,
//       updatedby: req.user.employee_id,
//       updatedate: new Date(),
//     };

//     const reqData = await candidateMasterService.updateCandidateMasterStatus(
//       req.params.id,
//       data
//     );

//     // Check if we need to auto-create employee after status update
//     if (status === "Hired" && autoCreateEmployee) {
//       try {
//         const employeeResult =
//           await candidateMasterService.createEmployeeFromCandidate(
//             req.params.id,
//             employeeData,
//             req.user.id,
//             req.user.log_inst
//           );
//         reqData.employee = employeeResult;
//       } catch (employeeError) {
//         console.error("Error creating employee from candidate:", employeeError);
//         // Don't fail the status update if employee creation fails
//       }
//     }

//     res
//       .status(200)
//       .success("Candidate Master status updated successfully", reqData);
//   } catch (error) {
//     next(error);
//   }
// };

// // Export the new function
// module.exports = {
//   createCandidateMaster,
//   findCandidateMasterById,
//   updateCandidateMaster,
//   deleteCandidateMaster,
//   getAllCandidateMaster,
//   updateCandidateMasterStatus,
//   createEmployeeFromCandidate, // Add this
// };

// //servicd
// const employeeModel = require("../models/employeeModel.js"); // Import employee model

// const createEmployeeFromCandidate = async (
//   candidateId,
//   additionalData,
//   createdBy,
//   logInst
// ) => {
//   return await candidateMasterModel.createEmployeeFromCandidate(
//     candidateId,
//     additionalData,
//     createdBy,
//     logInst
//   );
// };

// // Export the new function
// module.exports = {
//   createCandidateMaster,
//   getCandidateMasterById,
//   updateCandidateMaster,
//   deleteCandidateMaster,
//   updateCandidateMasterStatus,
//   getAllCandidateMaster,
//   createEmployeeFromCandidate, // Add this
// };

// // model
// const employeeModel = require("./employeeModel.js"); // Import employee model

// const createEmployeeFromCandidate = async (
//   candidateId,
//   additionalData,
//   createdBy,
//   logInst
// ) => {
//   try {
//     // Get candidate data
//     const candidate = await prisma.hrms_d_candidate_master.findUnique({
//       where: { id: parseInt(candidateId) },
//       include: {
//         candidate_master_applied_position: true,
//         candidate_application_source: true,
//         candidate_interview_stage: true,
//       },
//     });

//     if (!candidate) {
//       throw new CustomError("Candidate not found", 404);
//     }

//     // Check if candidate is in final stage or hired status
//     if (candidate.status !== "Hired" && candidate.status !== "Selected") {
//       throw new CustomError(
//         "Candidate must be hired or selected to create employee",
//         400
//       );
//     }

//     // Check if employee already exists for this candidate
//     const existingEmployee = await prisma.hrms_d_employee.findFirst({
//       where: {
//         OR: [{ email: candidate.email }, { phone_number: candidate.phone }],
//       },
//     });

//     if (existingEmployee) {
//       throw new CustomError("Employee already exists for this candidate", 400);
//     }

//     // Generate employee code
//     const employeeCode = await generateEmployeeCode(candidate.full_name);

//     // Map candidate data to employee structure
//     const employeeData = {
//       employee_code: employeeCode,
//       first_name: candidate.full_name.split(" ")[0] || "",
//       last_name: candidate.full_name.split(" ").slice(1).join(" ") || "",
//       full_name: candidate.full_name,
//       email: candidate.email,
//       phone_number: candidate.phone,
//       date_of_birth: candidate.date_of_birth,
//       gender: candidate.gender,
//       nationality: candidate.nationality,
//       profile_pic: candidate.profile_pic,

//       // Map from candidate relationships
//       designation_id: candidate.applied_position_id,
//       join_date: candidate.actual_joining_date || new Date(),

//       // Default values for required employee fields
//       employment_type: additionalData.employment_type || "Full-time",
//       employee_category: additionalData.employee_category || "Regular",
//       department_id: additionalData.department_id, // Must be provided
//       status: "Active",

//       // Merge any additional data provided
//       ...additionalData,

//       // System fields
//       createdby: createdBy,
//       log_inst: logInst,
//     };

//     // Validate required employee fields
//     if (!employeeData.department_id) {
//       throw new CustomError(
//         "Department ID is required to create employee",
//         400
//       );
//     }

//     // Create employee using existing employee model
//     const newEmployee = await employeeModel.createEmployee(employeeData);

//     // Update candidate with employee reference (optional)
//     await prisma.hrms_d_candidate_master.update({
//       where: { id: parseInt(candidateId) },
//       data: {
//         status: "Converted to Employee",
//         status_remarks: `Converted to employee with ID: ${newEmployee.id}`,
//         updatedate: new Date(),
//         updatedby: createdBy,
//       },
//     });

//     return {
//       employee: newEmployee,
//       candidate: candidate,
//       message: "Employee created successfully from candidate",
//     };
//   } catch (error) {
//     console.error("Error creating employee from candidate:", error);
//     if (error instanceof CustomError) {
//       throw error;
//     }
//     throw new CustomError(
//       `Error creating employee from candidate: ${error.message}`,
//       500
//     );
//   }
// };

// // Helper function to generate employee code
// const generateEmployeeCode = async (fullName) => {
//   const nameParts = fullName.split(" ");
//   const firstName = nameParts[0] || "";
//   const lastName = nameParts[1] || "";

//   const initials = `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase();

//   // Get all existing employee codes
//   const allCodes = await prisma.hrms_d_employee.findMany({
//     select: { employee_code: true },
//   });

//   let maxNumber = 0;
//   for (const entry of allCodes) {
//     const code = entry.employee_code;
//     const numberPart = code.replace(/^[A-Za-z]+/, "");
//     const parsed = parseInt(numberPart);
//     if (!isNaN(parsed) && parsed > maxNumber) {
//       maxNumber = parsed;
//     }
//   }

//   const nextNumber = maxNumber + 1;
//   return `EMP${initials}${String(nextNumber).padStart(3, "0")}`;
// };

// // Export the new function
// module.exports = {
//   createCandidateMaster,
//   findCandidateMasterById,
//   updateCandidateMaster,
//   deleteCandidateMaster,
//   getAllCandidateMaster,
//   updateCandidateMasterStatus,
//   createEmployeeFromCandidate, // Add this
// };

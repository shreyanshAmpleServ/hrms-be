const EmploymentContractService = require("../services/EmploymentContractService");
const CustomError = require("../../utils/CustomError");
const moment = require("moment");
const {
  uploadToBackblaze,
  deleteFromBackblaze,
  uploadToBackblazeWithValidation,
} = require("../../utils/uploadBackblaze");
const fs = require("fs");

const createEmploymentContract = async (req, res, next) => {
  try {
    let imageUrl = null;
    if (req.file) {
      imageUrl = await uploadToBackblaze(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        "EmploymentContract"
      );
    }
    const data = {
      ...req.body,
      createdby: req.user.id,
      document_path: imageUrl,
      log_inst: req.user.log_inst,
    };
    const reqData = await EmploymentContractService.createEmploymentContract(
      data
    );
    res
      .status(201)
      .success("Employment contract created successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const findEmploymentContractById = async (req, res, next) => {
  try {
    const reqData = await EmploymentContractService.findEmploymentContractById(
      req.params.id
    );
    if (!reqData) throw new CustomError("Employment contract not found", 404);
    res.status(200).success(null, reqData);
  } catch (error) {
    next(error);
  }
};

const updateEmploymentContract = async (req, res, next) => {
  try {
    const existingData =
      await EmploymentContractService.findEmploymentContractById(req.params.id);
    if (!existingData) throw new CustomError("Resume not found", 404);
    let imageUrl = existingData.resume_path;

    if (req.file) {
      imageUrl = await uploadToBackblaze(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        "EmploymentContract"
      );
    }
    const data = {
      ...req.body,
      document_path: req.file ? imageUrl : existingData.document_path,
      updatedby: req.user.id,
      log_inst: req.user.log_inst,
    };
    const reqData = await EmploymentContractService.updateEmploymentContract(
      req.params.id,
      data
    );
    res
      .status(200)
      .success("Employment contract updated successfully", reqData);
    if (req.file) {
      if (existingData.image) {
        await deleteFromBackblaze(existingData.image); // Delete the old logo
      }
    }
  } catch (error) {
    next(error);
  }
};

const deleteEmploymentContract = async (req, res, next) => {
  try {
    const existingData =
      await EmploymentContractService.findEmploymentContractById(req.params.id);
    await EmploymentContractService.deleteEmploymentContract(req.params.id);
    res.status(200).success("Employment contract deleted successfully", null);
    if (existingData.image) {
      await deleteFromBackblaze(existingData.image); // Delete the old logo
    }
  } catch (error) {
    next(error);
  }
};

const getAllEmploymentContract = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate, candidate_id } = req.query;
    const data = await EmploymentContractService.getAllEmploymentContract(
      search,
      Number(page),
      Number(size),
      startDate && moment(startDate),
      endDate && moment(endDate),
      candidate_id ? parseInt(candidate_id) : null
    );
    res.status(200).success(null, data);
  } catch (error) {
    next(error);
  }
};

// const downloadContractPDF = async (req, res, next) => {
//   try {
//     const data = req.body;

//     if (!data) {
//       throw new CustomError("Missing required parameters", 400);
//     }

//     const filePath = await EmploymentContractService.downloadContractPDF(data);

//     res.setHeader("Content-Type", "application/pdf");
//     res.setHeader("Content-Disposition", 'inline; filename="contract.pdf"');

//     res.sendFile(filePath, (err) => {
//       if (err) {
//         console.error("Error sending PDF file:", err);
//         return next(err);
//       }

//       setTimeout(() => {
//         fs.unlink(filePath, (unlinkErr) => {
//           if (unlinkErr) {
//             console.error("Error deleting PDF file:", unlinkErr);
//           } else {
//             console.log(`Deleted temporary PDF: ${filePath}`);
//           }
//         });
//       }, 5 * 60 * 1000);
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// const downloadContractPDF = async (req, res, next) => {
//   try {
//     const data = req.body;
//     if (!data) {
//       throw new CustomError("Missing required parameters", 400);
//     }

//     const filePath = await EmploymentContractService.downloadContractPDF(data);
//     const fileBuffer = fs.readFileSync(filePath);

//     const originalName = `contract_${data.employee_id || Date.now()}.pdf`;
//     const mimeType = "application/pdf";

//     const { fileId, fileUrl } = await uploadToBackblazeWithValidation(
//       fileBuffer,
//       originalName,
//       mimeType,
//       "contracts",
//       { "b2-content-disposition": `inline; filename="${originalName}"` }
//     );

//     fs.unlink(filePath, (err) => {
//       if (err) console.error("Error deleting temp contract PDF:", err);
//     });

//     setTimeout(async () => {
//       try {
//         await deleteFromBackblaze(fileId);
//         console.log(`Deleted Backblaze contract PDF: ${fileId}`);
//       } catch (err) {
//         console.error("Error deleting file from Backblaze:", err);
//       }
//     }, 5 * 60 * 1000);

//     res.setHeader("Content-Type", "application/pdf");
//     res.setHeader("Content-Disposition", `inline; filename="${originalName}"`);
//     res.send(fileBuffer);
//   } catch (error) {
//     next(error);
//   }
// };

const downloadContractPDF = async (req, res, next) => {
  try {
    const data = req.body;
    if (!data) {
      throw new CustomError("Missing required parameters", 400);
    }

    const filePath = await EmploymentContractService.downloadContractPDF(data);
    const fileBuffer = fs.readFileSync(filePath);

    const originalName = `contract_${data.employee_id || Date.now()}.pdf`;
    const mimeType = "application/pdf";

    const fileUrl = await uploadToBackblazeWithValidation(
      fileBuffer,
      originalName,
      mimeType,
      "contracts",
      { "b2-content-disposition": `inline; filename="${originalName}"` }
    );

    fs.unlink(filePath, (err) => {
      if (err) console.error("Error deleting temp contract PDF:", err);
    });

    if (!/^https?:\/\//i.test(fileUrl)) {
      throw new CustomError("Invalid file URL returned from Backblaze", 500);
    }

    res.json({ url: fileUrl });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createEmploymentContract,
  findEmploymentContractById,
  updateEmploymentContract,
  deleteEmploymentContract,
  getAllEmploymentContract,
  downloadContractPDF,
};

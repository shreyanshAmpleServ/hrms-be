const hrLetterService = require("../services/hrLetterService.js");
const CustomError = require("../../utils/CustomError.js");
const moment = require("moment");
const fs = require("fs");
const {
  uploadToBackblaze,
  deleteFromBackblaze,
} = require("../../utils/uploadBackblaze.js");
const { success } = require("zod/v4");

const createhrLetter = async (req, res, next) => {
  try {
    let documentUrl = null;
    if (req.file) {
      const file = req.file;

      const buffer = file.buffer;
      documentUrl = await uploadToBackblaze(
        buffer,
        file.originalname,
        file.mimetype,
        "hrLetter"
      );
    }

    const data = {
      ...req.body,
      createdby: req.user.id,
      document_path: documentUrl,
      log_inst: req.user.log_inst,
    };
    const reqData = await hrLetterService.createhrLetter(data);
    res.status(201).success("Hr letter successfully created", reqData);
  } catch (error) {
    next(error);
  }
};

const findhrLetterById = async (req, res, next) => {
  try {
    const data = await hrLetterService.gethrLetterById(req.params.id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(new CustomError(error.message, 400));
  }
};

const updatehrLetter = async (req, res, next) => {
  try {
    const existinghrLetter = await hrLetterService.gethrLetterById(
      req.params.id
    );

    if (!existinghrLetter) {
      throw new CustomError("Hr letter not found", 404);
    }

    let documentUrl = existinghrLetter.document_path;

    console.log("req.file", req.file);

    if (req.file?.document_path) {
      const file = req.file.document_path;
      const buffer = file.buffer;

      documentUrl = await uploadToBackblaze(
        buffer,
        file.originalname,
        file.mimetype,
        "Candidate"
      );

      if (existinghrLetter.document_path) {
        await deleteFromBackblaze(existinghrLetter.document_path);
      }
    }

    const hrLetterData = {
      ...req.body,
      document_path: documentUrl,
      updatedby: req.user.id,
    };

    const result = await hrLetterService.updatehrLetter(
      req.params.id,
      hrLetterData
    );

    res.status(200).json({
      success: true,
      message: "Hr letter updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const deletehrLetter = async (req, res, next) => {
  try {
    const existinghrLetter = await hrLetterService.gethrLetterById(
      req.params.id
    );
    if (!existinghrLetter) {
      throw new CustomError("Hr letter not found", 404);
    }
    await hrLetterService.deletehrLetter(req.params.id);
    res.status(200).json({
      success: true,
      message: "Hr letter deleted Successfully",
    });
    if (existinghrLetter.document_path && req.files?.document_path) {
      await deleteFromBackblaze(existingCandidateMaster.document_path);
    }
  } catch (error) {
    next(error);
  }
};

const getAllhrLetter = async (req, res, next) => {
  try {
    const { search, page, size, startDate, endDate } = req.query;
    const data = await hrLetterService.getAllhrLetter(
      search,
      Number(page),
      Number(size),
      startDate && moment(startDate),
      endDate && moment(endDate)
    );
    res.status(200).success(null, data);
  } catch (error) {
    next(new CustomError(error.message, 400));
  }
};

const updatehrLetterStatus = async (req, res, next) => {
  try {
    console.log("Approver ID from token:", req.user.employee_id);
    const status = req.body.status;
    const data = {
      status,
      updatedby: req.user.employee_id,
      updatedate: new Date(),
    };
    const reqData = await hrLetterService.updatehrLetterStatus(
      req.params.id,
      data
    );
    res.status(200).success(" Hr letter status updated successfully", reqData);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createhrLetter,
  findhrLetterById,
  updatehrLetter,
  deletehrLetter,
  getAllhrLetter,
  updatehrLetterStatus,
};

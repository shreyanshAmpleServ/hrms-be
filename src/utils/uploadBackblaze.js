const B2 = require("backblaze-b2");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const axios = require("axios");

const testDirectAuth = async () => {
  const credentials = Buffer.from(
    `${process.env.BACKBLAZE_B2_KEY_ID}:${process.env.BACKBLAZE_B2_APPLICATION_KEY}`
  ).toString("base64");

  try {
    const res = await axios.get(
      "https://api.backblazeb2.com/b2api/v2/b2_authorize_account",
      {
        headers: {
          Authorization: `Basic ${credentials}`,
        },
      }
    );
    console.log(" Direct auth successful");
    return res.data;
  } catch (err) {
    console.error(" Auth failed directly:", err.message);
    throw err;
  }
};

const b2 = new B2({
  applicationKeyId: process.env.BACKBLAZE_B2_KEY_ID,
  applicationKey: process.env.BACKBLAZE_B2_APPLICATION_KEY,
});

const uploadToBackblaze = async (
  fileBuffer,
  originalName,
  mimeType,
  folder = "general"
) => {
  try {
    await b2.authorize();

    const bucketId = process.env.BACKBLAZE_B2_BUCKET_ID;
    if (!bucketId) throw new Error("BACKBLAZE_B2_BUCKET_ID is not set");

    const ext = path.extname(originalName);
    const fileName = `${folder}/${uuidv4()}${ext}`;

    const { data: uploadData } = await b2.getUploadUrl({ bucketId });

    await b2.uploadFile({
      uploadUrl: uploadData.uploadUrl,
      uploadAuthToken: uploadData.authorizationToken,
      fileName,
      data: fileBuffer,
      mime: mimeType,
    });

    const fileUrl = `https://DCC-HRMS.s3.us-east-005.backblazeb2.com/${fileName}`;
    console.log("File uploaded successfully:", fileUrl);
    return fileUrl;
  } catch (err) {
    console.error("Failed to upload file:", err.response?.data || err.message);
    throw new Error(`Failed to upload file to Backblaze: ${err.message}`);
  }
};

const deleteFromBackblaze = async (fileUrlOrPath) => {
  try {
    await b2.authorize();

    const bucketId = process.env.BACKBLAZE_B2_BUCKET_ID;
    if (!bucketId) throw new Error("Bucket ID not set");

    let fileName;
    try {
      const url = new URL(fileUrlOrPath);
      const pathParts = url.pathname.split("/");
      fileName = decodeURIComponent(pathParts.slice(1).join("/"));
    } catch {
      fileName = fileUrlOrPath.startsWith("/")
        ? fileUrlOrPath.slice(1)
        : fileUrlOrPath;
    }

    const { data: fileVersions } = await b2.listFileVersions({
      bucketId,
      prefix: fileName,
      maxFileCount: 1000,
    });

    const file = fileVersions.files.find((f) => f.fileName === fileName);
    if (!file) throw new Error("File not found");

    await b2.deleteFileVersion({
      fileName: file.fileName,
      fileId: file.fileId,
    });

    console.log("File deleted successfully:", fileName);
    return { success: true, fileName };
  } catch (err) {
    console.error(
      "Failed to delete from B2:",
      err.response?.data || err.message
    );
    throw err;
  }
};

const validateFile = (fileBuffer, originalName, mimeType, maxSizeMB = 10) => {
  if (!fileBuffer || fileBuffer.length === 0) {
    throw new Error("File buffer is empty");
  }

  if (!originalName || originalName.trim() === "") {
    throw new Error("Original filename is required");
  }

  if (!mimeType) {
    throw new Error("MIME type is required");
  }

  const fileSizeMB = fileBuffer.length / (1024 * 1024);
  if (fileSizeMB > maxSizeMB) {
    throw new Error(
      `File size (${fileSizeMB.toFixed(
        2
      )}MB) exceeds maximum allowed size (${maxSizeMB}MB)`
    );
  }

  const allowedExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".pdf",
    ".doc",
    ".docx",
  ];
  const ext = path.extname(originalName).toLowerCase();
  if (!allowedExtensions.includes(ext)) {
    throw new Error(
      `File type ${ext} is not allowed. Allowed types: ${allowedExtensions.join(
        ", "
      )}`
    );
  }

  return true;
};

const uploadToBackblazeWithValidation = async (
  fileBuffer,
  originalName,
  mimeType,
  folder = "general",
  headers = {},
  maxSizeMB = 10
) => {
  validateFile(fileBuffer, originalName, mimeType, maxSizeMB);

  const uploadResult = await uploadToBackblaze(
    fileBuffer,
    originalName,
    mimeType,
    folder
  );

  return uploadResult;
};

module.exports = {
  uploadToBackblaze,
  uploadToBackblazeWithValidation,
  deleteFromBackblaze,
  validateFile,
  testDirectAuth,
};

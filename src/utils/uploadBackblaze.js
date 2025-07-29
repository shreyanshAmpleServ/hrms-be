// const B2 = require("backblaze-b2");
// const { v4: uuidv4 } = require("uuid");
// const path = require("path");
// const axios = require("axios");

// const testDirectAuth = async () => {
//   const credentials = Buffer.from(
//     `${process.env.BACKBLAZE_B2_KEY_ID}:${process.env.BACKBLAZE_B2_APPLICATION_KEY}`
//   ).toString("base64");

//   try {
//     const res = await axios.get(
//       "https://api.backblazeb2.com/b2api/v2/b2_authorize_account",
//       {
//         headers: {
//           Authorization: `Basic ${credentials}`,
//         },
//       }
//     );
//   } catch (err) {
//     console.error("❌ Auth failed directly:", err.message);
//   }
// };

// const b2 = new B2({
//   applicationKeyId: process.env.BACKBLAZE_B2_KEY_ID,
//   applicationKey: process.env.BACKBLAZE_B2_APPLICATION_KEY,
// });

// // testDirectAuth();
// const uploadToBackblaze = async (
//   fileBuffer,
//   originalName,
//   mimeType,
//   folder = "general"
// ) => {
//   await b2.authorize();
//   const bucketName = process.env.BACKBLAZE_B2_BUCKET_NAME;
//   const { data: buckets } = await b2.listBuckets();
//   const bucket = buckets.buckets.find((b) => b.bucketName === bucketName);
//   if (!bucket) throw new Error("Bucket not found");

//   const ext = path.extname(originalName);
//   const fileName = `${folder}/${uuidv4()}${ext}`;

//   const { data: uploadData } = await b2.getUploadUrl({
//     bucketId: bucket.bucketId,
//   });

//   await b2.uploadFile({
//     uploadUrl: uploadData.uploadUrl,
//     uploadAuthToken: uploadData.authorizationToken,
//     fileName,
//     data: fileBuffer,
//     mime: mimeType,
//   });
//   console.log("Inner URL:", fileName, uploadData);

//   const fileUrl = `https://DCC-HRMS.s3.us-east-005.backblazeb2.com/${fileName}`;
//   return fileUrl;
// };

// // const deleteFromBackblaze = async (fileUrl) => {
// //   try {
// //     // 1. Extract file name from URL
// //     const url = new URL(fileUrl);
// //     const pathParts = url.pathname.split("/");
// //     const fileName = decodeURIComponent(pathParts.slice(1).join("/")); // remove leading slash

// //     // 2. Authorize
// //     await b2.authorize();

// //     // 3. Get bucketId
// //     const { data: buckets } = await b2.listBuckets();
// //     const bucket = buckets.buckets.find(
// //       (b) => b.bucketName === process.env.BACKBLAZE_B2_BUCKET_NAME
// //     );
// //     if (!bucket) throw new Error("Bucket not found");

// //     // 4. Get fileId
// //     const { data: fileVersions } = await b2.listFileVersions({
// //       bucketId: bucket.bucketId,
// //       prefix: fileName,
// //       // maxFileCount: 100
// //     });

// //     const file = fileVersions.files.find((f) => f.fileName === fileName);
// //     if (!file) throw new Error("File not found in bucket");

// //     // 5. Delete the file
// //     await b2.deleteFileVersion({
// //       fileName: file.fileName,
// //       fileId: file.fileId,
// //     });

// //     return true;
// //   } catch (err) {
// //     console.error("❌ Failed to delete from B2:", err.message);
// //     throw err;
// //   }
// // };

// const deleteFromBackblaze = async (fileUrlOrPath) => {
//   try {
//     // Accept both full URL and path
//     let fileName;
//     try {
//       // Try parsing as URL
//       const url = new URL(fileUrlOrPath);
//       const pathParts = url.pathname.split("/");
//       fileName = decodeURIComponent(pathParts.slice(1).join("/")); // remove leading slash
//     } catch {
//       // Not a URL, treat as path
//       fileName = fileUrlOrPath.startsWith("/")
//         ? fileUrlOrPath.slice(1)
//         : fileUrlOrPath;
//     }

//     // 2. Authorize
//     await b2.authorize();

//     // 3. Get bucketId
//     const { data: buckets } = await b2.listBuckets();
//     const bucket = buckets.buckets.find(
//       (b) => b.bucketName === process.env.BACKBLAZE_B2_BUCKET_NAME
//     );
//     if (!bucket) throw new Error("Bucket not found");

//     // 4. Get fileId
//     const { data: fileVersions } = await b2.listFileVersions({
//       bucketId: bucket.bucketId,
//       prefix: fileName,
//     });

//     const file = fileVersions.files.find((f) => f.fileName === fileName);
//     if (!file) throw new Error("File not found in bucket");

//     // 5. Delete the file
//     await b2.deleteFileVersion({
//       fileName: file.fileName,
//       fileId: file.fileId,
//     });

//     return true;
//   } catch (err) {
//     console.error("❌ Failed to delete from B2:", err.message);
//     throw err;
//   }
// };
// module.exports = { uploadToBackblaze, deleteFromBackblaze };

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
    console.log("✅ Direct auth successful");
    return res.data;
  } catch (err) {
    console.error("❌ Auth failed directly:", err.message);
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
    const bucketName = process.env.BACKBLAZE_B2_BUCKET_NAME;
    const { data: buckets } = await b2.listBuckets();
    const bucket = buckets.buckets.find((b) => b.bucketName === bucketName);
    if (!bucket) throw new Error("Bucket not found");

    const ext = path.extname(originalName);
    const fileName = `${folder}/${uuidv4()}${ext}`;

    const { data: uploadData } = await b2.getUploadUrl({
      bucketId: bucket.bucketId,
    });

    await b2.uploadFile({
      uploadUrl: uploadData.uploadUrl,
      uploadAuthToken: uploadData.authorizationToken,
      fileName,
      data: fileBuffer,
      mime: mimeType,
    });

    console.log("Upload details:", fileName, {
      bucketId: uploadData.bucketId,
      uploadUrl: uploadData.uploadUrl.split("/").pop(), // Just show the end part
    });

    const fileUrl = `https://DCC-HRMS.s3.us-east-005.backblazeb2.com/${fileName}`;
    return fileUrl;
  } catch (error) {
    console.error("Upload failed:", error.message);
    throw new Error(`Failed to upload file to Backblaze: ${error.message}`);
  }
};

const deleteFromBackblaze = async (fileUrlOrPath) => {
  try {
    console.log("Starting deletion process for:", fileUrlOrPath);

    // Accept both full URL and path
    let fileName;
    try {
      // Try parsing as URL
      const url = new URL(fileUrlOrPath);
      const pathParts = url.pathname.split("/");
      fileName = decodeURIComponent(pathParts.slice(1).join("/")); // remove leading slash
    } catch {
      // Not a URL, treat as path
      fileName = fileUrlOrPath.startsWith("/")
        ? fileUrlOrPath.slice(1)
        : fileUrlOrPath;
    }

    console.log(" Extracted filename:", fileName);

    // 2. Authorize
    await b2.authorize();

    // 3. Get bucketId
    const { data: buckets } = await b2.listBuckets();
    const bucket = buckets.buckets.find(
      (b) => b.bucketName === process.env.BACKBLAZE_B2_BUCKET_NAME
    );
    if (!bucket) throw new Error("Bucket not found");

    // 4. Get fileId - First check if file exists
    console.log("Searching for file in bucket...");
    const { data: fileVersions } = await b2.listFileVersions({
      bucketId: bucket.bucketId,
      prefix: fileName,
      maxFileCount: 10, // Limit results for performance
    });

    const file = fileVersions.files.find((f) => f.fileName === fileName);
    if (!file) {
      console.log(" File not found in bucket:", fileName);
      // Don't throw error - return success since the goal (file not existing) is achieved
      return {
        success: true,
        message: "File not found in bucket (likely already deleted)",
        fileName: fileName,
      };
    }

    console.log(" Found file, proceeding with deletion:", {
      fileName: file.fileName,
      fileId: file.fileId,
    });

    // 5. Delete the file
    await b2.deleteFileVersion({
      fileName: file.fileName,
      fileId: file.fileId,
    });

    console.log("File deleted successfully:", fileName);
    return {
      success: true,
      message: "File deleted successfully",
      fileName: fileName,
    };
  } catch (err) {
    console.error(" Delete operation failed:", err.message);

    // Handle specific "file not found" cases gracefully
    if (
      err.message?.includes("File not found") ||
      err.message?.includes("not found") ||
      err.message?.includes("does not exist") ||
      err.status === 404 ||
      err.response?.status === 404
    ) {
      console.log("ℹFile not found - treating as successful deletion");
      return {
        success: true,
        message: "File not found (treated as successful deletion)",
        fileName: fileUrlOrPath.split("/").pop(),
      };
    }

    // For other errors, still throw them
    throw new Error(`Failed to delete file from Backblaze: ${err.message}`);
  }
};

// Utility function to validate file before upload
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

  // Validate file extension
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

// Enhanced upload function with validation
const uploadToBackblazeWithValidation = async (
  fileBuffer,
  originalName,
  mimeType,
  folder = "general",
  maxSizeMB = 10
) => {
  // Validate file first
  validateFile(fileBuffer, originalName, mimeType, maxSizeMB);

  // Proceed with upload
  return await uploadToBackblaze(fileBuffer, originalName, mimeType, folder);
};

module.exports = {
  uploadToBackblaze,
  uploadToBackblazeWithValidation,
  deleteFromBackblaze,
  validateFile,
  testDirectAuth,
};

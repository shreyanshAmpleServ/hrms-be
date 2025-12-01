// const B2 = require("backblaze-b2");
// const { v4: uuidv4 } = require("uuid");
// const path = require("path");
// const axios = require("axios");
// const sharp = require("sharp");

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
//     console.log(" Direct auth successful");
//     return res.data;
//   } catch (err) {
//     console.error(" Auth failed directly:", err.message);
//     throw err;
//   }
// };

// const b2 = new B2({
//   applicationKeyId: process.env.BACKBLAZE_B2_KEY_ID,
//   applicationKey: process.env.BACKBLAZE_B2_APPLICATION_KEY,
// });

// // const uploadToBackblaze = async (
// //   fileBuffer,
// //   originalName,
// //   mimeType,
// //   folder = "general"
// // ) => {
// //   try {
// //     await b2.authorize();

// //     const bucketId = process.env.BACKBLAZE_B2_BUCKET_ID;
// //     if (!bucketId) throw new Error("BACKBLAZE_B2_BUCKET_ID is not set");

// //     const ext = path.extname(originalName);
// //     const fileName = `${folder}/${uuidv4()}${ext}`;

// //     const { data: uploadData } = await b2.getUploadUrl({ bucketId });

// //     await b2.uploadFile({
// //       uploadUrl: uploadData.uploadUrl,
// //       uploadAuthToken: uploadData.authorizationToken,
// //       fileName,
// //       data: fileBuffer,
// //       mime: mimeType,
// //     });

// //     const fileUrl = `https://DCC-HRMS.s3.us-east-005.backblazeb2.com/${fileName}`;
// //     console.log("File uploaded successfully:", fileUrl);
// //     return fileUrl;
// //   } catch (err) {
// //     verifyBackbaze();
// //     console.error("FULL ERROR:", err);
// //     console.error("BACKBLAZE RESPONSE:", err.response?.data);
// //     console.error("RAW:", err.message);

// //     console.error("Failed to upload file:", err.response?.data || err.message);
// //     throw new Error(`Failed to upload file to Backblaze: ${err.message}`);
// //   }
// // };

// const uploadToBackblaze = async (
//   fileBuffer,
//   originalName,
//   mimeType,
//   folder = "general",
//   processImage = true,
//   squareSize = 512
// ) => {
//   try {
//     await b2.authorize();

//     const bucketId = process.env.BACKBLAZE_B2_BUCKET_ID;
//     if (!bucketId) throw new Error("BACKBLAZE_B2_BUCKET_ID is not set");

//     let finalBuffer = fileBuffer;
//     if (processImage) {
//       finalBuffer = await processImageToSquare(
//         fileBuffer,
//         mimeType,
//         squareSize
//       );
//     }
//     const ext = path.extname(originalName);
//     const fileName = `${folder}/${uuidv4()}${ext}`;

//     const { data: uploadData } = await b2.getUploadUrl({ bucketId });

//     await b2.uploadFile({
//       uploadUrl: uploadData.uploadUrl,
//       uploadAuthToken: uploadData.authorizationToken,
//       fileName,
//       data: fileBuffer,
//       mime: mimeType,
//     });

//     const fileUrl = `https://DCC-HRMS.s3.us-east-005.backblazeb2.com/${fileName}`;
//     console.log("File uploaded successfully:", fileUrl);
//     return fileUrl;
//   } catch (err) {
//     verifyBackbaze();
//     console.error("FULL ERROR:", err);
//     console.error("BACKBLAZE RESPONSE:", err.response?.data);
//     console.error("RAW:", err.message);

//     console.error("Failed to upload file:", err.response?.data || err.message);
//     throw new Error(`Failed to upload file to Backblaze: ${err.message}`);
//   }
// };

// const deleteFromBackblaze = async (fileUrlOrPath) => {
//   try {
//     await b2.authorize();

//     const bucketId = process.env.BACKBLAZE_B2_BUCKET_ID;
//     if (!bucketId) throw new Error("Bucket ID not set");

//     let fileName;
//     try {
//       const url = new URL(fileUrlOrPath);
//       const pathParts = url.pathname.split("/");
//       fileName = decodeURIComponent(pathParts.slice(1).join("/"));
//     } catch {
//       fileName = fileUrlOrPath.startsWith("/")
//         ? fileUrlOrPath.slice(1)
//         : fileUrlOrPath;
//     }

//     const { data: fileVersions } = await b2.listFileVersions({
//       bucketId,
//       prefix: fileName,
//       maxFileCount: 1000,
//     });

//     const file = fileVersions.files.find((f) => f.fileName === fileName);
//     if (!file) throw new Error("File not found");

//     await b2.deleteFileVersion({
//       fileName: file.fileName,
//       fileId: file.fileId,
//     });

//     console.log("File deleted successfully:", fileName);
//     return { success: true, fileName };
//   } catch (err) {
//     console.error(
//       "Failed to delete from B2:",
//       err.response?.data || err.message
//     );
//     throw err;
//   }
// };

// const validateFile = (fileBuffer, originalName, mimeType, maxSizeMB = 10) => {
//   if (!fileBuffer || fileBuffer.length === 0) {
//     throw new Error("File buffer is empty");
//   }

//   if (!originalName || originalName.trim() === "") {
//     throw new Error("Original filename is required");
//   }

//   if (!mimeType) {
//     throw new Error("MIME type is required");
//   }

//   const fileSizeMB = fileBuffer.length / (1024 * 1024);
//   if (fileSizeMB > maxSizeMB) {
//     throw new Error(
//       `File size (${fileSizeMB.toFixed(
//         2
//       )}MB) exceeds maximum allowed size (${maxSizeMB}MB)`
//     );
//   }

//   const allowedExtensions = [
//     ".jpg",
//     ".jpeg",
//     ".png",
//     ".gif",
//     ".pdf",
//     ".doc",
//     ".docx",
//   ];
//   const ext = path.extname(originalName).toLowerCase();
//   if (!allowedExtensions.includes(ext)) {
//     throw new Error(
//       `File type ${ext} is not allowed. Allowed types: ${allowedExtensions.join(
//         ", "
//       )}`
//     );
//   }

//   return true;
// };

// // const uploadToBackblazeWithValidation = async (
// //   fileBuffer,
// //   originalName,
// //   mimeType,
// //   folder = "general",
// //   headers = {},
// //   maxSizeMB = 10
// // ) => {
// //   validateFile(fileBuffer, originalName, mimeType, maxSizeMB);

// //   const uploadResult = await uploadToBackblaze(
// //     fileBuffer,
// //     originalName,
// //     mimeType,
// //     folder
// //   );

// //   return uploadResult;
// // };

// const uploadToBackblazeWithValidation = async (
//   fileBuffer,
//   originalName,
//   mimeType,
//   folder = "general",
//   headers = {},
//   maxSizeMB = 10,
//   processImage = true,
//   squareSize = 512
// ) => {
//   validateFile(fileBuffer, originalName, mimeType, maxSizeMB);
//   const uploadResult = await uploadToBackblaze(
//     fileBuffer,
//     originalName,
//     mimeType,
//     folder,
//     processImage,
//     squareSize
//   );
//   return uploadResult;
// };

// const verifyBackbaze = async () => {
//   try {
//     const credentials = Buffer.from(
//       `${process.env.BACKBLAZE_B2_KEY_ID}:${process.env.BACKBLAZE_B2_APPLICATION_KEY}`
//     ).toString("base64");

//     const response = await axios.get(
//       "https://api.backblazeb2.com/b2api/v2/b2_authorize_account",
//       {
//         headers: {
//           Authorization: `Basic ${credentials}`,
//         },
//       }
//     );

//     return res.json({
//       success: true,
//       message: "Backblaze token verification successful",
//       data: response.data,
//     });
//   } catch (err) {
//     return res.status(400).json({
//       success: false,
//       message: "Backblaze token verification failed",
//       error: err.response?.data || err.message,
//     });
//   }
// };

// const processImageToSquare = async (fileBuffer, mimeType, size = 512) => {
//   const imageTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];

//   if (!imageTypes.includes(mimeType)) {
//     return fileBuffer;
//   }

//   try {
//     // Create circular mask
//     const circleShape = Buffer.from(
//       `<svg width="${size}" height="${size}">
//         <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="white"/>
//       </svg>`
//     );

//     const processedBuffer = await sharp(fileBuffer)
//       .resize(size, size, {
//         fit: "cover",
//         position: "center",
//       })
//       .composite([
//         {
//           input: circleShape,
//           blend: "dest-in",
//         },
//       ])
//       .png() // Convert to PNG to preserve transparency
//       .toBuffer();

//     return processedBuffer;
//   } catch (err) {
//     console.error("Image processing failed:", err.message);
//     return fileBuffer;
//   }
// };

// module.exports = {
//   uploadToBackblaze,
//   uploadToBackblazeWithValidation,
//   deleteFromBackblaze,
//   validateFile,
//   testDirectAuth,
//   verifyBackbaze,
//   processImageToSquare,
// };

const B2 = require("backblaze-b2");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const axios = require("axios");
const sharp = require("sharp");

// Initialize B2 client
const b2 = new B2({
  applicationKeyId: process.env.BACKBLAZE_B2_KEY_ID,
  applicationKey: process.env.BACKBLAZE_B2_APPLICATION_KEY,
});

// Keep track of authorization state
let isAuthorized = false;
let authorizationPromise = null;

const ensureAuthorized = async () => {
  if (authorizationPromise) {
    return authorizationPromise;
  }

  authorizationPromise = (async () => {
    try {
      console.log("Authorizing B2...");
      const authResponse = await b2.authorize();
      console.log("B2 Authorization successful");
      isAuthorized = true;
      return authResponse;
    } catch (err) {
      console.error("B2 Authorization failed:", err.message);
      isAuthorized = false;
      throw err;
    } finally {
      // Reset promise after some time to allow re-auth
      setTimeout(() => {
        authorizationPromise = null;
      }, 1000);
    }
  })();

  return authorizationPromise;
};

const testDirectAuth = async () => {
  const keyId = process.env.BACKBLAZE_B2_KEY_ID;
  const appKey = process.env.BACKBLAZE_B2_APPLICATION_KEY;

  console.log("Testing direct auth...");
  console.log("Key ID exists:", !!keyId);
  console.log("App Key exists:", !!appKey);
  console.log("Key ID length:", keyId?.length);
  console.log("App Key length:", appKey?.length);

  if (!keyId || !appKey) {
    throw new Error("Missing Backblaze credentials in environment variables");
  }

  const credentials = Buffer.from(`${keyId}:${appKey}`).toString("base64");

  try {
    const res = await axios.get(
      "https://api.backblazeb2.com/b2api/v2/b2_authorize_account",
      {
        headers: {
          Authorization: `Basic ${credentials}`,
        },
        timeout: 30000, // 30 second timeout
      }
    );
    console.log("✅ Direct auth successful");
    return res.data;
  } catch (err) {
    console.error("❌ Auth failed directly:", err.message);
    console.error("Response data:", err.response?.data);
    console.error("Response status:", err.response?.status);
    throw err;
  }
};

const processImageToSquare = async (fileBuffer, mimeType, size = 512) => {
  const imageTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];

  if (!imageTypes.includes(mimeType)) {
    console.log("Not an image type, skipping processing:", mimeType);
    return fileBuffer;
  }

  try {
    console.log("Processing image to square, size:", size);

    // Create circular mask
    const circleShape = Buffer.from(
      `<svg width="${size}" height="${size}">
        <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="white"/>
      </svg>`
    );

    const processedBuffer = await sharp(fileBuffer)
      .resize(size, size, {
        fit: "cover",
        position: "center",
      })
      .composite([
        {
          input: circleShape,
          blend: "dest-in",
        },
      ])
      .png()
      .toBuffer();

    console.log(
      "Image processed successfully, new size:",
      processedBuffer.length
    );
    return processedBuffer;
  } catch (err) {
    console.error("Image processing failed:", err.message);
    // Return original buffer if processing fails
    return fileBuffer;
  }
};

const uploadToBackblaze = async (
  fileBuffer,
  originalName,
  mimeType,
  folder = "general",
  processImage = true,
  squareSize = 512
) => {
  try {
    console.log("=== Starting Backblaze Upload ===");
    console.log("Original name:", originalName);
    console.log("MIME type:", mimeType);
    console.log("Folder:", folder);
    console.log("Buffer size:", fileBuffer?.length);
    console.log("Process image:", processImage);

    // Validate inputs
    if (!fileBuffer || fileBuffer.length === 0) {
      throw new Error("File buffer is empty or undefined");
    }

    // Check environment variables
    const bucketId = process.env.BACKBLAZE_B2_BUCKET_ID;
    const keyId = process.env.BACKBLAZE_B2_KEY_ID;
    const appKey = process.env.BACKBLAZE_B2_APPLICATION_KEY;

    console.log("Bucket ID exists:", !!bucketId);
    console.log("Key ID exists:", !!keyId);
    console.log("App Key exists:", !!appKey);

    if (!bucketId) throw new Error("BACKBLAZE_B2_BUCKET_ID is not set");
    if (!keyId) throw new Error("BACKBLAZE_B2_KEY_ID is not set");
    if (!appKey) throw new Error("BACKBLAZE_B2_APPLICATION_KEY is not set");

    console.log("Authorizing...");
    await ensureAuthorized();
    console.log("Authorization complete");

    let finalBuffer = fileBuffer;
    let finalMimeType = mimeType;

    if (processImage) {
      finalBuffer = await processImageToSquare(
        fileBuffer,
        mimeType,
        squareSize
      );
      if (finalBuffer !== fileBuffer) {
        finalMimeType = "image/png";
      }
    }

    console.log("Final buffer size:", finalBuffer.length);

    const ext =
      processImage && finalBuffer !== fileBuffer
        ? ".png"
        : path.extname(originalName);
    const fileName = `${folder}/${uuidv4()}${ext}`;
    console.log("Generated filename:", fileName);

    console.log("Getting upload URL...");
    const { data: uploadData } = await b2.getUploadUrl({ bucketId });
    console.log("Upload URL obtained");

    console.log("Uploading file...");
    const uploadResponse = await b2.uploadFile({
      uploadUrl: uploadData.uploadUrl,
      uploadAuthToken: uploadData.authorizationToken,
      fileName,
      data: finalBuffer,
      mime: finalMimeType,
    });
    console.log("Upload response:", uploadResponse?.data?.fileName);

    const fileUrl = `https://DCC-HRMS.s3.us-east-005.backblazeb2.com/${fileName}`;
    console.log("File uploaded successfully:", fileUrl);
    return fileUrl;
  } catch (err) {
    console.error("=== Upload Error Details ===");
    console.error("Error name:", err.name);
    console.error("Error message:", err.message);
    console.error("Error stack:", err.stack);
    console.error("Response status:", err.response?.status);
    console.error(
      "Response data:",
      JSON.stringify(err.response?.data, null, 2)
    );

    if (err.response?.status === 401 || err.message?.includes("unauthorized")) {
      isAuthorized = false;
      authorizationPromise = null;
    }

    throw new Error(`Failed to upload file to Backblaze: ${err.message}`);
  }
};

const deleteFromBackblaze = async (fileUrlOrPath) => {
  try {
    await ensureAuthorized();

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

    console.log("Deleting file:", fileName);

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

    console.log(" File deleted successfully:", fileName);
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
    ".webp",
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
  maxSizeMB = 10,
  processImage = true,
  squareSize = 512
) => {
  validateFile(fileBuffer, originalName, mimeType, maxSizeMB);

  const uploadResult = await uploadToBackblaze(
    fileBuffer,
    originalName,
    mimeType,
    folder,
    processImage,
    squareSize
  );

  return uploadResult;
};

const verifyBackblaze = async () => {
  try {
    const credentials = Buffer.from(
      `${process.env.BACKBLAZE_B2_KEY_ID}:${process.env.BACKBLAZE_B2_APPLICATION_KEY}`
    ).toString("base64");

    const response = await axios.get(
      "https://api.backblazeb2.com/b2api/v2/b2_authorize_account",
      {
        headers: {
          Authorization: `Basic ${credentials}`,
        },
        timeout: 30000,
      }
    );

    return {
      success: true,
      message: "Backblaze token verification successful",
      data: {
        accountId: response.data.accountId,
        apiUrl: response.data.apiUrl,
        allowed: response.data.allowed,
      },
    };
  } catch (err) {
    return {
      success: false,
      message: "Backblaze token verification failed",
      error: err.response?.data || err.message,
    };
  }
};

module.exports = {
  uploadToBackblaze,
  uploadToBackblazeWithValidation,
  deleteFromBackblaze,
  validateFile,
  testDirectAuth,
  verifyBackblaze,
  processImageToSquare,
};

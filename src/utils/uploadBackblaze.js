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

const b2 = new B2({
  applicationKeyId: process.env.BACKBLAZE_B2_KEY_ID,
  applicationKey: process.env.BACKBLAZE_B2_APPLICATION_KEY,
});

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
        timeout: 30000,
      }
    );
    console.log("Direct auth successful");
    return res.data;
  } catch (err) {
    console.error("Auth failed directly:", err.message);
    console.error("Response data:", err.response?.data);
    console.error("Response status:", err.response?.status);
    throw err;
  }
};

// const processImageToSquare = async (fileBuffer, mimeType, size = 512) => {
//   const imageTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];

//   if (!imageTypes.includes(mimeType)) {
//     console.log("Not an image type, skipping processing:", mimeType);
//     return fileBuffer;
//   }

//   try {
//     console.log("Processing image to square, size:", size);

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
//       .png()
//       .toBuffer();

//     console.log(
//       "Image processed successfully, new size:",
//       processedBuffer.length
//     );
//     return processedBuffer;
//   } catch (err) {
//     console.error("Image processing failed:", err.message);
//     return fileBuffer;
//   }
// };

const processImageToSquare = async (fileBuffer, mimeType, size = 512) => {
  const imageTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];

  if (!imageTypes.includes(mimeType)) {
    console.log("Not an image type, skipping processing:", mimeType);
    return fileBuffer;
  }

  try {
    console.log("Processing image to square shape, size:", size);

    const isJpeg = mimeType === "image/jpeg" || mimeType === "image/jpg";

    let sharpInstance = sharp(fileBuffer).resize(size, size, {
      fit: "cover",
      position: "center",
      kernel: "lanczos3",
    });

    let processedBuffer;

    if (isJpeg) {
      processedBuffer = await sharpInstance
        .jpeg({
          quality: 95,
          chromaSubsampling: "4:4:4",
          mozjpeg: true,
        })
        .toBuffer();
    } else {
      processedBuffer = await sharpInstance
        .png({
          quality: 100,
          compressionLevel: 6,
          palette: false,
        })
        .toBuffer();
    }

    console.log(
      "Image processed successfully, original size:",
      fileBuffer.length,
      "new size:",
      processedBuffer.length
    );
    return processedBuffer;
  } catch (err) {
    console.error("Image processing failed:", err.message);
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
    console.log("=== UPLOAD DEBUG START ===");

    const bucketId = process.env.BACKBLAZE_B2_BUCKET_ID;
    const keyId = process.env.BACKBLAZE_B2_KEY_ID;
    const appKey = process.env.BACKBLAZE_B2_APPLICATION_KEY;

    console.log("Step 1 - Env vars:");
    console.log(
      "  Bucket ID:",
      bucketId ? `${bucketId.substring(0, 5)}...` : "MISSING!"
    );
    console.log(
      "  Key ID:",
      keyId ? `${keyId.substring(0, 5)}...` : "MISSING!"
    );
    console.log("  App Key:", appKey ? "EXISTS" : "MISSING!");

    if (!bucketId) throw new Error("BACKBLAZE_B2_BUCKET_ID is not set");
    if (!keyId) throw new Error("BACKBLAZE_B2_KEY_ID is not set");
    if (!appKey) throw new Error("BACKBLAZE_B2_APPLICATION_KEY is not set");

    console.log("Step 2 - Authorizing...");
    try {
      await b2.authorize();
      console.log("  Authorization successful");
    } catch (authErr) {
      console.error("  Authorization FAILED:", authErr.message);
      console.error("  Auth error response:", authErr.response?.data);
      throw new Error(
        `Authorization failed: ${
          authErr.response?.data?.message || authErr.message
        }`
      );
    }

    console.log("Step 3 - Processing buffer...");
    let finalBuffer = fileBuffer;
    if (processImage) {
      finalBuffer = await processImageToSquare(
        fileBuffer,
        mimeType,
        squareSize
      );
    }
    console.log("  Original buffer size:", fileBuffer.length);
    console.log("  Final buffer size:", finalBuffer.length);

    const ext = path.extname(originalName);
    const fileName = `${folder}/${uuidv4()}${ext}`;
    console.log("Step 4 - Filename:", fileName);

    console.log("Step 5 - Getting upload URL...");
    let uploadData;
    try {
      const response = await b2.getUploadUrl({ bucketId });
      uploadData = response.data;
      console.log(
        "  Upload URL obtained:",
        uploadData.uploadUrl ? "YES" : "NO"
      );
    } catch (urlErr) {
      console.error("  Get upload URL FAILED:", urlErr.message);
      console.error("  URL error response:", urlErr.response?.data);
      throw new Error(
        `Failed to get upload URL: ${
          urlErr.response?.data?.message || urlErr.message
        }`
      );
    }

    console.log("Step 6 - Uploading file...");
    console.log("  File name:", fileName);
    console.log("  Buffer size:", finalBuffer.length);
    console.log("  MIME type:", mimeType);

    try {
      const uploadResult = await b2.uploadFile({
        uploadUrl: uploadData.uploadUrl,
        uploadAuthToken: uploadData.authorizationToken,
        fileName,
        data: finalBuffer,
        mime: mimeType,
      });
      console.log("  Upload successful:", uploadResult.data?.fileName);
    } catch (uploadErr) {
      console.error("  Upload FAILED!");
      console.error("  Error name:", uploadErr.name);
      console.error("  Error message:", uploadErr.message);
      console.error("  Error code:", uploadErr.code);
      console.error("  Response status:", uploadErr.response?.status);
      console.error(
        "  Response data:",
        JSON.stringify(uploadErr.response?.data, null, 2)
      );
      throw new Error(
        `Upload failed: ${
          uploadErr.response?.data?.message || uploadErr.message
        }`
      );
    }

    const fileUrl = `https://DCC-HRMS.s3.us-east-005.backblazeb2.com/${fileName}`;
    console.log("=== UPLOAD SUCCESS ===");
    console.log("File URL:", fileUrl);

    return fileUrl;
  } catch (err) {
    console.error("=== UPLOAD ERROR ===");
    console.error("Final error:", err.message);
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

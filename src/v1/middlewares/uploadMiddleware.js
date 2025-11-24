// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");
// const { asyncLocalStorage } = require("../../utils/prismaProxy");

// const ensureDir = (dir) => {
//   if (!fs.existsSync(dir)) {
//     fs.mkdirSync(dir, { recursive: true });
//   }
// };

// // Use MEMORY storage instead of disk storage to avoid context loss
// const storage = multer.memoryStorage();

// const allowedTypes = [
//   "image/jpeg",
//   "image/png",
//   "image/gif",
//   "image/avif",
//   "application/pdf",
//   "application/msword",
//   "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
// ];

// const fileFilter = (req, file, cb) => {
//   if (allowedTypes.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "Invalid file type."));
//   }
// };

// const multerUpload = multer({
//   storage,
//   fileFilter,
//   limits: { fileSize: 1024 * 1024 * 3 }, // 3MB
// });

// // Context-preserving wrapper
// const withContext = (middleware) => (req, res, next) => {
//   const store = asyncLocalStorage.getStore();

//   if (!store || !store.tenantDb) {
//     console.error("⚠️ Upload: No context before multer");
//     return middleware(req, res, next);
//   }

//   console.log(`✅ Upload: Starting with tenant ${store.tenantDb}`);

//   // Execute multer and restore context after
//   middleware(req, res, (err) => {
//     if (err) {
//       console.error("❌ Upload error:", err);
//       return next(err);
//     }

//     // Restore context after multer
//     const currentStore = asyncLocalStorage.getStore();
//     if (!currentStore || !currentStore.tenantDb) {
//       console.log("⚠️ Context lost after multer, restoring...");
//       asyncLocalStorage.run(store, () => {
//         console.log(`✅ Context restored: ${store.tenantDb}`);
//         next();
//       });
//     } else {
//       console.log(`✅ Context maintained: ${currentStore.tenantDb}`);
//       next();
//     }
//   });
// };

// module.exports = {
//   single: (field) => withContext(multerUpload.single(field)),
//   array: (field, max) => withContext(multerUpload.array(field, max)),
//   fields: (fields) => withContext(multerUpload.fields(fields)),
//   none: () => withContext(multerUpload.none()),
// };
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { asyncLocalStorage } = require("../../utils/prismaProxy");

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Use MEMORY storage instead of disk storage to avoid context loss
const storage = multer.memoryStorage();

const allowedTypes = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/avif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const fileFilter = (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "Invalid file type."));
  }
};

const multerUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 1024 * 1024 * 3 }, // 3MB
});

// Context-preserving wrapper
const withContext = (middleware) => (req, res, next) => {
  const store = asyncLocalStorage.getStore();

  if (!store || !store.tenantDb) {
    console.error("⚠️ Upload: No context before multer");
    return middleware(req, res, next);
  }

  console.log(`✅ Upload: Starting with tenant ${store.tenantDb}`);

  // Execute multer and restore context after
  middleware(req, res, (err) => {
    if (err) {
      console.error("❌ Upload error:", err);
      return next(err);
    }

    // Restore context after multer
    const currentStore = asyncLocalStorage.getStore();
    if (!currentStore || !currentStore.tenantDb) {
      console.log("⚠️ Context lost after multer, restoring...");
      asyncLocalStorage.run(store, () => {
        console.log(`✅ Context restored: ${store.tenantDb}`);
        next();
      });
    } else {
      console.log(`✅ Context maintained: ${currentStore.tenantDb}`);
      next();
    }
  });
};

module.exports = {
  single: (field) => withContext(multerUpload.single(field)),
  array: (field, max) => withContext(multerUpload.array(field, max)),
  fields: (fields) => withContext(multerUpload.fields(fields)),
  none: () => withContext(multerUpload.none()),
};

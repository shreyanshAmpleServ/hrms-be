const uploadToBackblaze = async (
  fileBuffer,
  originalName,
  mimeType,
  folder = "general",
  processImage = true, // New parameter
  squareSize = 512 // New parameter for square dimensions
) => {
  try {
    await b2.authorize();
    const bucketId = process.env.BACKBLAZE_B2_BUCKET_ID;
    if (!bucketId) throw new Error("BACKBLAZE_B2_BUCKET_ID is not set");

    // Process image to square if enabled
    let finalBuffer = fileBuffer;
    if (processImage) {
      finalBuffer = await processImageToSquare(
        fileBuffer,
        mimeType,
        squareSize
      );
    }

    const ext = path.extname(originalName);
    const fileName = `${folder}/${uuidv4()}${ext}`;
    const { data: uploadData } = await b2.getUploadUrl({ bucketId });

    await b2.uploadFile({
      uploadUrl: uploadData.uploadUrl,
      uploadAuthToken: uploadData.authorizationToken,
      fileName,
      data: finalBuffer, // Use processed buffer
      mime: mimeType,
    });

    const fileUrl = `https://DCC-HRMS.s3.us-east-005.backblazeb2.com/${fileName}`;
    console.log("File uploaded successfully:", fileUrl);
    return fileUrl;
  } catch (err) {
    // ... rest of error handling
  }
};

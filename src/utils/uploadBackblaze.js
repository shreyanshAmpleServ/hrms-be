const B2 = require('backblaze-b2');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const axios = require('axios');

const testDirectAuth = async () => {
  const credentials = Buffer.from(`${process.env.BACKBLAZE_B2_KEY_ID}:${process.env.BACKBLAZE_B2_APPLICATION_KEY}`).toString('base64');

  try {
    const res = await axios.get('https://api.backblazeb2.com/b2api/v2/b2_authorize_account', {
      headers: {
        Authorization: `Basic ${credentials}`
      }
    });
  } catch (err) {
    console.error("❌ Auth failed directly:", err.message);
  }
};


const b2 = new B2({
  applicationKeyId: process.env.BACKBLAZE_B2_KEY_ID,
  applicationKey: process.env.BACKBLAZE_B2_APPLICATION_KEY,
});

// testDirectAuth();
const uploadToBackblaze = async (fileBuffer, originalName, mimeType,folder="general") => {
  await b2.authorize();
  const bucketName = process.env.BACKBLAZE_B2_BUCKET_NAME;
  const { data: buckets } = await b2.listBuckets();
  const bucket = buckets.buckets.find(b => b.bucketName === bucketName);
  if (!bucket) throw new Error('Bucket not found');
  
  const ext = path.extname(originalName);
  const fileName = `${folder}/${uuidv4()}${ext}`;
  
  const { data: uploadData } = await b2.getUploadUrl({ bucketId: bucket.bucketId });
  
  console.log("Inner URL:",fileName, uploadData);

  await b2.uploadFile({
    uploadUrl: uploadData.uploadUrl,
    uploadAuthToken: uploadData.authorizationToken,
    fileName,
    data: fileBuffer,
    mime: mimeType,
  });

  const fileUrl = `https://DCC-CRMS.s3.us-east-005.backblazeb2.com/${fileName}`;
  return fileUrl;
};


const deleteFromBackblaze = async (fileUrl) => {
    try {
      // 1. Extract file name from URL
      const url = new URL(fileUrl);
      const pathParts = url.pathname.split('/');
      const fileName = decodeURIComponent(pathParts.slice(1).join('/')); // remove leading slash
  
      // 2. Authorize
      await b2.authorize();
  
      // 3. Get bucketId
      const { data: buckets } = await b2.listBuckets();
      const bucket = buckets.buckets.find(b => b.bucketName === process.env.BACKBLAZE_B2_BUCKET_NAME);
      if (!bucket) throw new Error('Bucket not found');
  
      // 4. Get fileId
      const { data: fileVersions } = await b2.listFileVersions({
        bucketId: bucket.bucketId,
        prefix: fileName,
        // maxFileCount: 100
      });
  
      const file = fileVersions.files.find(f => f.fileName === fileName);
      if (!file) throw new Error('File not found in bucket');
  
      // 5. Delete the file
      await b2.deleteFileVersion({
        fileName: file.fileName,
        fileId: file.fileId
      });
  
      return true;
    } catch (err) {
      console.error('❌ Failed to delete from B2:', err.message);
      throw err;
    }
  };
module.exports = {uploadToBackblaze , deleteFromBackblaze};
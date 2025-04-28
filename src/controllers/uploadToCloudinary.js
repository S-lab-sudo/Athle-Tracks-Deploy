const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
module.exports= uploadToCloudinary = (fileBuffer, publicId,directory) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { public_id: publicId, folder: directory} ,
      (error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

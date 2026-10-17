require('dotenv').config();
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadImageBuffer = (buffer, folder = 'artlog') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result) {
          return reject(new Error('Cloudinary upload failed'));
        }

        resolve(result);
      }
    );

    stream.end(buffer);
  });
};

module.exports = { cloudinary, uploadImageBuffer };

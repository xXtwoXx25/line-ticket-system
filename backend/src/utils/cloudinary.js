const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a base64 image string to Cloudinary
 * @param {string} base64Image - The base64 string of the image
 * @param {string} folder - The folder to upload to in Cloudinary
 * @returns {Promise<string>} - The secure URL of the uploaded image
 */
const uploadImage = async (base64Image, folder = 'tickets') => {
  try {
    if (!base64Image) return null;

    const result = await cloudinary.uploader.upload(base64Image, {
      folder: folder,
    });
    return result.secure_url;
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    throw new Error('Image upload failed');
  }
};

module.exports = {
  uploadImage,
  cloudinary
};

import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Cloudinary if credentials are provided
if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

/**
 * Upload file to Cloudinary (production) or return local path (development)
 */
export const uploadFile = async (filePath, folder = 'gymos') => {
  try {
    // If Cloudinary is configured, use it
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: folder,
        resource_type: 'auto'
      });

      // Delete local file after upload
      fs.unlinkSync(filePath);

      return {
        url: result.secure_url,
        publicId: result.public_id,
        provider: 'cloudinary'
      };
    } else {
      // Local storage (development)
      const relativePath = path.relative(path.join(__dirname, '../../'), filePath);
      return {
        url: `/uploads/${path.basename(filePath)}`,
        publicId: null,
        provider: 'local'
      };
    }
  } catch (error) {
    // Clean up local file on error
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw error;
  }
};

/**
 * Delete file from Cloudinary
 */
export const deleteFile = async (publicId) => {
  if (!publicId || !process.env.CLOUDINARY_CLOUD_NAME) {
    return;
  }

  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting file from Cloudinary:', error);
  }
};


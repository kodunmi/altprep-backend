import { Service, Inject } from 'typedi';
import { v2 as cloudinary } from 'cloudinary';
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

@Service()
export class CloudinaryService {
  constructor() {
    // Make sure these are coming from environment variables in production
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'your-cloud-name',
      api_key: process.env.CLOUDINARY_API_KEY || 'your-api-key',
      api_secret: process.env.CLOUDINARY_API_SECRET || 'your-api-secret',
      secure: true,
    });
  }

  /**
   * Uploads a file buffer or stream to Cloudinary
   * @param file - Express.Multer.File or { buffer: Buffer, mimetype: string, originalname: string }
   * @param options - optional folder, public_id, etc.
   */
  async uploadProfilePicture(
    file: any, // Express.Multer.File
    options: {
      folder?: string;
      public_id?: string;
      overwrite?: boolean;
    } = {},
  ): Promise<string> {
    const defaultOptions = {
      folder: 'profile-pictures',
      overwrite: true,
      resource_type: 'image' as const,
      ...options,
    };

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        defaultOptions,
        (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            return reject(new Error(error.message || 'Failed to upload image to Cloudinary'));
          }

          if (!result?.secure_url) {
            return reject(new Error('No secure_url returned from Cloudinary'));
          }

          resolve(result.secure_url);
        },
      );

      uploadStream.end(file.buffer);
    });
  }

  /**
   * Optional: Delete old avatar if needed
   */
  async deleteImage(publicId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) return reject(error);
        resolve();
      });
    });
  }
}

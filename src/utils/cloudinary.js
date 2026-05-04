import { v2 as cloudinary } from "cloudinary";
import fs from "fs"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    // Upload file to Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto", // works for image, video, any file
    });

    // File uploaded successfully — remove from local storage
    fs.unlinkSync(localFilePath);

    console.log("File uploaded on Cloudinary:", response.url);
    return response;

  } catch (error) {
    // Remove locally saved temp file if upload failed
    fs.unlinkSync(localFilePath);
    console.log("Cloudinary upload failed:", error);
    return null;
  }
};

export { uploadOnCloudinary }; 
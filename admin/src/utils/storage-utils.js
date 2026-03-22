/**
 * Simple storage utility for the admin dashboard.
 * Uses Cloudinary for image uploads.
 */

const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "kitchen_appliances";
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

export const uploadToCloudinary = async (file, onProgress) => {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    console.error("Cloudinary configuration missing!", {
      cloudName: CLOUDINARY_CLOUD_NAME,
      preset: CLOUDINARY_UPLOAD_PRESET
    });
    throw new Error("Cloudinary configuration is missing. Please check your environment variables.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  try {
    console.log("Starting Cloudinary upload...", {
      cloudName: CLOUDINARY_CLOUD_NAME,
      preset: CLOUDINARY_UPLOAD_PRESET
    });

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (response.status === 404) {
      throw new Error("Cloudinary API endpoint not found. Please check your Cloud Name.");
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Cloudinary upload failed:", errorData);
      const cloudMsg = errorData.error?.message || `Status ${response.status}`;
      throw new Error(`Cloudinary Error: ${cloudMsg}. (Using Cloud: ${CLOUDINARY_CLOUD_NAME}, Preset: ${CLOUDINARY_UPLOAD_PRESET}). IMPORTANT: Ensure your preset is set to 'Unsigned' mode in Cloudinary!`);
    }

    const data = await response.json();
    console.log("Cloudinary upload successful:", data.secure_url);
    return data.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    if (error.message.includes("Failed to fetch")) {
      throw new Error("Network error or invalid Cloudinary URL. Check your internet and Cloud Name.");
    }
    throw error;
  }
};

export const getCloudinaryUrl = (source) => {
  if (!source) return "";
  if (source.startsWith("http") || source.startsWith("/")) return source;
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_auto/${source}`;
};

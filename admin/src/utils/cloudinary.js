/**
 * Utility to handle image URLs. 
 * Supports Cloudinary public IDs (legacy) and full Firebase/external URLs.
 */

const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

export const getCloudinaryUrl = (source, transformations = 'f_auto,q_auto') => {
  if (!source) return '';
  
  // If it's already a full URL (Firebase, external) or a relative local path, return it as-is
  if (source.startsWith('http') || source.startsWith('/')) {
    return source;
  }
  
  // Otherwise, treat it as a Cloudinary public ID for backward compatibility with local data
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformations}/${source}`;
};

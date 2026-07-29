import { v2 as cloudinary } from "cloudinary";


export const getCloudinaryPublicId = (url) => {
  if (!url) return null;
  try {
    const regex = /\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+$/;
    const match = url.match(regex);
    return match ? match[1] : null;
  } catch (err) {
    return null;
  }
};

export default cloudinary;
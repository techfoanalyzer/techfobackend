import ImageKit from "imagekit";
export const ckImagekit = new ImageKit({
  publicKey: process.env.CK_IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.CK_IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.CK_IMAGEKIT_URL_ENDPOINT,
});
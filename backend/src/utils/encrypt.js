import CryptoJS from "crypto-js";

export const encryptData = (data) => {
  return CryptoJS.AES.encrypt(data, process.env.AES_SECRET).toString();
};

export const decryptData = (cipher) => {
  const bytes = CryptoJS.AES.decrypt(cipher, process.env.AES_SECRET);
  return bytes.toString(CryptoJS.enc.Utf8);
};

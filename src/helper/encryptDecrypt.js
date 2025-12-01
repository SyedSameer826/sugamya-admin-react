const CryptoJS = require("crypto-js");
const encryptReactPassword = process.env.REACT_APP_ENCRYPT_PASSWORD
  ? process.env.REACT_APP_ENCRYPT_PASSWORD
  : "pimptupEncryption";

const encryptEmail = (email) => {
  const encrypted = CryptoJS.AES.encrypt(
    email,
    encryptReactPassword
  ).toString();
  console.log(`Encrypted Email: ${encrypted}`);
  return encrypted;
};

const encryptPassword = (password) => {
  const encrypted = CryptoJS.AES.encrypt(
    password,
    encryptReactPassword
  ).toString();
  console.log(`Encrypted Password: ${encrypted}`);
  return encrypted;
};

const decryptEmail = (email) => {
  console.log(`Decrypting Email: ${email}`);
  const byteEmail = CryptoJS.AES.decrypt(email, encryptReactPassword);
  console.log(`Decrypted Bytes: ${byteEmail}`);
  const decrypted = byteEmail.toString(CryptoJS.enc.Utf8);
  console.log(`Decrypted Email: ${decrypted}`);
  return decrypted;
};

const decryptPassword = (password) => {
  console.log(`Decrypting Password: ${password}`);
  const bytePassword = CryptoJS.AES.decrypt(password, encryptReactPassword);
  console.log(`Decrypted Bytes: ${bytePassword}`);
  const decrypted = bytePassword.toString(CryptoJS.enc.Utf8);
  console.log(`Decrypted Password: ${decrypted}`);
  return decrypted;
};

export default { encryptEmail, encryptPassword, decryptEmail, decryptPassword };

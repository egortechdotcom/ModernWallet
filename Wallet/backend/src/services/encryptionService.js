// Import CryptoJS library
const CryptoJS = require("crypto-js");

// Encrypt function
function encryptMessage(message, key) {
  // Encrypt using AES encryption with CBC mode and PKCS7 padding
  const encrypted = CryptoJS.AES.encrypt(message, key, {
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  return encrypted.toString();
}

// Decrypt function
function decryptMessage(encryptedMessage, key) {
  // Decrypt using AES decryption with CBC mode and PKCS7 padding
  const decrypted = CryptoJS.AES.decrypt(encryptedMessage, key, {
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  return decrypted.toString(CryptoJS.enc.Utf8);
}

// Example usage
const stringify = {
    "key":"0xdc4931c5777d60d4b378e99adbfad27154cc5bfa644a2cdf3b45ac96c261da901111111",
    "hfc8":"ankit.mishra@oodles.io"
}
const message = JSON.stringify(stringify)
const key = "mySecretKey";

// Encrypt the message
const encryptedMessage = encryptMessage(message, key);
console.log("Encrypted message:", encryptedMessage);

// Decrypt the message
const decryptedMessage = decryptMessage(encryptedMessage, key);
console.log("Decrypted message:", decryptedMessage);

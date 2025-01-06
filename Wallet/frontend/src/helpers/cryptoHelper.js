import CryptoJS from 'crypto-js';


export const performEncryption = (text) => {
    return CryptoJS.AES.encrypt(text, process.env.REACT_APP_CRYPTO_HELPER_KEY).toString();
};

export const performDecryption = (encrypted) => {
    return CryptoJS.AES.decrypt(encrypted, process.env.REACT_APP_CRYPTO_HELPER_KEY).toString(CryptoJS.enc.Utf8);
};

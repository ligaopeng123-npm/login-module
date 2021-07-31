import CryptoJS from 'crypto-js/index.js';

/**
 * 处理加密
 * @param message
 * @param hex
 * @returns {*|CipherParams|PromiseLike<ArrayBuffer>}
 */
const encrypted = (message, hex) => {
	return CryptoJS.DES.encrypt(message, hex, {
		mode: CryptoJS.mode.ECB,
		padding: CryptoJS.pad.Pkcs7
	});
};

const decrypted = (message, key) => {
	return CryptoJS.DES.decrypt(message, CryptoJS.enc.Utf8.parse(key), {
		mode: CryptoJS.mode.ECB,
		padding: CryptoJS.pad.Pkcs7
	}).toString();
};


export const encryptDES = (message, key) => {
	return encrypted(message, CryptoJS.enc.Utf8.parse(key)).toString();
};
import CryptoJS from 'crypto-js';

const _decode = (str: string) => CryptoJS.enc.Base64.parse(str).toString(CryptoJS.enc.Utf8);

export function decrypt(word: string) {
	const _k_raw = CryptoJS.enc.Utf8.parse(_decode('MjAyMzA2MTBIZWxsb0RvZw=='));
	const _i_raw = CryptoJS.enc.Utf8.parse(_decode('MTIzNDU2Nzg5MDEyMzQ1Ng=='));

	const _b = CryptoJS.enc.Base64.parse(word);
	const _s = CryptoJS.enc.Base64.stringify(_b);
	const _d = CryptoJS.AES.decrypt(_s, _k_raw, {
		iv: _i_raw,
		mode: CryptoJS.mode.CBC,
		padding: CryptoJS.pad.Pkcs7,
	});

	const _r = CryptoJS.enc.Utf8.stringify(_d).toString();
	return JSON.parse(JSON.parse(_r));
}

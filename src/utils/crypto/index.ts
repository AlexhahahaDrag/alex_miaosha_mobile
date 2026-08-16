import { AES, Utf8, Base64, CBC, Pkcs7 } from 'crypto-es';

const _decode = (str: string) => Base64.parse(str).toString(Utf8);

export function decrypt(word: string) {
	const _k_raw = Utf8.parse(_decode('MjAyMzA2MTBIZWxsb0RvZw=='));
	const _i_raw = Utf8.parse(_decode('MTIzNDU2Nzg5MDEyMzQ1Ng=='));

	const _b = Base64.parse(word);
	const _s = Base64.stringify(_b);
	const _d = AES.decrypt(_s, _k_raw, {
		iv: _i_raw,
		mode: CBC,
		padding: Pkcs7,
	});

	const _r = Utf8.stringify(_d).toString();
	return JSON.parse(JSON.parse(_r));
}

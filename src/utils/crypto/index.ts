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
	const parsed = JSON.parse(_r);
	return typeof parsed === 'string' ? JSON.parse(parsed) : parsed;
}

export function encrypt(word: unknown) {
	const _k_raw = Utf8.parse(_decode('MjAyMzA2MTBIZWxsb0RvZw=='));
	const _i_raw = Utf8.parse(_decode('MTIzNDU2Nzg5MDEyMzQ1Ng=='));

	const src = Utf8.parse(JSON.stringify(word));
	const encrypted = AES.encrypt(src, _k_raw, {
		iv: _i_raw,
		mode: CBC,
		padding: Pkcs7,
	});
	return encrypted.toString();
}

// ==========================================
// AES-GCM (v2.0 AEAD) 硬件加速实现 (Web Crypto API)
// ==========================================
const IV_LENGTH = 12;
const DEFAULT_KEY = '20230610HelloDog';
const keyCache = new Map<string, Promise<CryptoKey>>();

function getSubtle(): SubtleCrypto {
	const subtle = (typeof window !== 'undefined' ? window.crypto : globalThis.crypto)?.subtle;
	if (!subtle) {
		throw new Error('Web Crypto API (crypto.subtle) is not supported in this environment');
	}
	return subtle;
}

function getCrypto(): Crypto {
	const cryptoObj = typeof window !== 'undefined' ? window.crypto : globalThis.crypto;
	if (!cryptoObj) {
		throw new Error('Web Crypto API is not supported in this environment');
	}
	return cryptoObj;
}

function base64ToUint8Array(base64Str: string): Uint8Array {
	if (typeof atob === 'function') {
		const binary = atob(base64Str);
		const bytes = new Uint8Array(binary.length);
		for (let i = 0; i < binary.length; i++) {
			bytes[i] = binary.charCodeAt(i);
		}
		return bytes;
	}
	const globalBuf = (globalThis as { Buffer?: { from: (str: string, enc: string) => Uint8Array } }).Buffer;
	if (globalBuf) {
		return new Uint8Array(globalBuf.from(base64Str, 'base64'));
	}
	throw new Error('Base64 decode is not supported in current environment');
}

function uint8ArrayToBase64(bytes: Uint8Array): string {
	if (typeof btoa === 'function') {
		let binary = '';
		for (let i = 0; i < bytes.byteLength; i++) {
			binary += String.fromCharCode(bytes[i]);
		}
		return btoa(binary);
	}
	const globalBuf = (globalThis as { Buffer?: { from: (arr: Uint8Array) => { toString: (enc: string) => string } } }).Buffer;
	if (globalBuf) {
		return globalBuf.from(bytes).toString('base64');
	}
	throw new Error('Base64 encode is not supported in current environment');
}

function getCryptoKey(rawKey: string): Promise<CryptoKey> {
	let promise = keyCache.get(rawKey);
	if (!promise) {
		const subtle = getSubtle();
		const enc = new TextEncoder();
		promise = subtle.importKey(
			'raw',
			enc.encode(rawKey),
			{ name: 'AES-GCM' },
			false,
			['decrypt', 'encrypt'],
		);
		keyCache.set(rawKey, promise);
	}
	return promise;
}

/**
 * AES-GCM (v2.0) 解密
 */
export async function decryptGcm(
	base64Payload: string | null | undefined,
	rawKey: string = DEFAULT_KEY,
): Promise<any> {
	if (!base64Payload) {
		return null;
	}
	const subtle = getSubtle();
	const data = base64ToUint8Array(base64Payload);
	if (data.length < IV_LENGTH + 16) {
		throw new Error('Invalid GCM payload: length shorter than IV (12B) + Tag (16B)');
	}

	const gcmIv = data.slice(0, IV_LENGTH);
	const ciphertextWithTag = data.slice(IV_LENGTH);

	const cryptoKey = await getCryptoKey(rawKey);
	const decryptedBuffer = await subtle.decrypt(
		{ name: 'AES-GCM', iv: gcmIv, tagLength: 128 },
		cryptoKey,
		ciphertextWithTag,
	);

	const decodedStr = new TextDecoder('utf-8').decode(decryptedBuffer);
	const parsed = JSON.parse(decodedStr);
	return typeof parsed === 'string' ? JSON.parse(parsed) : parsed;
}

/**
 * AES-GCM (v2.0) 加密
 */
export async function encryptGcm(
	payload: unknown,
	rawKey: string = DEFAULT_KEY,
): Promise<string> {
	const subtle = getSubtle();
	const cryptoObj = getCrypto();

	const gcmIv = new Uint8Array(IV_LENGTH);
	cryptoObj.getRandomValues(gcmIv);

	const cryptoKey = await getCryptoKey(rawKey);
	const enc = new TextEncoder();
	const jsonStr = JSON.stringify(payload);
	const plaintextBytes = enc.encode(JSON.stringify(jsonStr));

	const encryptedBuffer = await subtle.encrypt(
		{ name: 'AES-GCM', iv: gcmIv, tagLength: 128 },
		cryptoKey,
		plaintextBytes,
	);
	const encryptedBytes = new Uint8Array(encryptedBuffer);

	const combined = new Uint8Array(gcmIv.length + encryptedBytes.length);
	combined.set(gcmIv, 0);
	combined.set(encryptedBytes, gcmIv.length);

	return uint8ArrayToBase64(combined);
}


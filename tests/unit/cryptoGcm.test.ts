import { describe, expect, it } from 'vitest';
import { decrypt, encrypt, decryptGcm, encryptGcm } from '@/utils/crypto';

describe('移动端 AES-GCM (v2.0) 与 CBC 加解密契约测试', () => {
	const TEST_KEY = '20230610HelloDog';

	it('GCM 加密与解密对象数据成功还原', async () => {
		const payload = {
			code: 200,
			message: 'success',
			data: { mobileUserId: '987654321', role: 'mobile_user' },
		};

		const encrypted = await encryptGcm(payload, TEST_KEY);
		expect(encrypted).toBeDefined();
		expect(encrypted).not.toBe(JSON.stringify(payload));

		const decrypted = await decryptGcm(encrypted, TEST_KEY);
		expect(decrypted).toEqual(payload);
	});

	it('相同明文多次加密因随机 12B IV 而产生不同密文', async () => {
		const payload = { event: 'gift_record_add' };
		const cipher1 = await encryptGcm(payload, TEST_KEY);
		const cipher2 = await encryptGcm(payload, TEST_KEY);

		expect(cipher1).not.toBe(cipher2);
		expect(await decryptGcm(cipher1, TEST_KEY)).toEqual(payload);
		expect(await decryptGcm(cipher2, TEST_KEY)).toEqual(payload);
	});

	it('密文被恶意篡改时解密失败', async () => {
		const payload = { amount: 888 };
		const encrypted = await encryptGcm(payload, TEST_KEY);

		const buffer = Buffer.from(encrypted, 'base64');
		buffer[buffer.length - 5] ^= 0x55;
		const tampered = buffer.toString('base64');

		await expect(decryptGcm(tampered, TEST_KEY)).rejects.toThrow();
	});

	it('空数据或非法长度抛出异常或安全返回', async () => {
		expect(await decryptGcm(null, TEST_KEY)).toBeNull();
		expect(await decryptGcm('', TEST_KEY)).toBeNull();

		const shortBase64 = Buffer.from(new Uint8Array(10)).toString('base64');
		await expect(decryptGcm(shortBase64, TEST_KEY)).rejects.toThrow();
	});

	it('保持向后兼容：现有 CBC decrypt 和 encrypt 正常运行', () => {
		const testData = { userId: 'mobile_100', name: 'tester' };
		const cipher = encrypt(testData);
		const plain = decrypt(cipher);
		expect(plain).toEqual(testData);
	});
});

export interface FileInfoData {
	id?: number | string;
	name?: string;
	type?: string;
	url?: string;
	[key: string]: unknown;
}

export type FileInfoFormData = FileInfoData | FormData;

export interface FileInfoData {
	id?: string;
	name?: string;
	type?: string;
	url?: string;
	[key: string]: unknown;
}

export type FileInfoFormData = FileInfoData | FormData;

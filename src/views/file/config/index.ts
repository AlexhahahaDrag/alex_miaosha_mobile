export interface FileInfoData {
	id?: string;
	name?: string;
	type?: string;
	url?: string;
	preUrl?: string;
	preThumbnailUrl?: string;
	[key: string]: unknown;
}

export type FileInfoFormData = FileInfoData | FormData;

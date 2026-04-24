export interface OrgInfoData {
	id?: number;
	orgCode?: string;
	orgName?: string;
	orgAlias?: string;
	orgShortName?: string;
	parentId?: number;
	parentName?: string;
	parentOrgName?: string;
	summary?: string;
	status?: string | number;
	[key: string]: unknown;
}

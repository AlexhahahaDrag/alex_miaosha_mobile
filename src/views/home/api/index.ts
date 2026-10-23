import { getData, baseService } from '@/views/common/api';
import type { ResponseBody } from '@/types/api';

export interface MicroServiceHealthData {
	serviceId: string;
	name: string;
	port: number;
	status: 'UP' | 'DOWN' | 'DEGRADED';
	latency: number;
	lastCheckTime?: string;
}

export interface OrgAdminDashboardData {
	orgId: string;
	orgName: string;
	memberCount: number;
	roleCount: number;
	adminName: string;
}

/**
 * 实时探测微服务集群在线状态与时延
 */
export function getMicroServicesHealth(): Promise<ResponseBody<MicroServiceHealthData[]>> {
	return getData(`${baseService.user}/dashboard/services/health`);
}

/**
 * 获取机构/家庭管理员工作台概览
 */
export function getOrgAdminDashboard(): Promise<ResponseBody<OrgAdminDashboardData>> {
	return getData(`${baseService.user}/dashboard/org/overview`);
}

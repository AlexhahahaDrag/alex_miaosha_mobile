import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	getMicroServicesHealth,
	getOrgAdminDashboard,
	type MicroServiceHealthData,
	type OrgAdminDashboardData,
} from '@/views/home/api';
import * as commonApi from '@/views/common/api';

// 隔离 Node 单测环境下对路由及 .vue 布局组件的级联解析
vi.mock('@/router', () => ({
	routes: [],
	router: { push: vi.fn(), replace: vi.fn() },
}));

describe('移动端 Dashboard 聚合与微服务在线探针契约测试', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	it('getMicroServicesHealth 应正确返回微服务节点列表且统计 UP 数量', async () => {
		const mockServices: MicroServiceHealthData[] = [
			{
				serviceId: 'alex-gateway',
				name: 'Spring Cloud 统一网关',
				port: 30001,
				status: 'UP',
				latency: 12,
			},
			{
				serviceId: 'alex-user-dev',
				name: '用户微服务',
				port: 30006,
				status: 'UP',
				latency: 1,
			},
			{
				serviceId: 'alex-finance-dev',
				name: '财务微服务',
				port: 30008,
				status: 'UP',
				latency: 15,
			},
			{
				serviceId: 'alex-ai-dev',
				name: 'AI 微服务',
				port: 30010,
				status: 'DEGRADED',
				latency: 18,
			},
		];

		vi.spyOn(commonApi, 'getData').mockResolvedValue({
			code: '200',
			data: mockServices,
			message: 'success',
		});

		const { code, data } = await getMicroServicesHealth();
		expect(code).toBe('200');
		expect(Array.isArray(data)).toBe(true);
		expect(data?.length).toBe(4);

		const upCount = data?.filter((s) => s.status === 'UP').length;
		expect(upCount).toBe(3);
	});

	it('getOrgAdminDashboard 应正确返回机构大盘且 orgId 保持 string 格式', async () => {
		const mockOrg: OrgAdminDashboardData = {
			orgId: '3001',
			orgName: '幸福一家人',
			memberCount: 8,
			roleCount: 2,
			adminName: '家庭主管',
		};

		vi.spyOn(commonApi, 'getData').mockResolvedValue({
			code: '200',
			data: mockOrg,
			message: 'success',
		});

		const { code, data } = await getOrgAdminDashboard();
		expect(code).toBe('200');
		expect(data?.orgId).toBe('3001');
		expect(typeof data?.orgId).toBe('string');
		expect(data?.memberCount).toBe(8);
		expect(data?.orgName).toBe('幸福一家人');
	});
});

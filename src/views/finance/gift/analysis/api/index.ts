import { getData, baseService } from '@/views/common/api';
import type { ResponseBody } from '@/types/api';
import type { GiftAnalysisOverview } from '@/views/finance/gift/config';

const baseUrl = () => `${baseService.finance}/gift-analysis`;

/** 统计总览：金额/笔数均由后端按当前用户数据权限全量聚合，避免前端分页截断误差 */
export const getGiftAnalysisOverview = (): Promise<ResponseBody<GiftAnalysisOverview>> =>
	getData(`${baseUrl()}/overview`);

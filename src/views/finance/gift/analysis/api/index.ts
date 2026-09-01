import { getData, baseService } from '@/views/common/api';
import type { ResponseBody } from '@/types/api';
import type {
	GiftAnalysisOverview,
	GiftAmountTrend,
	GiftRankingItem,
	GiftRelationDistribution,
} from '@/views/finance/gift/config';

const baseUrl = () => `${baseService.finance}/gift-analysis`;

/** 统计总览：金额/笔数均由后端按当前用户数据权限全量聚合，避免前端分页截断误差 */
export const getGiftAnalysisOverview = (): Promise<ResponseBody<GiftAnalysisOverview>> =>
	getData(`${baseUrl()}/overview`);

/** 收支趋势 */
export const getGiftAnalysisTrend = (): Promise<ResponseBody<GiftAmountTrend[]>> =>
	getData(`${baseUrl()}/trend`);

/** 关系分布 */
export const getGiftAnalysisRelationDistribution = (): Promise<
	ResponseBody<GiftRelationDistribution[]>
> => getData(`${baseUrl()}/relation-distribution`);

/** 事由排行 */
export const getGiftAnalysisEventRanking = (): Promise<ResponseBody<GiftRankingItem[]>> =>
	getData(`${baseUrl()}/event-ranking`);

/** 联系人排行 */
export const getGiftAnalysisPersonRanking = (): Promise<ResponseBody<GiftRankingItem[]>> =>
	getData(`${baseUrl()}/person-ranking`);

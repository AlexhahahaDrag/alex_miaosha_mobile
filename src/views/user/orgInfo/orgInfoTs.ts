export interface SearchInfo {
	orgCode?: string;
	orgName?: string;
	orgShortName?: string;
	parentId?: string;
	summary?: string;
	status?: string;
}

export interface DataItem {
	orgCode: string;
	orgName: string;
	orgShortName: string;
	parentId: string;
	summary: string;
	status: string;
}

export interface OrgTreeOption {
	id: string;
	/** 带层级缩进，供 picker 列展示 */
	orgName: string;
	/** 不含缩进的原始机构名称，供选中后回填输入框 */
	rawName: string;
	depth: number;
}

/**
 * 将后端返回的机构树（children 已按 parentId 组装）打平为带缩进的一维列表，
 * 供 van-picker 单列选择使用，避免前端再用 page(1,1000) 拼树。
 */
export function flattenOrgTree(
	nodes: Array<{ id?: string; orgName?: string; children?: unknown[] }> | undefined,
	depth = 0,
): OrgTreeOption[] {
	if (!nodes?.length) {
		return [];
	}
	const result: OrgTreeOption[] = [];
	nodes.forEach((node) => {
		if (!node?.id) {
			return;
		}
		const indent = depth > 0 ? `${'　'.repeat(depth)}└ ` : '';
		const rawName = node.orgName || '';
		result.push({ id: node.id, orgName: `${indent}${rawName}`, rawName, depth });
		result.push(...flattenOrgTree(node.children as typeof nodes, depth + 1));
	});
	return result;
}

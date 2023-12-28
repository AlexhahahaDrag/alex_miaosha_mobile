import { ref } from 'vue';
export interface SearchInfo {
  attrName?: string;
  searchType?: number;
  icon?: string;
  valueSelect?: string;
  attrType?: number;
  enable?: number;
  catelogId?: number;
  showDesc?: number;
}

export interface pageInfo {
  current?: number;
  pageSize?: number;
  total?: number;
  showTotal: Function;
  showSizeChanger: boolean;
  pageSizeOptions: string[];
  showSizeChange: Function;
  size: string;
  showQuickJumper: boolean;
  defaultPageSize: number;
}

export let pagination = ref<pageInfo>({
  // 数据总数
  total: 0,
  // 当前页数
  current: 1,
  // 每页条数
  pageSize: 10,
  // 展示总数
  showTotal: (total: number) => `共 ${total} 条`,
  // 是否可以改变pageSize
  showSizeChanger: true,
  // 设置每页可以展示多少条的选项
  pageSizeOptions: ['10', '20', '50', '100'],
  // 改变pageSize后触发
  showSizeChange: (current: number, pageSize: any) => (
    (pagination.value.current = current), (pagination.value.pageSize = pageSize)
  ),
  // 小尺寸分页
  size: 'small',
  // 是否可以快速跳转至某页
  showQuickJumper: true,
  //默认条数
  defaultPageSize: 10,
});

export const columns = [
  {
    title: '属性名',
    dataIndex: 'attrName',
    key: 'attrName',
  },
  {
    title: '是否需要检索[0-不需要，1-需要]',
    dataIndex: 'searchType',
    key: 'searchType',
  },
  {
    title: '属性图标',
    dataIndex: 'icon',
    key: 'icon',
  },
  {
    title: '可选值列表[用逗号分隔]',
    dataIndex: 'valueSelect',
    key: 'valueSelect',
  },
  {
    title: '属性类型[0-销售属性，1-基本属性，2-既是销售属性又是基本属性]',
    dataIndex: 'attrType',
    key: 'attrType',
  },
  {
    title: '启用状态[0 - 禁用，1 - 启用]',
    dataIndex: 'enable',
    key: 'enable',
  },
  {
    title: '所属分类',
    dataIndex: 'catelogId',
    key: 'catelogId',
  },
  {
    title: '快速展示【是否展示在介绍上；0-否 1-是】，在sku中仍然可以调整',
    dataIndex: 'showDesc',
    key: 'showDesc',
  },
  {
    title: '操作',
    key: 'operation',
    fixed: 'right',
    width: '8',
  },
];


export interface DataItem {
  attrName: string;
  searchType: number;
  icon: string;
  valueSelect: string;
  attrType: number;
  enable: number;
  catelogId: number;
  showDesc: number;
}

export interface ModelInfo {
  title?: string;
  width?: string;
  id?: number | undefined;
  confirmLoading?: boolean;
}

export interface dictInfo {
  typeCode?: string | number | undefined,
  typeName?: string | undefined,
}
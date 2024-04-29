import { Dayjs } from 'dayjs';
export interface SearchInfo {
  shopName?: string;
  shopCode?: string;
  costAmount?: number;
  saleAmount?: number;
  isValid?: string;
  saleDate?: Dayjs | string;
  category?: string;
  purchasePlace?: string;
  saleNum?: number;
  title?: string | null;
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
    title: '商品名称',
    dataIndex: 'shopName',
    key: 'shopName',
  },
  {
    title: '商品编码',
    dataIndex: 'shopCode',
    key: 'shopCode',
  },
  {
    title: '成本价',
    dataIndex: 'costAmount',
    key: 'costAmount',
  },
  {
    title: '零售价',
    dataIndex: 'saleAmount',
    key: 'saleAmount',
  },
  {
    title: '状态',
    dataIndex: 'isValid',
    key: 'isValid',
  },
  {
    title: '进货日期',
    dataIndex: 'saleDate',
    key: 'saleDate',
  },
  {
    title: '类别',
    dataIndex: 'category',
    key: 'category',
  },
  {
    title: '进货地点',
    dataIndex: 'purchasePlace',
    key: 'purchasePlace',
  },
  {
    title: '数量',
    dataIndex: 'saleNum',
    key: 'saleNum',
  },
  {
    title: '操作',
    key: 'operation',
    fixed: 'right',
    width: '8',
  },
];

export interface ShopStockInfo {
  id?: number;
  shopName?: string;
  oldShopCode?: string;
  shopCode?: string;
  costAmount?: number;
  saleAmount?: number;
  isValid?: string;
  saleDate?: Dayjs | string;
  category?: string;
  purchasePlace?: string;
  saleNum?: number;
  checked?: boolean;
  color?: string;
  size?: string;
  style?: string;
}

export interface ModelInfo {
  title?: string;
  width?: string;
  id?: number | undefined;
  confirmLoading?: boolean;
}

export interface dictInfo {
  typeCode?: string | number | undefined;
  typeName?: string | undefined;
}

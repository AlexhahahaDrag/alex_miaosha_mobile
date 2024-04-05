import { Dayjs } from 'dayjs';
export interface SearchInfo {
  shopId?: number;
  userId?: number;
  customerId?: number;
  isValid?: string;
  saleNum?: number;
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
    title: '商品id',
    dataIndex: 'shopId',
    key: 'shopId',
  },
  {
    title: '人员id',
    dataIndex: 'userId',
    key: 'userId',
  },
  {
    title: '客户id',
    dataIndex: 'customerId',
    key: 'customerId',
  },
  {
    title: '是否有效',
    dataIndex: 'isValid',
    key: 'isValid',
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


export interface DataItem {
  shopId: number;
  userId: number;
  customerId: number;
  isValid: string;
  saleNum: number;
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
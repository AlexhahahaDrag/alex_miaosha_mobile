import { getData, deleteData } from "@/api/common/index";

export function getSeckillList(params: any): Promise<any> {
  return getData("/api/blog/getList", params);
}

export function deleteBlogById(id: number) {
  return deleteData("/api/blog/delete?id=" + id);
}
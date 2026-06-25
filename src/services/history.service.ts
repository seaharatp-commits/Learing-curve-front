import type { HistoryItem } from "@/types/app/history";
import { getHistoryListApi } from "@/lib/api/api-main";

export const getHistoryList = async (): Promise<HistoryItem[]> => {
  const res = await getHistoryListApi();
  return res.data;
};

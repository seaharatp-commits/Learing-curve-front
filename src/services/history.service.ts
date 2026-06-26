import type { HistoryItem } from "@/types/app/history";
import { getHistoryListApi, deleteHistoryApi } from "@/lib/api/api-main";

export const getHistoryList = async (): Promise<HistoryItem[]> => {
  const res = await getHistoryListApi();
  return res.data;
};

export const deleteHistory = async (sessionId: string): Promise<{ success: boolean }> => {
  const res = await deleteHistoryApi(sessionId);
  return res.data;
};

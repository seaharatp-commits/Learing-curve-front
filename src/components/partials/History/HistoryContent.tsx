"use client";

import dayjs from "dayjs";
import { useHistoryList } from "@/hooks/history";
import { BaseCard } from "@/components/ui/Card";
import { MessageSquare } from "lucide-react";

export default function HistoryContent() {
  const { data, isLoading } = useHistoryList();

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-xl font-semibold">ประวัติการสนทนา</h1>
      {isLoading && <p className="text-default-400">กำลังโหลด...</p>}
      {!isLoading && data.length === 0 && (
        <p className="text-default-400">ยังไม่มีประวัติการสนทนา</p>
      )}
      <div className="space-y-3">
        {data.map((item) => (
          <BaseCard key={item.id}>
            <div className="flex items-start gap-3">
              <MessageSquare size={20} className="mt-1 text-primary" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{item.title}</h3>
                  <span className="text-xs text-default-400">
                    {dayjs(item.updatedAt).format("DD MMM YYYY HH:mm")}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-default-500">{item.lastMessage}</p>
                <p className="mt-1 text-xs text-default-400">{item.messageCount} ข้อความ</p>
              </div>
            </div>
          </BaseCard>
        ))}
      </div>
    </div>
  );
}

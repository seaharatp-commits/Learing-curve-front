"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useKnowledgeBaseList, useKnowledgeBaseMutations } from "@/hooks/knowledgeBase";
import { BaseButton } from "@/components/ui/Button";
import { BaseCard } from "@/components/ui/Card";
import { KnowledgeBaseModal, AddKnowledgeModal } from "./Modal";
import type { KnowledgeBaseItem } from "@/types/app/knowledgeBase";

export default function KnowledgeBaseContent() {
  const { data, isLoading } = useKnowledgeBaseList();
  const { deleteMutation } = useKnowledgeBaseMutations();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editing, setEditing] = useState<KnowledgeBaseItem | undefined>();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">จัดการฐานความรู้</h1>
        <BaseButton startContent={<Plus size={16} />} onPress={() => setIsAddOpen(true)}>
          เพิ่มความรู้
        </BaseButton>
      </div>

      {isLoading && <p className="text-default-400">กำลังโหลด...</p>}

      <div className="grid gap-3 md:grid-cols-2">
        {data.map((item) => (
          <BaseCard key={item.id}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs text-primary">
                  {item.category}
                </span>
                <h3 className="mt-2 font-medium">{item.title}</h3>
                <p className="mt-1 line-clamp-3 text-sm text-default-500">{item.content}</p>
              </div>
              <div className="flex flex-col gap-1">
                <BaseButton isIconOnly size="sm" variant="light" onPress={() => setEditing(item)}>
                  <Pencil size={14} />
                </BaseButton>
                <BaseButton
                  isIconOnly
                  size="sm"
                  variant="light"
                  color="danger"
                  onPress={() => deleteMutation.mutate(item.id)}
                >
                  <Trash2 size={14} />
                </BaseButton>
              </div>
            </div>
          </BaseCard>
        ))}
      </div>

      <AddKnowledgeModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
      <KnowledgeBaseModal isOpen={!!editing} data={editing} onClose={() => setEditing(undefined)} />
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/react";
import { Plus, Pencil, Trash2, Search, BookOpen } from "lucide-react";
import { useKnowledgeBaseList, useKnowledgeBaseMutations } from "@/hooks/knowledgeBase";
import { BaseInput } from "@/components/ui/Input";
import { BaseButton } from "@/components/ui/Button";
import { BaseCard } from "@/components/ui/Card";
import { KnowledgeBaseModal, AddKnowledgeModal } from "./Modal";
import type { KnowledgeBaseItem } from "@/types/app/knowledgeBase";
import { extractErrorMessage as getErrorMessage } from "@/utils/extractErrorMessage";

const ITEMS_PER_PAGE = 6;

function getCompactPageItems(currentPage: number, totalPages: number) {
  if (totalPages <= 5) return Array.from({ length: totalPages }, (_, index) => index + 1);

  const pages: Array<number | "start-ellipsis" | "end-ellipsis"> = [1];
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  if (start > 2) pages.push("start-ellipsis");
  for (let page = start; page <= end; page += 1) pages.push(page);
  if (end < totalPages - 1) pages.push("end-ellipsis");
  pages.push(totalPages);

  return pages;
}

export default function KnowledgeBaseContent() {
  const { data, isLoading, isError, error, refetch } = useKnowledgeBaseList();
  const { deleteMutation } = useKnowledgeBaseMutations();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editing, setEditing] = useState<KnowledgeBaseItem | undefined>();
  const [deleting, setDeleting] = useState<KnowledgeBaseItem | null>(null);
  const [pageMessage, setPageMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortMode, setSortMode] = useState<"updated-desc" | "created-desc" | "created-asc" | "title-asc">("updated-desc");
  const [currentPage, setCurrentPage] = useState(1);

  const categories = Array.from(new Set(data.map((item) => item.category).filter(Boolean))).sort((a, b) =>
    a.localeCompare(b),
  );
  const normalizedSearch = searchQuery.trim().toLowerCase();
  const visibleItems = data
    .filter((item) => {
      const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
      if (!matchesCategory) return false;
      if (!normalizedSearch) return true;

      const searchableText = [
        item.title,
        item.category,
        item.content,
        item.summary ?? "",
        ...(item.keywords ?? []),
        ...(item.tags ?? []),
      ]
        .join(" ")
        .toLowerCase();
      return searchableText.includes(normalizedSearch);
    })
    .sort((a, b) => {
      if (sortMode === "title-asc") return a.title.localeCompare(b.title);
      if (sortMode === "created-asc") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortMode === "created-desc") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  const totalPages = Math.max(1, Math.ceil(visibleItems.length / ITEMS_PER_PAGE));
  const pageItems = visibleItems.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const compactPageItems = getCompactPageItems(currentPage, totalPages);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, sortMode]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const handleConfirmDelete = () => {
    if (!deleting) return;
    setPageMessage(null);
    deleteMutation.mutate(deleting.id, {
      onSuccess: () => {
        setPageMessage({ text: `ลบข้อมูล "${deleting.title}" สำเร็จแล้ว`, isError: false });
        setDeleting(null);
      },
      onError: (error) => {
        setPageMessage({
          text: getErrorMessage(error, "ลบข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง"),
          isError: true,
        });
        setDeleting(null);
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">จัดการฐานความรู้</h1>
        <BaseButton startContent={<Plus size={16} />} onPress={() => setIsAddOpen(true)}>
          เพิ่มความรู้
        </BaseButton>
      </div>

      {pageMessage && (
        <div
          className={`rounded-lg border px-3 py-2 text-sm ${
            pageMessage.isError
              ? "border-danger-300 bg-danger-50 text-danger-700"
              : "border-success-300 bg-success-50 text-success-700"
          }`}
        >
          {pageMessage.text}
        </div>
      )}

      <BaseCard className="space-y-3">
        <div className="grid gap-3 md:grid-cols-[1fr_180px_180px]">
          <BaseInput
            value={searchQuery}
            onValueChange={setSearchQuery}
            placeholder="ค้นหาจากหัวข้อ หมวดหมู่ keywords tags หรือเนื้อหา"
            startContent={<Search size={16} className="text-default-400" />}
          />
          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className="h-10 rounded-lg border border-default-200 bg-background px-3 text-sm text-default-700 outline-none"
          >
            <option value="all">ทุกหมวดหมู่</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <select
            value={sortMode}
            onChange={(event) => setSortMode(event.target.value as typeof sortMode)}
            className="h-10 rounded-lg border border-default-200 bg-background px-3 text-sm text-default-700 outline-none"
          >
            <option value="updated-desc">อัปเดตล่าสุด</option>
            <option value="created-desc">ใหม่สุดก่อน</option>
            <option value="created-asc">เก่าสุดก่อน</option>
            <option value="title-asc">ชื่อ A-Z</option>
          </select>
        </div>
      </BaseCard>

      {isLoading && (
        <BaseCard>
          <div className="flex items-center gap-3 text-default-500">
            <BookOpen size={20} className="text-primary" />
            <p className="text-sm">กำลังโหลดข้อมูลฐานความรู้...</p>
          </div>
        </BaseCard>
      )}

      {isError && (
        <BaseCard className="space-y-3">
          <p className="text-sm text-danger-600">
            {getErrorMessage(error, "โหลดข้อมูลฐานความรู้ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง")}
          </p>
          <BaseButton size="sm" variant="flat" onPress={() => void refetch()}>
            ลองอีกครั้ง
          </BaseButton>
        </BaseCard>
      )}

      {!isLoading && !isError && data.length === 0 && (
        <BaseCard>
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <BookOpen size={28} className="text-primary" />
            <h2 className="text-lg font-semibold">ยังไม่มีข้อมูลในฐานความรู้</h2>
            <p className="max-w-md text-sm text-default-500">
              เพิ่มข้อมูลแรกเพื่อให้ AI Chat สามารถนำไปใช้ตอบคำถามได้
            </p>
            <BaseButton className="mt-2" startContent={<Plus size={16} />} onPress={() => setIsAddOpen(true)}>
              เพิ่มความรู้
            </BaseButton>
          </div>
        </BaseCard>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        {!isLoading && !isError && data.length > 0 && visibleItems.length === 0 && (
          <BaseCard className="md:col-span-2">
            <p className="py-6 text-center text-sm text-default-500">
              ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหา
            </p>
          </BaseCard>
        )}
        {!isError && pageItems.map((item) => (
          <BaseCard key={item.id}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs text-primary">
                  {item.category}
                </span>
                <h3 className="mt-2 font-medium">{item.title}</h3>
                {item.summary && (
                  <p className="mt-1 line-clamp-2 text-sm text-default-600">{item.summary}</p>
                )}
                <p className="mt-1 line-clamp-3 text-sm text-default-500">{item.content}</p>
                {((item.keywords?.length ?? 0) > 0 || (item.tags?.length ?? 0) > 0) && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {[...(item.keywords ?? []), ...(item.tags ?? [])].slice(0, 6).map((label, index) => (
                      <span
                        key={`${item.id}-${label}-${index}`}
                        className="rounded-full bg-default-100 px-2 py-0.5 text-xs text-default-500"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                )}
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
                  onPress={() => setDeleting(item)}
                >
                  <Trash2 size={14} />
                </BaseButton>
              </div>
            </div>
          </BaseCard>
        ))}
      </div>

      {!isLoading && !isError && visibleItems.length > ITEMS_PER_PAGE && (
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          <BaseButton
            size="sm"
            radius="sm"
            variant="flat"
            className="h-7 min-w-0 rounded-md bg-default-100 px-2.5 text-xs font-medium text-default-600 disabled:opacity-50"
            isDisabled={currentPage === 1}
            onPress={() => setCurrentPage((page) => Math.max(1, page - 1))}
          >
            ก่อนหน้า
          </BaseButton>
          {compactPageItems.map((page) =>
            typeof page === "number" ? (
              <BaseButton
                key={page}
                size="sm"
                radius="sm"
                variant={page === currentPage ? "solid" : "flat"}
                color={page === currentPage ? "primary" : "default"}
                className={`h-7 min-w-7 rounded-md px-2 text-xs font-semibold shadow-none ${
                  page === currentPage ? "text-white" : "bg-default-100 text-default-600"
                }`}
                onPress={() => setCurrentPage(page)}
              >
                {page}
              </BaseButton>
            ) : (
              <span key={page} className="px-1 text-sm text-default-400">
                ...
              </span>
            ),
          )}
          <BaseButton
            size="sm"
            radius="sm"
            variant="flat"
            className="h-7 min-w-0 rounded-md bg-default-100 px-2.5 text-xs font-medium text-default-600 disabled:opacity-50"
            isDisabled={currentPage === totalPages}
            onPress={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
          >
            ถัดไป
          </BaseButton>
        </div>
      )}

      <AddKnowledgeModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSaved={() => setPageMessage({ text: "บันทึกข้อมูลฐานความรู้สำเร็จแล้ว", isError: false })}
      />
      <KnowledgeBaseModal
        isOpen={!!editing}
        data={editing}
        onClose={() => setEditing(undefined)}
        onSaved={(title) => setPageMessage({ text: `บันทึก "${title}" สำเร็จแล้ว`, isError: false })}
      />
      <Modal isOpen={!!deleting} onClose={() => setDeleting(null)}>
        <ModalContent>
          <ModalHeader>ยืนยันการลบข้อมูล</ModalHeader>
          <ModalBody>
            <p className="text-sm text-default-600">
              คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลนี้? การลบนี้ไม่สามารถย้อนกลับได้
            </p>
            {deleting && <p className="font-medium">{deleting.title}</p>}
          </ModalBody>
          <ModalFooter>
            <BaseButton variant="light" onPress={() => setDeleting(null)}>
              ยกเลิก
            </BaseButton>
            <BaseButton color="danger" isLoading={deleteMutation.isPending} onPress={handleConfirmDelete}>
              ลบข้อมูล
            </BaseButton>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

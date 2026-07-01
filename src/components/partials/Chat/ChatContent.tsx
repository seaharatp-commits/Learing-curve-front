"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import type { ChatMessage } from "@/types/app/chat";
import type { RecommendationResult } from "@/types/app/knowledgeBase";
import { useSendMessage, useSessionMessages } from "@/hooks/chat";
import { useRecommendations } from "@/hooks/knowledgeBase";
import { BaseInput } from "@/components/ui/Input";
import { BaseButton } from "@/components/ui/Button";
import { BaseCard } from "@/components/ui/Card";
import { Send, Bot, User, BookOpen } from "lucide-react";

export default function ChatContent() {
  const searchParams = useSearchParams();
  const initialSessionId = searchParams.get("sessionId") ?? undefined;

  const [sessionId, setSessionId] = useState<string | undefined>(initialSessionId);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [pendingQuestion, setPendingQuestion] = useState("");
  const [knowledgeChoices, setKnowledgeChoices] = useState<RecommendationResult[]>([]);
  const [pendingMessageIds, setPendingMessageIds] = useState<string[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { mutateAsync, isPending } = useSendMessage();
  const recommendationsMutation = useRecommendations();
  const { data: history, isLoading: isHistoryLoading } = useSessionMessages(initialSessionId);

  useEffect(() => {
    if (initialSessionId && history.length > 0) {
      setMessages(history);
    }
  }, [initialSessionId, history]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const createLocalMessage = (role: ChatMessage["role"], content: string): ChatMessage => ({
    id: `local-${role}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    sessionId: sessionId ?? "pending",
    role,
    content,
    createdAt: new Date().toISOString(),
  });

  const sendToAi = async (
    content: string,
    knowledgeBaseArticleId?: string,
    knowledgeBaseConfidenceScore?: number,
  ) => {
    const result = await mutateAsync({
      sessionId,
      content,
      knowledgeBaseArticleId,
      knowledgeBaseConfidenceScore,
    });
    setSessionId(result.session.id);
    setMessages((prev) => [...prev, ...result.messages]);
  };

  const handleSend = async () => {
    const content = input.trim();
    if (!content) return;
    if (knowledgeChoices.length > 0) return;
    setInput("");
    setPendingQuestion("");
    setKnowledgeChoices([]);
    setPendingMessageIds([]);
    const userMessage = createLocalMessage("user", content);
    setMessages((prev) => [...prev, userMessage]);

    const matches = await recommendationsMutation.mutateAsync({
      title: content,
      description: content,
    });

    if (matches.length > 0) {
      const pendingMessage = createLocalMessage(
        "assistant",
        "พบข้อมูลที่เกี่ยวข้องในฐานความรู้ กรุณาเลือกข้อมูลที่ตรงกับคำถาม",
      );
      setPendingQuestion(content);
      setKnowledgeChoices(matches);
      setPendingMessageIds([userMessage.id, pendingMessage.id]);
      setMessages((prev) => [...prev, pendingMessage]);
      return;
    }

    setMessages((prev) => prev.filter((message) => message.id !== userMessage.id));
    await sendToAi(content);
  };

  const handleSelectKnowledge = async (choice?: RecommendationResult) => {
    if (!pendingQuestion) return;
    const content = pendingQuestion;
    setPendingQuestion("");
    setKnowledgeChoices([]);
    setMessages((prev) => prev.filter((message) => !pendingMessageIds.includes(message.id)));
    setPendingMessageIds([]);
    await sendToAi(content, choice?.articleId, choice?.confidenceScore);
  };

  const isBusy = isPending || recommendationsMutation.isPending;

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-3xl flex-col gap-4">
      <h1 className="text-xl font-semibold">แชทกับ AI ผู้ช่วยแก้ปัญหา</h1>
      <BaseCard className="flex-1 overflow-y-auto p-2">
        <div className="flex flex-col gap-3">
          {isHistoryLoading && (
            <p className="text-center text-sm text-default-400">กำลังโหลดบทสนทนา...</p>
          )}
          {!isHistoryLoading && messages.length === 0 && (
            <p className="text-center text-sm text-default-400">
              พิมพ์ปัญหาของคุณเพื่อเริ่มสนทนากับ AI
            </p>
          )}
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.role === "assistant" && <Bot size={20} className="mt-1 text-primary" />}
              <div
                className={`max-w-[75%] rounded-xl px-4 py-2 text-sm ${
                  m.role === "user" ? "bg-primary text-primary-foreground" : "bg-default-100"
                }`}
              >
                {m.content}
              </div>
              {m.role === "user" && <User size={20} className="mt-1 text-default-400" />}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </BaseCard>
      {knowledgeChoices.length > 0 && (
        <BaseCard className="space-y-3 border-primary/30 bg-primary/5">
          <div className="flex items-start gap-2">
            <BookOpen size={18} className="mt-0.5 text-primary" />
            <div>
              <p className="text-sm font-semibold">พบข้อมูลที่เกี่ยวข้องในฐานความรู้</p>
              <p className="text-xs text-default-500">
                เลือกข้อมูลที่ตรงกับคำถาม เพื่อให้ AI ใช้เป็นบริบทหลักในการตอบ
              </p>
            </div>
          </div>
          <div className="grid gap-2">
            {knowledgeChoices.map((choice) => (
              <button
                key={choice.articleId}
                type="button"
                disabled={isBusy}
                onClick={() => handleSelectKnowledge(choice)}
                className="rounded-lg border border-default-200 bg-background/60 px-3 py-2 text-left transition-colors hover:border-primary hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{choice.title}</p>
                  <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                    {Math.round(choice.confidenceScore * 100)}%
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-default-500">
                  {choice.preview || choice.summary || choice.resolution || choice.explanation}
                </p>
              </button>
            ))}
            <button
              type="button"
              disabled={isBusy}
              onClick={() => handleSelectKnowledge()}
              className="rounded-lg border border-default-200 px-3 py-2 text-left text-sm text-default-600 transition-colors hover:bg-default-100/70 disabled:cursor-not-allowed disabled:opacity-60"
            >
              ไม่ตรงกับสิ่งที่ถาม ให้ AI ตอบตามปกติ
            </button>
          </div>
        </BaseCard>
      )}
      <div className="flex gap-2">
        <BaseInput
          value={input}
          onValueChange={setInput}
          placeholder="พิมพ์ข้อความที่นี่..."
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
          className="flex-1"
        />
        <BaseButton isIconOnly isLoading={isBusy} onPress={handleSend}>
          <Send size={18} />
        </BaseButton>
      </div>
    </div>
  );
}

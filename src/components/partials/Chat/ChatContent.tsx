"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { ChatMessage } from "@/types/app/chat";
import type { RecommendationResult } from "@/types/app/knowledgeBase";
import { useSendMessage, useSessionMessages } from "@/hooks/chat";
import { useRecommendations } from "@/hooks/knowledgeBase";
import { BaseInput } from "@/components/ui/Input";
import { BaseButton } from "@/components/ui/Button";
import { BaseCard } from "@/components/ui/Card";
import { FormattedAnswer } from "@/components/common/FormattedAnswer";
import { Send, Bot, User, BookOpen, PlusCircle } from "lucide-react";

type ActiveKnowledgeContext = Pick<
  RecommendationResult,
  "articleId" | "title" | "category" | "preview" | "summary" | "resolution" | "confidenceScore" | "matchedKeywords"
>;

const THINKING_MESSAGE = "AI กำลังคิด...";
const AI_ERROR_MESSAGE = "AI ตอบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง";
const KB_PENDING_HINT =
  "กรุณาเลือกข้อมูลจากฐานความรู้ก่อน หรือเลือกให้ AI ตอบจากความรู้ทั่วไป";
const GENERIC_FOLLOW_UP_TOKENS = new Set([
  "ช่วย",
  "บอก",
  "ขอ",
  "หน่อย",
  "อธิบาย",
  "เกี่ยวกับ",
  "คืออะไร",
  "ยังไง",
  "อย่างไร",
  "ทำไม",
  "อะไร",
  "ได้ไหม",
  "ครับ",
  "ค่ะ",
]);

function normalizeText(value: string) {
  return value.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();
}

function getUsefulTokens(value: string) {
  return normalizeText(value)
    .split(" ")
    .map((token) => token.trim())
    .filter((token) => token.length > 1 && !GENERIC_FOLLOW_UP_TOKENS.has(token));
}

function boostConfirmedConfidence(confidenceScore: number) {
  return Math.min(1, Math.max(confidenceScore, confidenceScore + 0.05));
}

export default function ChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSessionId = searchParams.get("sessionId") ?? undefined;

  const [sessionId, setSessionId] = useState<string | undefined>(initialSessionId);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [pendingQuestion, setPendingQuestion] = useState("");
  const [knowledgeChoices, setKnowledgeChoices] = useState<RecommendationResult[]>([]);
  const [pendingMessageIds, setPendingMessageIds] = useState<string[]>([]);
  const [activeKnowledge, setActiveKnowledge] = useState<ActiveKnowledgeContext | null>(null);
  const [knowledgePendingHint, setKnowledgePendingHint] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const chatRunIdRef = useRef(0);
  const restoredKnowledgeIdRef = useRef<string | null>(null);
  const { mutateAsync, isPending } = useSendMessage();
  const recommendationsMutation = useRecommendations();
  const { data: history, isLoading: isHistoryLoading } = useSessionMessages(initialSessionId);

  useEffect(() => {
    if (initialSessionId && history.length > 0) {
      setMessages(history);
      const lastKnowledgeAnswer = [...history]
        .reverse()
        .find((message) => message.role === "assistant" && message.sourceType === "KNOWLEDGE_BASE");
      if (
        lastKnowledgeAnswer?.sourceArticleId &&
        lastKnowledgeAnswer.sourceArticleTitle &&
        restoredKnowledgeIdRef.current !== lastKnowledgeAnswer.sourceArticleId
      ) {
        restoredKnowledgeIdRef.current = lastKnowledgeAnswer.sourceArticleId;
        setActiveKnowledge({
          articleId: lastKnowledgeAnswer.sourceArticleId,
          title: lastKnowledgeAnswer.sourceArticleTitle,
          category: "Knowledge Base",
          preview: lastKnowledgeAnswer.sourceArticleTitle,
          summary: null,
          resolution: null,
          confidenceScore: lastKnowledgeAnswer.sourceConfidenceScore ?? 0.1,
          matchedKeywords: getUsefulTokens(lastKnowledgeAnswer.sourceArticleTitle),
        });
        recommendationsMutation
          .mutateAsync({
            title: lastKnowledgeAnswer.sourceArticleTitle,
            description: lastKnowledgeAnswer.sourceArticleTitle,
          })
          .then((recommendations) => {
            const restoredKnowledge = recommendations.find(
              (recommendation) => recommendation.articleId === lastKnowledgeAnswer.sourceArticleId,
            );
            if (restoredKnowledge) setActiveKnowledge(restoredKnowledge);
          })
          .catch(() => {
            // Keep the title-based context above if KB metadata cannot be refreshed.
          });
      }
    }
  }, [initialSessionId, history, recommendationsMutation.mutateAsync]);

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

  const createErrorMessage = () => ({
    ...createLocalMessage("assistant", AI_ERROR_MESSAGE),
    sourceType: "GENERAL_AI" as const,
  });

  const sendToAi = async (
    content: string,
    knowledgeBaseArticleId?: string,
    knowledgeBaseConfidenceScore?: number,
    localMessageIdsToReplace: string[] = [],
  ) => {
    const runId = chatRunIdRef.current;
    const thinkingMessage = createLocalMessage("assistant", THINKING_MESSAGE);
    setMessages((prev) => [...prev, thinkingMessage]);

    try {
      const result = await mutateAsync({
        sessionId,
        content,
        knowledgeBaseArticleId,
        knowledgeBaseConfidenceScore,
      });
      if (runId !== chatRunIdRef.current) return;
      setSessionId(result.session.id);
      setMessages((prev) => [
        ...prev.filter(
          (message) =>
            message.id !== thinkingMessage.id && !localMessageIdsToReplace.includes(message.id),
        ),
        ...result.messages,
      ]);
    } catch (error) {
      if (runId !== chatRunIdRef.current) return;
      setMessages((prev) => [
        ...prev.filter((message) => message.id !== thinkingMessage.id),
        createErrorMessage(),
      ]);
    }
  };

  const sendGeneralAnswerAfterKnowledgeSearchFailed = async (
    content: string,
    localUserMessage: ChatMessage,
  ) => {
    const runId = chatRunIdRef.current;
    const fallbackMessage = createLocalMessage(
      "assistant",
      "ไม่สามารถค้นหาฐานความรู้ได้ในขณะนี้ ระบบจะตอบจากความรู้ทั่วไปแทน",
    );
    setMessages((prev) => [...prev, fallbackMessage]);

    const thinkingMessage = createLocalMessage("assistant", THINKING_MESSAGE);
    setMessages((prev) => [...prev, thinkingMessage]);

    try {
      const result = await mutateAsync({ sessionId, content });
      if (runId !== chatRunIdRef.current) return;
      const [serverUserMessage, serverAssistantMessage] = result.messages;
      setSessionId(result.session.id);
      setMessages((prev) => [
        ...prev.filter(
          (message) =>
            message.id !== localUserMessage.id &&
            message.id !== fallbackMessage.id &&
            message.id !== thinkingMessage.id,
        ),
        serverUserMessage,
        fallbackMessage,
        serverAssistantMessage,
      ]);
    } catch {
      if (runId !== chatRunIdRef.current) return;
      setMessages((prev) => [
        ...prev.filter((message) => message.id !== thinkingMessage.id),
        createErrorMessage(),
      ]);
    }
  };

  const handleSend = async () => {
    const runId = chatRunIdRef.current;
    const content = input.trim();
    if (!content) return;
    if (knowledgeChoices.length > 0) {
      setKnowledgePendingHint(KB_PENDING_HINT);
      return;
    }
    setInput("");
    setPendingQuestion("");
    setKnowledgeChoices([]);
    setPendingMessageIds([]);
    setKnowledgePendingHint("");
    const userMessage = createLocalMessage("user", content);
    setMessages((prev) => [...prev, userMessage]);

    if (activeKnowledge) {
      await sendToAi(content, activeKnowledge.articleId, activeKnowledge.confidenceScore, [userMessage.id]);
      return;
    }

    let matches: RecommendationResult[] = [];
    try {
      matches = await recommendationsMutation.mutateAsync({
        title: content,
        description: content,
      });
    } catch {
      if (runId !== chatRunIdRef.current) return;
      await sendGeneralAnswerAfterKnowledgeSearchFailed(content, userMessage);
      return;
    }
    if (runId !== chatRunIdRef.current) return;

    if (matches.length > 0) {
      const pendingMessage = createLocalMessage(
        "assistant",
        "พบข้อมูลที่เกี่ยวข้องในฐานความรู้ กรุณาเลือกข้อมูลที่ตรงกับคำถาม",
      );
      setPendingQuestion(content);
      setKnowledgeChoices(matches);
      setKnowledgePendingHint("");
      setPendingMessageIds([userMessage.id, pendingMessage.id]);
      setMessages((prev) => [...prev, pendingMessage]);
      return;
    }

    await sendToAi(content, undefined, undefined, [userMessage.id]);
  };

  const handleSelectKnowledge = async (choice?: RecommendationResult) => {
    if (!pendingQuestion) return;
    const content = pendingQuestion;
    setPendingQuestion("");
    setKnowledgeChoices([]);
    setKnowledgePendingHint("");
    setMessages((prev) => prev.filter((message) => !pendingMessageIds.includes(message.id)));
    setPendingMessageIds([]);
    const confirmedChoice = choice
      ? { ...choice, confidenceScore: boostConfirmedConfidence(choice.confidenceScore) }
      : null;
    setActiveKnowledge(confirmedChoice);
    await sendToAi(
      content,
      confirmedChoice?.articleId,
      confirmedChoice?.confidenceScore,
    );
  };

  const handleNewChat = () => {
    chatRunIdRef.current += 1;
    setSessionId(undefined);
    setMessages([]);
    setInput("");
    setPendingQuestion("");
    setKnowledgeChoices([]);
    setPendingMessageIds([]);
    setActiveKnowledge(null);
    restoredKnowledgeIdRef.current = null;
    setKnowledgePendingHint("");
    recommendationsMutation.reset();
    router.replace("/chat");
  };

  const isBusy = isPending || recommendationsMutation.isPending;

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-3xl flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold">แชทกับ AI ผู้ช่วยแก้ปัญหา</h1>
        <div className="flex flex-wrap items-center gap-2">
          {activeKnowledge ? (
            <span className="w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              กำลังใช้ฐานความรู้: {activeKnowledge.title}
            </span>
          ) : (
            <span className="w-fit rounded-full bg-default-100 px-3 py-1 text-xs text-default-500">
              ตอบจากความรู้ทั่วไป
            </span>
          )}
          <BaseButton
            size="sm"
            variant="flat"
            startContent={<PlusCircle size={16} />}
            onPress={handleNewChat}
          >
            แชทใหม่
          </BaseButton>
        </div>
      </div>
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
                {m.role === "assistant" ? (
                  <FormattedAnswer content={m.content} className="space-y-2 leading-6" />
                ) : (
                  <div className="whitespace-pre-line">{m.content}</div>
                )}
                {m.role === "assistant" && m.sourceType === "KNOWLEDGE_BASE" && (
                  <p className="mt-2 border-t border-default-200/70 pt-2 text-xs font-medium text-primary">
                    อ้างอิงจากฐานความรู้: {m.sourceArticleTitle ?? m.sourceArticleId}
                    {m.sourceConfidenceScore !== null && m.sourceConfidenceScore !== undefined
                      ? ` (${Math.round(m.sourceConfidenceScore * 100)}%)`
                      : ""}
                  </p>
                )}
                {m.role === "assistant" && m.sourceType === "GENERAL_AI" && (
                  <p className="mt-2 border-t border-default-200/70 pt-2 text-xs text-default-500">
                    ตอบจากความรู้ทั่วไป
                  </p>
                )}
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
                    เกี่ยวข้อง {Math.round(choice.confidenceScore * 100)}%
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-default-500">
                  {choice.preview || choice.summary || choice.resolution || choice.explanation}
                </p>
                {/* <p className="mt-1 text-[11px] text-default-400">
                  คะแนนนี้คือความเกี่ยวข้องกับคำถาม ไม่ใช่การรับประกันว่าคำตอบถูกต้อง 100%
                </p> */}
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
          {knowledgePendingHint && (
            <p className="rounded-lg bg-warning-50 px-3 py-2 text-xs text-warning-700">
              {knowledgePendingHint}
            </p>
          )}
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

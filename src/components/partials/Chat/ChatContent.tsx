"use client";

import dayjs from "dayjs";
import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/react";
import type { ChatMessage, RecommendedKnowledgeBase } from "@/types/app/chat";
import type { RecommendationResult } from "@/types/app/knowledgeBase";
import { useSendMessage, useSessionMessages, useSuggestedQuestions } from "@/hooks/chat";
import { useHistoryList, useDeleteHistory } from "@/hooks/history";
import { useRecommendations } from "@/hooks/knowledgeBase";
import { BaseInput } from "@/components/ui/Input";
import { BaseButton } from "@/components/ui/Button";
import { BaseCard } from "@/components/ui/Card";
import { FormattedAnswer } from "@/components/common/FormattedAnswer";
import {
  Send,
  Bot,
  User,
  BookOpen,
  PlusCircle,
  MessageSquare,
  Trash2,
  MoreHorizontal,
  Pin,
  Share2,
  Users,
  Pencil,
  Archive,
  ChevronDown,
} from "lucide-react";
import { extractErrorMessage } from "@/utils/extractErrorMessage";

// Used only when the suggested-questions API itself fails to respond (network/server
// error) — the backend already has its own AI-down fallback, so this is a last resort
// to keep the UI from showing nothing.
const FALLBACK_SUGGESTED_QUESTIONS = [
  "Next.js ใช้ Ant Design หรือ MUI ดีกว่ากัน?",
  "ช่วยอธิบาย error นี้แบบเข้าใจง่าย",
  "วิเคราะห์ขั้นตอนแก้ปัญหานี้ให้หน่อย",
];
const SUGGESTED_QUESTIONS_DISPLAY_LIMIT = 3;

type ActiveKnowledgeContext = Pick<
  RecommendationResult,
  "articleId" | "title" | "category" | "preview" | "summary" | "resolution" | "confidenceScore" | "matchedKeywords"
>;

const THINKING_MESSAGE = "AI กำลังคิด...";
const AI_LOADING_MESSAGES = [
  "AI กำลังคิด...",
  "กำลังเรียบเรียงคำตอบ...",
  "กำลังตรวจสอบบริบท...",
];
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

function isRelatedToActiveKnowledge(question: string, knowledge: ActiveKnowledgeContext) {
  const normalizedQuestion = normalizeText(question);
  if (!normalizedQuestion) return true;

  const references = [
    knowledge.title,
    knowledge.category,
    knowledge.preview,
    knowledge.summary,
    knowledge.resolution,
    ...(knowledge.matchedKeywords ?? []),
  ]
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    .map(normalizeText)
    .filter((value) => value.length > 1);

  if (
    references.some(
      (reference) =>
        normalizedQuestion.includes(reference) || reference.includes(normalizedQuestion),
    )
  ) {
    return true;
  }

  const questionTokens = getUsefulTokens(question).filter((token) => token.length >= 3);
  if (questionTokens.some((token) => references.some((reference) => reference.includes(token)))) {
    return true;
  }

  const continuationMarkers = [
    "\u0e40\u0e23\u0e37\u0e48\u0e2d\u0e07\u0e19\u0e35\u0e49",
    "\u0e2d\u0e31\u0e19\u0e19\u0e35\u0e49",
    "\u0e41\u0e1a\u0e1a\u0e19\u0e35\u0e49",
    "\u0e02\u0e31\u0e49\u0e19\u0e15\u0e2d\u0e19\u0e16\u0e31\u0e14\u0e44\u0e1b",
  ].map(normalizeText);

  return continuationMarkers.some((marker) => normalizedQuestion.includes(marker));
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
  const [aiRecommendedKnowledgeBases, setAiRecommendedKnowledgeBases] = useState<RecommendedKnowledgeBase[]>([]);
  const [pendingMessageIds, setPendingMessageIds] = useState<string[]>([]);
  const [activeKnowledge, setActiveKnowledge] = useState<ActiveKnowledgeContext | null>(null);
  const [knowledgePendingHint, setKnowledgePendingHint] = useState("");
  const [pinnedSessionIds, setPinnedSessionIds] = useState<string[]>([]);
  const [deletingHistory, setDeletingHistory] = useState<{ id: string; title: string } | null>(null);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const chatRunIdRef = useRef(0);
  const restoredKnowledgeIdRef = useRef<string | null>(null);
  const { mutateAsync, isPending } = useSendMessage();
  const recommendationsMutation = useRecommendations();
  const {
    data: chatHistory,
    isLoading: isChatHistoryLoading,
    isError: isChatHistoryError,
    error: chatHistoryError,
  } = useHistoryList();
  const deleteHistoryMutation = useDeleteHistory();
  const { data: history, isLoading: isHistoryLoading } = useSessionMessages(initialSessionId);
  const showSuggestedQuestions = !isHistoryLoading && messages.length === 0;
  const {
    questions: suggestedQuestions,
    isLoading: isSuggestedQuestionsLoading,
    isError: isSuggestedQuestionsError,
    refetch: refetchSuggestedQuestions,
  } = useSuggestedQuestions(showSuggestedQuestions);
  const displayedSuggestedQuestions = (
    isSuggestedQuestionsError || suggestedQuestions.length === 0
      ? FALLBACK_SUGGESTED_QUESTIONS
      : suggestedQuestions
  ).slice(0, SUGGESTED_QUESTIONS_DISPLAY_LIMIT);

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

  useEffect(() => {
    const hasThinkingMessage = messages.some(
      (message) => message.role === "assistant" && message.content === THINKING_MESSAGE,
    );
    if (!hasThinkingMessage) {
      setLoadingMessageIndex(0);
      return;
    }

    const intervalId = window.setInterval(() => {
      setLoadingMessageIndex((index) => (index + 1) % AI_LOADING_MESSAGES.length);
    }, 2200);

    return () => window.clearInterval(intervalId);
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
      setAiRecommendedKnowledgeBases(
        (result.recommendedKnowledgeBases ?? []).filter((item) => item.shouldRecommend),
      );
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
      setAiRecommendedKnowledgeBases(
        (result.recommendedKnowledgeBases ?? []).filter((item) => item.shouldRecommend),
      );
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
    setAiRecommendedKnowledgeBases([]);
    setPendingMessageIds([]);
    setKnowledgePendingHint("");
    const userMessage = createLocalMessage("user", content);
    setMessages((prev) => [...prev, userMessage]);

    if (activeKnowledge && isRelatedToActiveKnowledge(content, activeKnowledge)) {
      await sendToAi(content, activeKnowledge.articleId, activeKnowledge.confidenceScore, [userMessage.id]);
      return;
    }

    if (activeKnowledge) setActiveKnowledge(null);

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
    setAiRecommendedKnowledgeBases([]);
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
    setAiRecommendedKnowledgeBases([]);
    setPendingMessageIds([]);
    setActiveKnowledge(null);
    restoredKnowledgeIdRef.current = null;
    setKnowledgePendingHint("");
    recommendationsMutation.reset();
    router.replace("/chat");
    void refetchSuggestedQuestions();
  };

  const handleOpenHistory = (selectedSessionId: string) => {
    if (selectedSessionId === sessionId) return;
    chatRunIdRef.current += 1;
    setMessages([]);
    setPendingQuestion("");
    setKnowledgeChoices([]);
    setAiRecommendedKnowledgeBases([]);
    setPendingMessageIds([]);
    setKnowledgePendingHint("");
    setActiveKnowledge(null);
    restoredKnowledgeIdRef.current = null;
    setSessionId(selectedSessionId);
    router.push(`/chat?sessionId=${selectedSessionId}`);
  };

  const handleConfirmDeleteHistory = () => {
    if (!deletingHistory) return;
    const selectedSessionId = deletingHistory.id;
    deleteHistoryMutation.mutate(selectedSessionId, {
      onSuccess: () => {
        setDeletingHistory(null);
        if (selectedSessionId === sessionId || selectedSessionId === initialSessionId) {
          handleNewChat();
        }
      },
      onError: () => setDeletingHistory(null),
    });
  };

  const handleTogglePinHistory = (selectedSessionId: string) => {
    setPinnedSessionIds((prev) =>
      prev.includes(selectedSessionId)
        ? prev.filter((id) => id !== selectedSessionId)
        : [selectedSessionId, ...prev],
    );
  };

  const sortedChatHistory = [...chatHistory].sort((a, b) => {
    const aPinned = pinnedSessionIds.includes(a.id);
    const bPinned = pinnedSessionIds.includes(b.id);
    if (aPinned !== bPinned) return aPinned ? -1 : 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  const isBusy = isPending || recommendationsMutation.isPending;

  const historyPanel = (
    <BaseCard className="h-full rounded-none border-0 bg-transparent p-0 shadow-none">
      <div className="mb-3 flex items-center gap-1 px-2">
        <h2 className="text-sm font-semibold">Recents</h2>
        <ChevronDown size={14} className="text-default-400" />
      </div>

      {isChatHistoryLoading ? (
        <p className="px-2 text-sm text-default-500">กำลังโหลดประวัติ...</p>
      ) : isChatHistoryError ? (
        <p className="px-2 text-sm text-danger-600">
          {extractErrorMessage(chatHistoryError, "โหลดประวัติการสนทนาไม่สำเร็จ")}
        </p>
      ) : chatHistory.length === 0 ? (
        <div className="mx-2 rounded-lg border border-dashed border-default-200 p-3 text-sm text-default-500">
          ยังไม่มีประวัติการสนทนา
        </div>
      ) : (
        <div className="max-h-[calc(100dvh-12rem)] space-y-1 overflow-y-auto pr-1">
          {sortedChatHistory.map((item) => {
            const isActive = item.id === sessionId || item.id === initialSessionId;
            const isPinned = pinnedSessionIds.includes(item.id);
            return (
              <div key={item.id} className="group relative">
                <button
                  type="button"
                  className={`flex min-h-10 w-full items-center gap-2 rounded-lg px-2.5 py-2 pr-14 text-left text-sm transition-colors ${
                    isActive
                      ? "border border-primary/20 bg-primary/10 text-foreground"
                      : "text-default-700 hover:bg-default-100/80 dark:text-default-300 dark:hover:bg-default-100/10"
                  }`}
                  onClick={() => handleOpenHistory(item.id)}
                  title={`${item.title}\n${item.lastMessage}\n${dayjs(item.updatedAt).format("DD MMM YYYY HH:mm")}`}
                >
                  <MessageSquare size={15} className="shrink-0 text-default-500" />
                  <span className="min-w-0 flex-1 truncate">{item.title}</span>
                </button>

                <div
                  className={`absolute right-1 top-1/2 flex -translate-y-1/2 items-center gap-0.5 ${
                    isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  } transition-opacity`}
                >
                  <button
                    type="button"
                    aria-label={isPinned ? "Unpin chat" : "Pin chat"}
                    onClick={(event) => {
                      event.stopPropagation();
                      handleTogglePinHistory(item.id);
                    }}
                    className={`rounded-md p-1.5 transition-colors hover:bg-default-200 dark:hover:bg-default-100/20 ${
                      isPinned ? "text-primary opacity-100" : "text-default-500"
                    }`}
                  >
                    <Pin size={14} />
                  </button>
                  <Dropdown placement="bottom-end">
                    <DropdownTrigger>
                      <button
                        type="button"
                        aria-label="Chat actions"
                        className="rounded-md p-1.5 text-default-500 transition-colors hover:bg-default-200 dark:hover:bg-default-100/20"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <MoreHorizontal size={15} />
                      </button>
                    </DropdownTrigger>
                    <DropdownMenu
                      aria-label="Chat actions"
                      onAction={(key) => {
                        if (key === "pin") handleTogglePinHistory(item.id);
                        if (key === "delete") setDeletingHistory({ id: item.id, title: item.title });
                      }}
                      disabledKeys={["share", "group", "rename", "archive"]}
                    >
                      {/* <DropdownItem key="share" startContent={<Share2 size={16} />}>
                        Share
                      </DropdownItem>
                      <DropdownItem key="group" startContent={<Users size={16} />}>
                        Start a group chat
                      </DropdownItem>
                      <DropdownItem key="rename" startContent={<Pencil size={16} />}>
                        Rename
                      </DropdownItem> */}
                      <DropdownItem key="pin" startContent={<Pin size={16} />}>
                        {isPinned ? "Unpin chat" : "Pin chat"}
                      </DropdownItem>
                      {/* <DropdownItem key="archive" startContent={<Archive size={16} />}>
                        Archive
                      </DropdownItem> */}
                      <DropdownItem
                        key="delete"
                        className="text-danger"
                        color="danger"
                        startContent={<Trash2 size={16} />}
                      >
                        Delete
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </BaseCard>
  );

  return (
    <div className="relative min-h-[calc(100dvh-6.5rem)] w-full min-w-0 overflow-hidden">
      <aside className="fixed bottom-5 left-0 top-16 z-20 hidden w-[300px] min-w-0 overflow-hidden border-r border-default-200/70 bg-background/70 px-5 py-5 backdrop-blur-md dark:border-white/10 dark:bg-background/50 2xl:block">
        {historyPanel}
      </aside>

      <section className="mx-auto flex h-[calc(100dvh-8.75rem)] w-full min-w-0 max-w-[820px] flex-col gap-4 overflow-hidden">
      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold">แชทกับ AI ผู้ช่วยแก้ปัญหา</h1>
        <div className="flex flex-wrap items-center gap-2">
          {activeKnowledge ? (
            <span className="min-w-0 max-w-full truncate rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
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
      <BaseCard className="min-h-0 flex-1 overflow-y-auto p-3">
        <div className="flex min-h-full flex-col gap-3">
          {isHistoryLoading && (
            <p className="text-center text-sm text-default-400">กำลังโหลดบทสนทนา...</p>
          )}
          {!isHistoryLoading && messages.length === 0 && (
            <div className="m-auto flex max-w-md flex-col items-center gap-4 px-4 py-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Bot size={24} />
              </div>
              <div>
                <h2 className="text-base font-semibold">เริ่มคุยกับ AI ผู้ช่วยแก้ปัญหา</h2>
                <p className="mt-1 text-sm leading-6 text-default-500">
                  พิมพ์ปัญหา เลือกคำถามตัวอย่าง หรือให้ AI ช่วยอธิบายจากฐานความรู้ของระบบ
                </p>
              </div>
              {isSuggestedQuestionsLoading ? (
                <div className="flex flex-wrap justify-center gap-2" aria-label="กำลังเตรียมคำถามแนะนำ">
                  {Array.from({ length: SUGGESTED_QUESTIONS_DISPLAY_LIMIT }).map((_, index) => (
                    <span
                      key={index}
                      className="h-6 w-32 animate-pulse rounded-full bg-default-100 dark:bg-default-100/20"
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap justify-center gap-2">
                  {displayedSuggestedQuestions.map((question) => (
                    <button
                      key={question}
                      type="button"
                      onClick={() => setInput(question)}
                      className="rounded-full border border-default-200 bg-background/80 px-3 py-1.5 text-xs text-default-600 transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary dark:border-default-100/20"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          {messages.map((m) => (
            m.role === "assistant" && m.content === THINKING_MESSAGE ? (
              <div key={m.id} className="flex items-start justify-start gap-2">
                <Bot size={20} className="mt-1 text-primary" />
                <div className="max-w-[min(75%,42rem)] rounded-xl bg-default-100 px-4 py-2 text-sm text-default-600 dark:text-default-300">
                  <p className="font-medium transition-opacity">
                    {AI_LOADING_MESSAGES[loadingMessageIndex]}
                  </p>
                </div>
              </div>
            ) : (
              <div
                key={m.id}
                className={`flex items-start gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.role === "assistant" && <Bot size={20} className="mt-1 text-primary" />}
                <div
                  className={`max-w-[min(75%,42rem)] rounded-xl px-4 py-2 text-sm ${
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
            )
          ))}
          <div ref={bottomRef} />
        </div>
      </BaseCard>
      {aiRecommendedKnowledgeBases.length > 0 && knowledgeChoices.length === 0 && (
        <BaseCard className="space-y-2 border-primary/20 bg-primary/5">
          <div className="flex items-start gap-2">
            <BookOpen size={17} className="mt-0.5 text-primary" />
            <div>
              <p className="text-sm font-semibold">แนะนำจากฐานความรู้</p>
              <p className="text-xs text-default-500">
                ข้อมูลนี้เกี่ยวข้องกับคำถาม และอาจช่วยให้ศึกษาต่อได้
              </p>
            </div>
          </div>
          <div className="grid gap-2">
            {aiRecommendedKnowledgeBases.slice(0, 3).map((item) => (
              <div
                key={item.articleId}
                className="rounded-lg border border-default-200 bg-background/70 px-3 py-2 dark:border-default-100/20"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="line-clamp-1 text-sm font-medium">{item.title}</p>
                  <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                    {Math.round(item.confidenceScore * 100)}%
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-default-500">
                  {item.preview || item.summary || item.whyThisKBIsRelevant || item.reason}
                </p>
              </div>
            ))}
          </div>
        </BaseCard>
      )}
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
      <div className="flex w-full items-center gap-2 rounded-2xl border border-default-200 bg-background/85 p-1.5 shadow-sm dark:border-default-100/20 dark:bg-default-50/5">
        <BaseInput
          value={input}
          onValueChange={setInput}
          placeholder="พิมพ์ข้อความที่นี่..."
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
          variant="flat"
          className="flex-1"
          classNames={{
            inputWrapper: "bg-transparent shadow-none",
            innerWrapper: "bg-transparent",
          }}
        />
        <BaseButton
          isIconOnly
          isLoading={isBusy}
          onPress={handleSend}
          className="h-10 w-10 min-w-10 shrink-0 rounded-xl"
        >
          <Send size={18} />
        </BaseButton>
      </div>
      </section>
      <Modal isOpen={!!deletingHistory} onClose={() => setDeletingHistory(null)}>
        <ModalContent>
          <ModalHeader>ยืนยันการลบประวัติแชท</ModalHeader>
          <ModalBody>
            <p className="text-sm text-default-600">
              คุณแน่ใจหรือไม่ว่าต้องการลบประวัติแชทนี้? การลบนี้ไม่สามารถย้อนกลับได้
            </p>
            {deletingHistory && <p className="font-medium">{deletingHistory.title}</p>}
          </ModalBody>
          <ModalFooter>
            <BaseButton variant="light" onPress={() => setDeletingHistory(null)}>
              ยกเลิก
            </BaseButton>
            <BaseButton
              color="danger"
              isLoading={deleteHistoryMutation.isPending}
              onPress={handleConfirmDeleteHistory}
            >
              ลบประวัติแชท
            </BaseButton>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

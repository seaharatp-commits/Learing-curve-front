"use client";

import { useState, useRef, useEffect, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import type { ChatMessage } from "@/types/app/chat";
import type { RecommendationResult } from "@/types/app/knowledgeBase";
import { useSendMessage, useSessionMessages } from "@/hooks/chat";
import { useRecommendations } from "@/hooks/knowledgeBase";
import { BaseInput } from "@/components/ui/Input";
import { BaseButton } from "@/components/ui/Button";
import { BaseCard } from "@/components/ui/Card";
import { Send, Bot, User, BookOpen } from "lucide-react";

type ActiveKnowledgeContext = Pick<
  RecommendationResult,
  "articleId" | "title" | "category" | "preview" | "summary" | "resolution" | "confidenceScore" | "matchedKeywords"
>;

type ChatAnswerBlock =
  | { type: "paragraph"; text: string }
  | { type: "unordered-list"; items: string[] }
  | { type: "ordered-list"; items: string[] };

const THINKING_MESSAGE = "AI กำลังคิด...";
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

function getKnowledgeTerms(knowledge: ActiveKnowledgeContext) {
  const rawTerms = [
    knowledge.title,
    knowledge.category,
    knowledge.preview,
    knowledge.summary ?? "",
    knowledge.resolution ?? "",
    ...knowledge.matchedKeywords,
  ];

  return Array.from(
    new Set(
      rawTerms.flatMap((term) => [normalizeText(term), ...getUsefulTokens(term)]).filter((term) => term.length > 2),
    ),
  );
}

function isRelatedToActiveKnowledge(question: string, knowledge: ActiveKnowledgeContext) {
  const normalizedQuestion = normalizeText(question);
  const questionTokens = new Set(getUsefulTokens(question));
  if (!normalizedQuestion || questionTokens.size === 0) return false;

  const title = normalizeText(knowledge.title);
  if (title && (normalizedQuestion.includes(title) || title.includes(normalizedQuestion))) return true;

  const matchingTerms = getKnowledgeTerms(knowledge).filter(
    (term) => normalizedQuestion.includes(term) || questionTokens.has(term),
  );

  return matchingTerms.length >= 2 || matchingTerms.some((term) => term.length >= 5);
}

function boostConfirmedConfidence(confidenceScore: number) {
  return Math.min(1, Math.max(confidenceScore, confidenceScore + 0.05));
}

function normalizeChatAnswer(content: string) {
  const trimmed = content.trim();
  const jsonCandidate = trimmed
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  if (!jsonCandidate.startsWith("{") || !jsonCandidate.endsWith("}")) return trimmed;

  try {
    const parsed = JSON.parse(jsonCandidate) as { title?: unknown; content?: unknown };
    const title = typeof parsed.title === "string" ? parsed.title.trim() : "";
    const body = typeof parsed.content === "string" ? parsed.content.trim() : "";
    if (!title && !body) return trimmed;
    return [title, body].filter(Boolean).join("\n\n");
  } catch {
    return trimmed;
  }
}

function parseChatAnswerBlocks(content: string): ChatAnswerBlock[] {
  const normalizedContent = normalizeChatAnswer(content)
    .replace(/\r\n/g, "\n")
    .replace(/([^\n])\s+(\d+[.)]\s+)/g, "$1\n$2")
    .replace(/([^\n])\s+([-*â€¢]\s+)/g, "$1\n$2");
  const lines = normalizedContent.split("\n");
  const blocks: ChatAnswerBlock[] = [];
  let paragraph: string[] = [];
  let listItems: string[] = [];
  let listType: "unordered-list" | "ordered-list" | null = null;

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    blocks.push({ type: "paragraph", text: paragraph.join(" ").trim() });
    paragraph = [];
  };

  const flushList = () => {
    if (!listType || listItems.length === 0) return;
    blocks.push({ type: listType, items: listItems });
    listItems = [];
    listType = null;
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }

    const unorderedMatch = trimmed.match(/^[-*•]\s+(.+)$/);
    if (unorderedMatch) {
      flushParagraph();
      if (listType !== "unordered-list") flushList();
      listType = "unordered-list";
      listItems.push(unorderedMatch[1].trim());
      continue;
    }

    const orderedMatch = trimmed.match(/^\d+[.)]\s*(.+)$/);
    if (orderedMatch) {
      flushParagraph();
      if (listType !== "ordered-list") flushList();
      listType = "ordered-list";
      listItems.push(orderedMatch[1].trim());
      continue;
    }

    flushList();
    paragraph.push(trimmed.replace(/^#{1,4}\s+/, ""));
  }

  flushParagraph();
  flushList();
  return blocks.length > 0 ? blocks : [{ type: "paragraph", text: normalizeChatAnswer(content) }];
}

function renderInlineText(text: string): ReactNode[] {
  return text
    .split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
    .filter(Boolean)
    .map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={index} className="font-semibold">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return <code key={index}>{part.slice(1, -1)}</code>;
      }
      return part;
    });
}

function ChatAnswer({ content }: { content: string }) {
  const blocks = parseChatAnswerBlocks(content);

  return (
    <div className="space-y-2 leading-6">
      {blocks.map((block, index) => {
        if (block.type === "unordered-list") {
          return (
            <ul key={index} className="list-disc space-y-1 pl-5">
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>{renderInlineText(item)}</li>
              ))}
            </ul>
          );
        }
        if (block.type === "ordered-list") {
          return (
            <ol key={index} className="list-decimal space-y-1 pl-5">
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>{renderInlineText(item)}</li>
              ))}
            </ol>
          );
        }
        return <p key={index}>{renderInlineText(block.text)}</p>;
      })}
    </div>
  );
}

export default function ChatContent() {
  const searchParams = useSearchParams();
  const initialSessionId = searchParams.get("sessionId") ?? undefined;

  const [sessionId, setSessionId] = useState<string | undefined>(initialSessionId);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [pendingQuestion, setPendingQuestion] = useState("");
  const [knowledgeChoices, setKnowledgeChoices] = useState<RecommendationResult[]>([]);
  const [pendingMessageIds, setPendingMessageIds] = useState<string[]>([]);
  const [activeKnowledge, setActiveKnowledge] = useState<ActiveKnowledgeContext | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { mutateAsync, isPending } = useSendMessage();
  const recommendationsMutation = useRecommendations();
  const { data: history, isLoading: isHistoryLoading } = useSessionMessages(initialSessionId);

  useEffect(() => {
    if (initialSessionId && history.length > 0) {
      setMessages(history);
      const lastKnowledgeAnswer = [...history]
        .reverse()
        .find((message) => message.role === "assistant" && message.sourceType === "KNOWLEDGE_BASE");
      if (lastKnowledgeAnswer?.sourceArticleId && lastKnowledgeAnswer.sourceArticleTitle) {
        setActiveKnowledge({
          articleId: lastKnowledgeAnswer.sourceArticleId,
          title: lastKnowledgeAnswer.sourceArticleTitle,
          category: "",
          preview: "",
          summary: null,
          resolution: null,
          confidenceScore: lastKnowledgeAnswer.sourceConfidenceScore ?? 0.1,
          matchedKeywords: [],
        });
      }
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
    localMessageIdsToReplace: string[] = [],
  ) => {
    const thinkingMessage = createLocalMessage("assistant", THINKING_MESSAGE);
    setMessages((prev) => [...prev, thinkingMessage]);

    try {
      const result = await mutateAsync({
        sessionId,
        content,
        knowledgeBaseArticleId,
        knowledgeBaseConfidenceScore,
      });
      setSessionId(result.session.id);
      setMessages((prev) => [
        ...prev.filter(
          (message) =>
            message.id !== thinkingMessage.id && !localMessageIdsToReplace.includes(message.id),
        ),
        ...result.messages,
      ]);
    } catch (error) {
      setMessages((prev) => prev.filter((message) => message.id !== thinkingMessage.id));
      throw error;
    }
  };

  const sendGeneralAnswerAfterKnowledgeSearchFailed = async (
    content: string,
    localUserMessage: ChatMessage,
  ) => {
    const fallbackMessage = createLocalMessage(
      "assistant",
      "ไม่สามารถค้นหาฐานความรู้ได้ในขณะนี้ ระบบจะตอบจากความรู้ทั่วไปแทน",
    );
    setMessages((prev) => [...prev, fallbackMessage]);

    const thinkingMessage = createLocalMessage("assistant", THINKING_MESSAGE);
    setMessages((prev) => [...prev, thinkingMessage]);

    const result = await mutateAsync({ sessionId, content });
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

    if (activeKnowledge) {
      if (isRelatedToActiveKnowledge(content, activeKnowledge)) {
        const confirmedConfidence = boostConfirmedConfidence(activeKnowledge.confidenceScore);
        setActiveKnowledge({ ...activeKnowledge, confidenceScore: confirmedConfidence });
        await sendToAi(content, activeKnowledge.articleId, confirmedConfidence, [userMessage.id]);
        return;
      }
      setActiveKnowledge(null);
    }

    let matches: RecommendationResult[] = [];
    try {
      matches = await recommendationsMutation.mutateAsync({
        title: content,
        description: content,
      });
    } catch {
      await sendGeneralAnswerAfterKnowledgeSearchFailed(content, userMessage);
      return;
    }

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

    await sendToAi(content, undefined, undefined, [userMessage.id]);
  };

  const handleSelectKnowledge = async (choice?: RecommendationResult) => {
    if (!pendingQuestion) return;
    const content = pendingQuestion;
    setPendingQuestion("");
    setKnowledgeChoices([]);
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

  const isBusy = isPending || recommendationsMutation.isPending;

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-3xl flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold">แชทกับ AI ผู้ช่วยแก้ปัญหา</h1>
        {activeKnowledge ? (
          <span className="w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            กำลังใช้ฐานความรู้: {activeKnowledge.title}
          </span>
        ) : (
          <span className="w-fit rounded-full bg-default-100 px-3 py-1 text-xs text-default-500">
            ตอบจากความรู้ทั่วไป
          </span>
        )}
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
                  <ChatAnswer content={m.content} />
                ) : (
                  <div className="whitespace-pre-line">{m.content}</div>
                )}
                {m.role === "assistant" && m.sourceType === "KNOWLEDGE_BASE" && (
                  <p className="mt-2 border-t border-default-200/70 pt-2 text-xs font-medium text-primary">
                    กำลังใช้ฐานความรู้: {m.sourceArticleTitle ?? m.sourceArticleId}
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

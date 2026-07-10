"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  MessageCircle,
  Send,
  Sparkles,
} from "lucide-react";
import {
  useAskLessonQuestion,
  useCompleteLesson,
  useGenerateQuizFromLesson,
  useLesson,
} from "@/hooks/learning";
import type { LessonChatResult } from "@/types/app/learning";
import { BaseButton } from "@/components/ui/Button";
import { BaseCard } from "@/components/ui/Card";
import { BaseInput } from "@/components/ui/Input";
import { FormattedAnswer, getFormattedAnswerDisplay } from "@/components/common/FormattedAnswer";
import { extractErrorMessage as getErrorMessage } from "@/utils/extractErrorMessage";

interface LessonContentProps {
  lessonId: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  recommendedKnowledgeBases?: LessonChatResult["recommendedKnowledgeBases"];
}

const MAX_CHAT_HISTORY_MESSAGES = 12;
const MAX_CHAT_HISTORY_MESSAGE_LENGTH = 800;
const MAX_CHAT_HISTORY_LENGTH = 5500;
const MAX_QUIZ_FOCUS_MESSAGES = 4;
const MAX_QUIZ_FOCUS_LENGTH = 1200;

function formatChatHistory(messages: ChatMessage[]) {
  const recentMessages = messages.slice(-MAX_CHAT_HISTORY_MESSAGES);
  const history = recentMessages
    .map((message, index) => {
      const label = message.role === "user" ? "Learner" : "Assistant";
      const content =
        message.content.length > MAX_CHAT_HISTORY_MESSAGE_LENGTH
          ? `${message.content.slice(0, MAX_CHAT_HISTORY_MESSAGE_LENGTH).trim()}...`
          : message.content;

      return `Turn ${index + 1} - ${label}: ${content}`;
    })
    .join("\n\n");

  return history.length > MAX_CHAT_HISTORY_LENGTH
    ? history.slice(history.length - MAX_CHAT_HISTORY_LENGTH).trim()
    : history;
}

function formatQuizFocus(messages: ChatMessage[]) {
  const focus = messages
    .filter((message) => message.role === "user")
    .slice(-MAX_QUIZ_FOCUS_MESSAGES)
    .map((message) => message.content.trim())
    .filter(Boolean)
    .join("\n");

  return focus.length > MAX_QUIZ_FOCUS_LENGTH
    ? focus.slice(focus.length - MAX_QUIZ_FOCUS_LENGTH).trim()
    : focus;
}

export default function LessonContent({ lessonId }: LessonContentProps) {
  const router = useRouter();
  const { data: lesson, isLoading, isError, error } = useLesson(lessonId);
  const completeMutation = useCompleteLesson(lessonId);
  const askMutation = useAskLessonQuestion(lessonId);
  const generateQuizMutation = useGenerateQuizFromLesson(lessonId);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatError, setChatError] = useState<string | null>(null);
  const [completeError, setCompleteError] = useState<string | null>(null);
  const [quizMessage, setQuizMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const handleAsk = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanMessage = chatInput.trim();
    if (!cleanMessage) return;

    const historyBeforeQuestion = formatChatHistory(messages);
    setChatInput("");
    setChatError(null);
    setQuizMessage(null);
    setMessages((current) => [...current, { role: "user", content: cleanMessage }]);

    askMutation.mutate(
      { message: cleanMessage, chatHistory: historyBeforeQuestion },
      {
        onSuccess: (result) => {
          setMessages((current) => [
            ...current,
            {
              role: "assistant",
              content: result.answer,
              recommendedKnowledgeBases: result.recommendedKnowledgeBases,
            },
          ]);
        },
        onError: (error) => {
          setChatError(getErrorMessage(error));
        },
      },
    );
  };

  const handleGenerateQuiz = () => {
    setQuizMessage(null);
    generateQuizMutation.mutate(formatQuizFocus(messages), {
      onSuccess: (result) => {
        router.push(`/quizzes/${result.quizId}`);
      },
      onError: (error) => {
        setQuizMessage({ text: getErrorMessage(error), isError: true });
      },
    });
  };

  if (isError) {
    return (
      <div className="mx-auto max-w-5xl space-y-3">
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-1 text-sm text-default-500 hover:text-default-700"
        >
          <ArrowLeft size={16} />
          กลับแดชบอร์ด
        </button>
        <BaseCard>
          <p className="text-sm text-danger-600">
            {getErrorMessage(error, "โหลดบทเรียนไม่สำเร็จ กรุณาลองใหม่อีกครั้ง")}
          </p>
        </BaseCard>
      </div>
    );
  }

  if (isLoading || !lesson) {
    return (
      <div className="mx-auto max-w-5xl">
        <p className="text-default-400">กำลังโหลดบทเรียน...</p>
      </div>
    );
  }

  const lessonDisplay = getFormattedAnswerDisplay(lesson.content, lesson.title);
  const hasLessonContent = lessonDisplay.content.trim().length > 0;
  const isCompleted = lesson.completed || completeMutation.isSuccess;

  return (
    <div className="thai-readable mx-auto max-w-5xl space-y-5">
      <button
        onClick={() => router.push("/dashboard")}
        className="flex items-center gap-1 text-sm text-default-500 hover:text-default-700"
      >
        <ArrowLeft size={16} />
        กลับแดชบอร์ด
      </button>

      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm text-default-500">บทเรียน</p>
          <h1 className="text-2xl font-semibold">{lessonDisplay.title}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <BaseButton
            color={isCompleted ? "success" : "primary"}
            variant={isCompleted ? "flat" : "solid"}
            startContent={<CheckCircle2 size={16} />}
            isDisabled={isCompleted}
            isLoading={completeMutation.isPending}
            onPress={() => {
              setCompleteError(null);
              completeMutation.mutate(undefined, {
                onError: (error) =>
                  setCompleteError(getErrorMessage(error, "บันทึกว่าเรียนจบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง")),
              });
            }}
          >
            {isCompleted ? "เรียนจบแล้ว" : "เรียนจบบทนี้"}
          </BaseButton>
          <BaseButton
            color="secondary"
            startContent={<Sparkles size={16} />}
            isLoading={generateQuizMutation.isPending}
            onPress={handleGenerateQuiz}
          >
            สร้างแบบทดสอบ
          </BaseButton>
        </div>
      </div>
      {completeError && <p className="text-sm text-danger-600">{completeError}</p>}

      <BaseCard>
        {!hasLessonContent ? (
          <p className="text-sm text-default-500">
            บทเรียนนี้ยังไม่มีเนื้อหาเพิ่มเติม คุณสามารถกลับไปเลือกบทเรียนอื่นได้
          </p>
        ) : (
          <div className="lesson-content space-y-4 text-default-700 dark:text-default-300">
            <FormattedAnswer content={lessonDisplay.content} />
          </div>
        )}
      </BaseCard>

      <BaseCard>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <MessageCircle size={20} className="text-default-500" />
            <div>
              <h2 className="font-medium">ถามต่อเกี่ยวกับบทเรียนนี้</h2>
              <p className="text-sm text-default-500">
                อธิบายเพิ่ม ยกตัวอย่าง หรือขยายความจากบทเรียน
              </p>
            </div>
          </div>
          {/* <BaseButton
            size="sm"
            color="secondary"
            variant="flat"
            startContent={<Sparkles size={16} />}
            isLoading={generateQuizMutation.isPending}
            onPress={handleGenerateQuiz}
          >
            พร้อมแล้ว สร้าง quiz
          </BaseButton> */}
        </div>

        <div
          className={`lesson-chat-area mb-3 space-y-3 rounded-lg bg-default-50 p-3 dark:bg-default-100/10 ${
            messages.length === 0 && !askMutation.isPending ? "hidden" : ""
          }`}
        >
          {messages.length === 0 ? (
            <p className="text-sm text-default-400">
              {/* ถามสิ่งที่ยังสงสัยเกี่ยวกับบทเรียนนี้ได้ AI จะใช้เนื้อหาด้านบนเป็นหลัก และอธิบายเสริมเมื่อจำเป็น */}
            </p>
          ) : (
            messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[82%] rounded-lg px-3 py-2 ${
                    message.role === "user"
                      ? "text-sm leading-7 bg-primary text-primary-foreground"
                      : "ai-answer bg-content1 text-default-700 shadow-sm dark:text-default-200"
                  }`}
                >
                  {message.role === "assistant" ? (
                    <>
                      <FormattedAnswer content={message.content} className="space-y-3 leading-7" />
                      {(message.recommendedKnowledgeBases?.filter((item) => item.shouldRecommend).length ?? 0) > 0 && (
                        <div className="mt-3 space-y-2 border-t border-default-200/70 pt-3 dark:border-white/10">
                          <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                            <BookOpen size={14} />
                            <span>แนะนำจากฐานความรู้</span>
                          </div>
                          {message.recommendedKnowledgeBases
                            ?.filter((item) => item.shouldRecommend)
                            .slice(0, 3)
                            .map((item) => (
                              <div
                                key={item.articleId}
                                className="rounded-lg border border-default-200 bg-background/70 px-3 py-2 text-xs dark:border-default-100/20"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <p className="line-clamp-1 font-medium text-default-700 dark:text-default-200">
                                    {item.title}
                                  </p>
                                  <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-primary">
                                    {Math.round(item.confidenceScore * 100)}%
                                  </span>
                                </div>
                                <p className="mt-1 line-clamp-2 text-default-500">
                                  {item.preview || item.summary || item.whyThisKBIsRelevant || item.reason}
                                </p>
                              </div>
                            ))}
                        </div>
                      )}
                    </>
                  ) : (
                    message.content
                  )}
                </div>
              </div>
            ))
          )}
          {askMutation.isPending && (
            <div className="flex justify-start">
              <div className="rounded-lg bg-content1 px-3 py-2 text-sm text-default-400 shadow-sm">
                กำลังตอบ...
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleAsk} className="space-y-2">
          <div className="flex w-full items-center gap-2 rounded-2xl border border-default-200 bg-background/85 p-1.5 shadow-sm dark:border-default-100/20 dark:bg-default-50/5">
            <BaseInput
              value={chatInput}
              onValueChange={setChatInput}
              placeholder="ถามต่อ เช่น ขอคำอธิบายเพิ่ม ตัวอย่าง วิธีใช้จริง หรือเรื่องที่เกี่ยวข้องกับบทเรียน"
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  event.currentTarget.form?.requestSubmit();
                }
              }}
              variant="flat"
              className="flex-1"
              classNames={{
                input: "text-[0.98rem]",
                inputWrapper: "bg-transparent shadow-none",
                innerWrapper: "bg-transparent",
              }}
            />
            <BaseButton
              isIconOnly
              type="submit"
              isLoading={askMutation.isPending}
              className="h-10 w-10 min-w-10 shrink-0 rounded-xl"
              aria-label="ส่งคำถาม"
            >
              <Send size={18} />
            </BaseButton>
          </div>
          {(chatError || quizMessage) && (
            <div>
              {chatError && <p className="text-xs text-danger-600">{chatError}</p>}
              {quizMessage && (
                <p
                  className={`text-xs ${
                    quizMessage.isError ? "text-danger-600" : "text-success-600"
                  }`}
                >
                  {quizMessage.text}
                </p>
              )}
            </div>
          )}
        </form>
      </BaseCard>

      <BaseCard>
        <div className="mb-3 flex items-center gap-2">
          <ClipboardList size={20} className="text-default-500" />
          <h2 className="font-medium">แบบทดสอบของบทเรียนนี้</h2>
        </div>
        {lesson.quizzes.length === 0 ? (
          <p className="text-sm text-default-400">
            ยังไม่มีแบบทดสอบสำหรับบทเรียนนี้ คุยต่อให้มั่นใจก่อน แล้วค่อยกดสร้าง quiz
          </p>
        ) : (
          <div className="space-y-2">
            {lesson.quizzes.map((quiz) =>
              quiz.questionCount > 0 ? (
                <Link
                  key={quiz.id}
                  href={`/quizzes/${quiz.id}`}
                  className="flex items-center justify-between rounded-lg bg-default-50 px-3 py-2 transition-colors hover:bg-default-100 dark:bg-default-100/10 dark:hover:bg-default-100/20"
                >
                  <div>
                    <p className="text-sm font-medium">{quiz.title}</p>
                    <p className="text-xs text-default-500">{quiz.questionCount} คำถาม</p>
                  </div>
                  <ArrowRight size={16} className="text-default-400" />
                </Link>
              ) : (
                <div
                  key={quiz.id}
                  className="rounded-lg bg-default-50 px-3 py-2 text-sm text-default-400 dark:bg-default-100/10"
                >
                  {quiz.title} ยังไม่มีคำถาม
                </div>
              ),
            )}
          </div>
        )}
      </BaseCard>
    </div>
  );
}


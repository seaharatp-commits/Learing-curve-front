"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Textarea } from "@heroui/react";
import {
  ArrowLeft,
  ArrowRight,
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
import { BaseButton } from "@/components/ui/Button";
import { BaseCard } from "@/components/ui/Card";

interface LessonContentProps {
  lessonId: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

function extractErrorMessage(error: unknown): string {
  if (
    error &&
    typeof error === "object" &&
    "response" in error &&
    error.response &&
    typeof error.response === "object" &&
    "data" in error.response &&
    error.response.data &&
    typeof error.response.data === "object" &&
    "message" in error.response.data &&
    typeof error.response.data.message === "string"
  ) {
    return error.response.data.message;
  }
  return "ดำเนินการไม่สำเร็จ ลองใหม่อีกครั้ง";
}

function formatChatHistory(messages: ChatMessage[]) {
  return messages
    .map((message) => `${message.role === "user" ? "ผู้เรียน" : "AI"}: ${message.content}`)
    .join("\n");
}

export default function LessonContent({ lessonId }: LessonContentProps) {
  const router = useRouter();
  const { data: lesson, isLoading } = useLesson(lessonId);
  const completeMutation = useCompleteLesson(lessonId);
  const askMutation = useAskLessonQuestion(lessonId);
  const generateQuizMutation = useGenerateQuizFromLesson(lessonId);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatError, setChatError] = useState<string | null>(null);
  const [quizMessage, setQuizMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const chatHistory = useMemo(() => formatChatHistory(messages), [messages]);

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
          setMessages((current) => [...current, { role: "assistant", content: result.answer }]);
        },
        onError: (error) => {
          setChatError(extractErrorMessage(error));
        },
      },
    );
  };

  const handleGenerateQuiz = () => {
    setQuizMessage(null);
    generateQuizMutation.mutate(chatHistory, {
      onSuccess: (result) => {
        router.push(`/quizzes/${result.quizId}`);
      },
      onError: (error) => {
        setQuizMessage({ text: extractErrorMessage(error), isError: true });
      },
    });
  };

  if (isLoading || !lesson) {
    return (
      <div className="mx-auto max-w-5xl">
        <p className="text-default-400">กำลังโหลดบทเรียน...</p>
      </div>
    );
  }

  const paragraphs = lesson.content
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
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
          <h1 className="text-2xl font-semibold">{lesson.title}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <BaseButton
            color={isCompleted ? "success" : "primary"}
            variant={isCompleted ? "flat" : "solid"}
            startContent={<CheckCircle2 size={16} />}
            isDisabled={isCompleted}
            isLoading={completeMutation.isPending}
            onPress={() => completeMutation.mutate()}
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

      <BaseCard>
        {paragraphs.length === 0 ? (
          <p className="text-sm text-default-500">
            บทเรียนนี้ยังไม่มีเนื้อหาเพิ่มเติม คุณสามารถกลับไปเลือกบทเรียนอื่นได้
          </p>
        ) : (
          <div className="lesson-content space-y-4 text-default-700 dark:text-default-300">
            {paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
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
          <BaseButton
            size="sm"
            color="secondary"
            variant="flat"
            startContent={<Sparkles size={16} />}
            isLoading={generateQuizMutation.isPending}
            onPress={handleGenerateQuiz}
          >
            พร้อมแล้ว สร้าง quiz
          </BaseButton>
        </div>

        <div className="lesson-chat-area mb-3 max-h-[420px] space-y-3 overflow-y-auto rounded-lg bg-default-50 p-3 dark:bg-default-100/10">
          {messages.length === 0 ? (
            <p className="text-sm text-default-400">
              ถามสิ่งที่ยังสงสัยเกี่ยวกับบทเรียนนี้ได้ AI จะใช้เนื้อหาด้านบนเป็นหลัก และอธิบายเสริมเมื่อจำเป็น
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
                  {message.content}
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
          <Textarea
            minRows={2}
            radius="lg"
            variant="bordered"
            classNames={{
              input: "text-[0.98rem] leading-7",
              inputWrapper: "min-h-14",
            }}
            value={chatInput}
            onValueChange={setChatInput}
            placeholder="ถามต่อ เช่น ขอคำอธิบายเพิ่ม ตัวอย่าง วิธีใช้จริง หรือเรื่องที่เกี่ยวข้องกับบทเรียน"
          />
          <div className="flex flex-wrap items-center justify-between gap-2">
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
            <BaseButton
              type="submit"
              startContent={<Send size={16} />}
              isLoading={askMutation.isPending}
            >
              ส่งคำถาม
            </BaseButton>
          </div>
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

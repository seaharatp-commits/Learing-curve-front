"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import type { ChatMessage } from "@/types/app/chat";
import { useSendMessage, useSessionMessages } from "@/hooks/chat";
import { BaseInput } from "@/components/ui/Input";
import { BaseButton } from "@/components/ui/Button";
import { BaseCard } from "@/components/ui/Card";
import { Send, Bot, User } from "lucide-react";

export default function ChatContent() {
  const searchParams = useSearchParams();
  const initialSessionId = searchParams.get("sessionId") ?? undefined;

  const [sessionId, setSessionId] = useState<string | undefined>(initialSessionId);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const { mutateAsync, isPending } = useSendMessage();
  const { data: history, isLoading: isHistoryLoading } = useSessionMessages(initialSessionId);

  useEffect(() => {
    if (initialSessionId && history.length > 0) {
      setMessages(history);
    }
  }, [initialSessionId, history]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const content = input;
    setInput("");
    const result = await mutateAsync({ sessionId, content });
    setSessionId(result.session.id);
    setMessages((prev) => [...prev, ...result.messages]);
  };

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
        <BaseButton isIconOnly isLoading={isPending} onPress={handleSend}>
          <Send size={18} />
        </BaseButton>
      </div>
    </div>
  );
}

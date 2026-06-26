import { Suspense } from "react";
import { ChatContent } from "@/components/partials/Chat";

export default function ChatPage() {
  return (
    <Suspense>
      <ChatContent />
    </Suspense>
  );
}

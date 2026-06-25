import type { ChatMessage, ChatSession } from "@/types/app/chat";
import type { IssueReport } from "@/types/app/issue";
import type { KnowledgeBaseItem } from "@/types/app/knowledgeBase";

export interface MockUser {
  id: string;
  email: string;
  password: string;
  name: string;
  role: "USER" | "ADMIN";
}

export const mockUsers: MockUser[] = [
  { id: "u1", email: "admin@learningcurve.dev", password: "admin1234", name: "ผู้ดูแลระบบ", role: "ADMIN" },
  { id: "u2", email: "user@learningcurve.dev", password: "user1234", name: "ผู้ใช้งานทั่วไป", role: "USER" },
];

export const mockChatSessions: ChatSession[] = [];
export const mockMessages: ChatMessage[] = [];
export const mockIssues: IssueReport[] = [];

export const mockKnowledgeBase: KnowledgeBaseItem[] = [
  {
    id: "kb1",
    title: "วิธีรีเซ็ตรหัสผ่าน",
    category: "บัญชีผู้ใช้",
    content: "ไปที่หน้า Login แล้วเลือก 'ลืมรหัสผ่าน' จากนั้นกรอกอีเมลเพื่อรับลิงก์รีเซ็ตรหัสผ่าน",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "kb2",
    title: "ไม่สามารถเข้าสู่ระบบได้",
    category: "การเข้าสู่ระบบ",
    content: "ตรวจสอบว่าอีเมลและรหัสผ่านถูกต้อง และลองล้างแคชเบราว์เซอร์หากยังเข้าไม่ได้",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

let idCounter = 100;
export const nextId = (prefix: string) => `${prefix}-${idCounter++}`;

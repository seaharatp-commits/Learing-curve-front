import type { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";

const API_URL = process.env.BACKEND_API_URL ?? "http://localhost:3333/api";

interface BackendLoginResponse {
  accessToken: string;
  user: { id: string; email: string; name: string; role: "USER" | "ADMIN" };
}

export const authOptions: AuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const res = await axios.post<BackendLoginResponse>(`${API_URL}/auth/login`, {
            email: credentials?.email,
            password: credentials?.password,
          });
          const { accessToken, user } = res.data;
          return { id: user.id, email: user.email, name: user.name, role: user.role, accessToken };
        } catch (error) {
          if (axios.isAxiosError(error) && !error.response) {
            throw new Error("ไม่สามารถเชื่อมต่อ backend ได้ กรุณาตรวจสอบว่า backend กำลังรันอยู่");
          }
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.accessToken = user.accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      session.accessToken = token.accessToken;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET ?? "learning-curve-mock-secret",
};

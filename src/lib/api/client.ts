import axios from "axios";
import { getSession } from "next-auth/react";

export const mainClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333/api",
  headers: { "Content-Type": "application/json" },
});

mainClient.interceptors.request.use(async (config) => {
  const session = await getSession();
  if (session?.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }
  return config;
});

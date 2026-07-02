export function extractErrorMessage(
  error: unknown,
  fallback = "ดำเนินการไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
): string {
  if (
    error &&
    typeof error === "object" &&
    "response" in error &&
    error.response &&
    typeof error.response === "object" &&
    "data" in error.response &&
    error.response.data &&
    typeof error.response.data === "object" &&
    "message" in error.response.data
  ) {
    const message = error.response.data.message;
    if (typeof message === "string") return message;
    if (Array.isArray(message) && message.every((item) => typeof item === "string")) {
      return message.join(", ");
    }
  }

  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

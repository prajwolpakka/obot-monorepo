import axios from "axios";

function extractMessage(errMsg: unknown, fallback: string): string {
  if (Array.isArray(errMsg)) {
    return errMsg[0] || fallback;
  } else if (typeof errMsg === "string") {
    return errMsg;
  }
  return fallback;
}

export function parseError(error: unknown): string {
  const message = "An unexpected error occurred.";

  if (axios.isAxiosError(error)) {
    return extractMessage(error.response?.data?.message, message);
  }

  if (typeof error === "string") {
    return error;
  }

  if (error && typeof error === "object" && "message" in error) {
    return extractMessage((error as { message?: unknown }).message, message);
  }

  return message;
}

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface EmbeddingStatusUpdate {
  documentId: string;
  status: "pending" | "embedding" | "processed" | "failed";
  timestamp: Date;
}

export const useEmbeddingStatus = (documentId: string | null) => {
  const [status, setStatus] = useState<"pending" | "embedding" | "processed" | "failed">("pending");
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Always connect so callers can manage subscriptions dynamically
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:4001";
    const newSocket = io(`${baseUrl}/embedding-status`, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    newSocket.on("connect", () => {
      console.log("Connected to embedding status socket");
      if (documentId) {
        // Subscribe to document updates when an id is provided
        newSocket.emit("subscribe-document", documentId);
      }
    });

    newSocket.on("status-update", (update: EmbeddingStatusUpdate) => {
      if (!documentId || update.documentId === documentId) {
        setStatus(update.status);
      }
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from embedding status socket");
    });

    setSocket(newSocket);

    return () => {
      if (newSocket.connected && documentId) {
        newSocket.emit("unsubscribe-document", documentId);
      }
      newSocket.disconnect();
    };
  }, [documentId]);

  return { status, socket };
};

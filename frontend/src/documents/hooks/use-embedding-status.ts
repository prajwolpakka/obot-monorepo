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
    if (!documentId) return;

    // Connect to embedding status namespace
    const newSocket = io(`${import.meta.env.VITE_API_URL}/embedding-status`);

    newSocket.on("connect", () => {
      console.log("Connected to embedding status socket");
      // Subscribe to document updates
      newSocket.emit("subscribe-document", documentId);
    });

    newSocket.on("status-update", (update: EmbeddingStatusUpdate) => {
      if (update.documentId === documentId) {
        setStatus(update.status);
      }
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from embedding status socket");
    });

    setSocket(newSocket);

    return () => {
      if (newSocket.connected) {
        newSocket.emit("unsubscribe-document", documentId);
        newSocket.disconnect();
      }
    };
  }, [documentId]);

  return { status, socket };
};

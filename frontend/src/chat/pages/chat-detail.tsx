import { Card, CardContent } from "@/common/components/ui/card";
import { ScrollArea } from "@/common/components/ui/scroll-area";
import { Skeleton } from "@/common/components/ui/skeleton";
import MarkdownMessage from "@/common/components/ui/markdown-message";
import { Bot, Loader2, User } from "lucide-react";
import { useParams } from "react-router-dom";
import { useChatMessages, useChats } from "../services/hooks";

const ChatDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: messages = [], isLoading: messagesLoading } = useChatMessages(id || "");
  const { data: conversations = [] } = useChats(50, 0);

  const conversation = conversations.find((c) => c.id === id);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    } else {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
  };

  if (!id) {
    return (
      <Card className="h-full flex items-center justify-center">
        <CardContent className="text-center">
          <p className="text-red-500">Invalid conversation ID</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardContent className="p-0 flex flex-col h-full min-h-0">
        {/* Header */}
        <div className="p-4 border-b flex-shrink-0">
          <div className="flex items-center gap-3">
            {conversation?.chatbot?.iconUrl ? (
              <img
                src={`http://localhost:8002${conversation.chatbot.iconUrl}`}
                alt="Bot Avatar"
                className="w-10 h-10 rounded-full"
              />
            ) : conversation ? (
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            ) : (
              <Skeleton className="w-10 h-10 rounded-full" />
            )}
            <div>
              <div className="font-medium text-gray-900 dark:text-white">
                {conversation?.chatbot?.name ? (
                  conversation.chatbot.name
                ) : conversation ? (
                  "Assistant"
                ) : (
                  <Skeleton className="h-5 w-24" />
                )}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {conversation?.startedAt ? (
                  new Date(conversation.startedAt).toLocaleString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                ) : (
                  <Skeleton className="h-4 w-32" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full">
            <div className="p-4">
              {messagesLoading ? (
                <div className="space-y-4">
                  {[...Array(10)].map((_, i) => {
                    const isUser = i % 3 === 0; // Vary between user and bot messages
                    return (
                      <div key={i} className={`flex gap-3 ${isUser ? "justify-end" : ""}`}>
                        {!isUser && (
                          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                            <Skeleton className="h-4 w-4 rounded" />
                          </div>
                        )}
                        <div
                          className={`max-w-[70%] rounded-lg px-4 py-2 ${
                            isUser ? "bg-gray-200 dark:bg-gray-700" : "bg-gray-100 dark:bg-gray-600"
                          }`}
                        >
                          <Skeleton className={`h-4 mb-2 ${isUser ? "w-32" : i % 2 === 0 ? "w-48" : "w-40"}`} />
                          {i % 4 === 0 && <Skeleton className="h-4 w-24 mb-2" />}{" "}
                          {/* Some messages have multiple lines */}
                          <Skeleton className="h-3 w-16" />
                        </div>
                        {isUser && (
                          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                            <Skeleton className="h-4 w-4 rounded" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-4">
                  {messages && messages.length > 0 ? (
                    messages.map((message: any) => (
                      <div key={message.id} className={`flex gap-3 ${message.sender === "user" ? "justify-end" : ""}`}>
                        {message.sender === "bot" && (
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Bot className="h-4 w-4 text-primary" />
                          </div>
                        )}
                        <div
                          className={`max-w-[70%] rounded-lg px-4 py-2 ${
                            message.sender === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                          }`}
                        >
                          {message.sender === "bot" ? (
                            <MarkdownMessage content={message.content} className="text-sm" />
                          ) : (
                            <p className="text-sm">{message.content}</p>
                          )}
                          <p
                            className={`text-xs mt-1 ${
                              message.sender === "user"
                                ? "text-primary-foreground/70"
                                : "text-gray-500 dark:text-gray-400"
                            }`}
                          >
                            {formatTime(message.timestamp)}
                          </p>
                        </div>
                        {message.sender === "user" && (
                          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                            <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-sm text-gray-500 dark:text-gray-400">No messages in this conversation</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatDetailPage;

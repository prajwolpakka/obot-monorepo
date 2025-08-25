import { useChatbotConversations, useChatMessages, useDeleteConversation } from "@/chat/services/hooks";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/common/components/ui/alert-dialog";
import { Button } from "@/common/components/ui/button";
import { Card, CardContent } from "@/common/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/common/components/ui/dropdown-menu";
import MarkdownMessage from "@/common/components/ui/markdown-message";
import { ScrollArea } from "@/common/components/ui/scroll-area";
import { Skeleton } from "@/common/components/ui/skeleton";
import { Bot, Clock, Loader2, MessageSquare, MoreVertical, Trash2, User } from "lucide-react";
import React, { useState } from "react";

interface ConversationsTabProps {
  chatbotId: string;
}

const ConversationSkeleton = () => (
  <div className="p-4 border-b">
    <div className="flex items-start justify-between">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <Skeleton className="h-8 w-8 rounded-md flex-shrink-0 mt-1" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <Skeleton className="h-4 w-20" />
            <div className="flex items-center gap-2 ml-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-6 w-6 rounded" />
            </div>
          </div>
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    </div>
  </div>
);

const MessageSkeleton = ({ isUser = false }: { isUser?: boolean }) => (
  <div className={`flex gap-3 ${isUser ? "justify-end" : ""}`}>
    {!isUser && <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />}
    <div className={`max-w-[70%] ${isUser ? "order-first" : ""}`}>
      <Skeleton className="h-16 w-full rounded-lg" />
    </div>
    {isUser && <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />}
  </div>
);

const ConversationsTab: React.FC<ConversationsTabProps> = ({ chatbotId }) => {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);
  const { data: conversations, isLoading: conversationsLoading } = useChatbotConversations(chatbotId);
  const { data: messages, isLoading: messagesLoading } = useChatMessages(selectedConversation || "");
  const deleteConversationMutation = useDeleteConversation();

  const handleDeleteConversation = (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConversationToDelete(conversationId);
  };

  const confirmDelete = async () => {
    if (!conversationToDelete) return;

    try {
      await deleteConversationMutation.mutateAsync(conversationToDelete);

      // If the deleted conversation was selected, clear selection
      if (selectedConversation === conversationToDelete) {
        setSelectedConversation(null);
      }

      setConversationToDelete(null);
    } catch (error) {
      console.error("Failed to delete conversation:", error);
      // Handle error (show toast, etc.)
    }
  };

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

  if (conversationsLoading) {
    return (
      <div className="h-full flex gap-4">
        {/* Conversations list skeleton */}
        <div className="w-[400px] flex-shrink-0 h-full">
          <Card className="h-full flex flex-col">
            <CardContent className="p-0 flex flex-col h-full min-h-0">
              <div className="flex-1 min-h-0">
                <ScrollArea className="h-full">
                  <div>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <ConversationSkeleton key={i} />
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Messages skeleton */}
        <div className="flex-1 min-h-0">
          <Card className="h-full flex items-center justify-center">
            <CardContent className="text-center">
              <Skeleton className="h-16 w-16 rounded-full mx-auto mb-4" />
              <Skeleton className="h-6 w-48 mx-auto mb-2" />
              <Skeleton className="h-4 w-64 mx-auto" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="h-full flex flex-col">
        {conversations && conversations.length > 0 ? (
          <div className="h-full flex gap-4">
            {/* Conversations list */}
            <div className="w-[400px] flex-shrink-0 h-full">
              <Card className="h-full flex flex-col">
                <CardContent className="p-0 flex flex-col h-full min-h-0">
                  <div className="flex-1 min-h-0">
                    <ScrollArea className="h-full">
                      <div>
                        {conversations.map((conversation) => {
                          const lastMessage = conversation.messages?.[conversation.messages.length - 1];
                          const isSelected = selectedConversation === conversation.id;

                          return (
                            <div
                              key={conversation.id}
                              className={`p-4 border-b cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group border-l-4 ${
                                isSelected ? "bg-blue-50 dark:bg-blue-900/20 border-l-primary" : "border-l-transparent"
                              }`}
                              onClick={() => setSelectedConversation(conversation.id)}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                  <div className="flex-shrink-0 mt-1">
                                    <div className="h-8 w-8 rounded-md border bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                      <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                    </div>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                      <h3 className="font-medium text-sm truncate">User Session</h3>
                                      <div className="flex items-center gap-2 ml-2">
                                        <div className="flex items-center gap-1">
                                          <Clock className="h-3 w-3 text-gray-400" />
                                          <span className="text-xs text-gray-400">
                                            {new Date(conversation.startedAt).toLocaleString("en-US", {
                                              month: "short",
                                              day: "numeric",
                                              hour: "2-digit",
                                              minute: "2-digit",
                                            })}
                                          </span>
                                        </div>
                                        <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-6 w-6 p-0"
                                              onClick={(e) => e.stopPropagation()}
                                            >
                                              <MoreVertical className="h-3 w-3" />
                                            </Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent align="end" className="w-40">
                                            <DropdownMenuItem
                                              onClick={(e) => handleDeleteConversation(conversation.id, e)}
                                              className="text-red-600 focus:text-red-600"
                                            >
                                              <Trash2 className="h-4 w-4 mr-2" />
                                              Delete
                                            </DropdownMenuItem>
                                          </DropdownMenuContent>
                                        </DropdownMenu>
                                      </div>
                                    </div>
                                    <p className="text-sm text-gray-900 dark:text-gray-100 truncate">
                                      {lastMessage?.content || "No messages yet"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Messages */}
            <div className="flex-1 min-h-0">
              {selectedConversation ? (
                <Card className="h-full flex flex-col">
                  <CardContent className="p-0 flex flex-col h-full min-h-0">
                    {/* Header */}
                    <div className="p-4 border-b flex-shrink-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">User Session</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(
                              conversations?.find((c) => c.id === selectedConversation)?.startedAt
                            ).toLocaleString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 min-h-0">
                      <ScrollArea className="h-full">
                        <div className="p-4">
                          {messagesLoading ? (
                            <div className="space-y-4">
                              {Array.from({ length: 4 }).map((_, i) => (
                                <MessageSkeleton key={i} isUser={i % 2 === 1} />
                              ))}
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {messages && messages.length > 0 ? (
                                messages.map((message) => (
                                  <div
                                    key={message.id}
                                    className={`flex gap-3 ${message.sender === "user" ? "justify-end" : ""}`}
                                  >
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
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    No messages in this conversation
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="h-full flex items-center justify-center">
                  <CardContent className="text-center">
                    <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Choose a conversation from the list to view its messages
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        ) : (
          /* Full width empty state when no conversations exist */
          <Card className="w-full h-full flex items-center justify-center">
            <CardContent className="text-center">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No conversations yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                No users have started conversations with this chatbot yet.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <AlertDialog open={!!conversationToDelete} onOpenChange={() => setConversationToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this conversation? This action cannot be undone and will permanently
              remove all messages.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteConversationMutation.isPending}
            >
              {deleteConversationMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ConversationsTab;
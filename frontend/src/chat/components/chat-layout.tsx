import { EmptyPage } from "@/common/components/empty-page";
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
import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import { Card, CardContent } from "@/common/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/common/components/ui/dropdown-menu";
import MultiChoiceFilter, { IChoiceOption } from "@/common/components/ui/multi-choice-filter";
import { ScrollArea } from "@/common/components/ui/scroll-area";
import TableFilter from "@/common/components/ui/table-filter";
import TableSearch from "@/common/components/ui/table-search";
import { useTableFilters } from "@/common/hooks/use-table-filters";
import { useMetrics } from "@/dashboard/services/hooks";
import { Bot, Clock, MessageSquare, MoreVertical, Trash2 } from "lucide-react";
import { useState } from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { useChats, useDeleteConversation } from "../services/hooks";

const ChatLayout = () => {
  const navigate = useNavigate();
  const { id: selectedChatId } = useParams<{ id: string }>();
  const [searchQuery, setSearchQuery] = useState("");
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);

  const { data: metrics, isLoading: isMetricsLoading } = useMetrics();
  const { data: conversations = [], isLoading, error } = useChats(50, 0);
  const { mutate: deleteConversation, isPending: isDeleting } = useDeleteConversation();

  const {
    localFilters,
    savedFilters,
    saveFilters,
    updateLocalFilter,
    updateSavedFilter,
    clearFilters,
    resetLocalFilters,
  } = useTableFilters({
    dateRange: [],
    chatbot: [],
  });

  const handleDeleteConversation = (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConversationToDelete(conversationId);
  };

  const confirmDelete = async () => {
    if (!conversationToDelete) return;

    deleteConversation(conversationToDelete, {
      onSuccess: () => {
        // If the deleted conversation was selected, navigate back to chat index
        if (selectedChatId === conversationToDelete) {
          navigate("/chat");
        }
        setConversationToDelete(null);
      },
      onError: (error) => {
        console.error("Failed to delete conversation:", error);
        // The error will be handled by the mutation's error state
      },
    });
  };

  const filteredConversations = conversations.filter((conversation: any) => {
    // Filter by search term
    const matchesSearch =
      !searchQuery ||
      conversation.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conversation.chatbot?.name?.toLowerCase().includes(searchQuery.toLowerCase());

    // Filter by date range
    const matchesDateRange =
      savedFilters.dateRange.length === 0 ||
      savedFilters.dateRange.some((filter: IChoiceOption) => {
        const conversationDate = new Date(conversation.startedAt);
        const today = new Date();

        switch (filter.value) {
          case "today":
            return conversationDate.toDateString() === today.toDateString();
          case "yesterday":
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            return conversationDate.toDateString() === yesterday.toDateString();
          case "last7days":
            const sevenDaysAgo = new Date(today);
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            return conversationDate >= sevenDaysAgo;
          case "last30days":
            const thirtyDaysAgo = new Date(today);
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return conversationDate >= thirtyDaysAgo;
          default:
            return true;
        }
      });

    // Filter by chatbot
    const matchesChatbot =
      savedFilters.chatbot.length === 0 ||
      savedFilters.chatbot.some((filter: IChoiceOption) => conversation.chatbot?.id === filter.value);

    return matchesSearch && matchesDateRange && matchesChatbot;
  });

  // Get unique chatbots for filter options
  const uniqueChatbots = conversations.reduce((acc: any[], conversation: any) => {
    if (conversation.chatbot && !acc.find((bot) => bot.id === conversation.chatbot.id)) {
      acc.push(conversation.chatbot);
    }
    return acc;
  }, []);

  const chatbotFilterOptions = uniqueChatbots.map((chatbot) => ({
    label: chatbot.name,
    value: chatbot.id,
  }));

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-4">Failed to load conversations</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  if (isMetricsLoading) return <></>;

  if (metrics.totalChats === 0) {
    return (
      <EmptyPage
        icon={<MessageSquare className="mx-auto h-16 w-16 text-gray-400 mb-6" />}
        title="No conversations yet"
        description="Chats with the chatbots will appear here."
      />
    );
  }

  return (
    <>
      <div className="p-4 h-full w-full overflow-hidden">
        <div className="flex flex-col h-full max-h-full">
          <div className="flex flex-1 gap-4 min-h-0">
            {/* Left Panel - Chat List */}
            <div className="w-[400px] flex-shrink-0 h-full">
              <Card className="h-full flex flex-col">
                <CardContent className="p-0 flex flex-col h-full min-h-0">
                  {/* Search and Filters */}
                  <div className="p-4 border-b">
                    <div className="flex items-center gap-2 mb-3">
                      <TableSearch onSearch={setSearchQuery} debounceDelay={300} />
                      <TableFilter onSave={saveFilters} onClear={clearFilters} onOpen={resetLocalFilters}>
                        <MultiChoiceFilter
                          label="Date Range"
                          options={[
                            { label: "Today", value: "today" },
                            { label: "Yesterday", value: "yesterday" },
                            { label: "Last 7 days", value: "last7days" },
                            { label: "Last 30 days", value: "last30days" },
                          ]}
                          selected={localFilters.dateRange}
                          setSelected={(selected) => updateLocalFilter("dateRange", selected)}
                        />
                        <MultiChoiceFilter
                          label="Chatbot"
                          options={chatbotFilterOptions}
                          selected={localFilters.chatbot}
                          setSelected={(selected) => updateLocalFilter("chatbot", selected)}
                        />
                      </TableFilter>
                    </div>

                    {/* Filter Badges */}
                    {(savedFilters.dateRange.length > 0 || savedFilters.chatbot.length > 0) && (
                      <div className="flex gap-2 flex-wrap">
                        {savedFilters.dateRange.map((option: IChoiceOption) => (
                          <Badge
                            key={option.value}
                            className="flex items-center gap-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          >
                            {option.label}
                            <Trash2
                              className="w-4 cursor-pointer hover:text-red-500 transition-colors"
                              onClick={() =>
                                updateSavedFilter(
                                  "dateRange",
                                  savedFilters.dateRange.filter(
                                    (choice: IChoiceOption) => choice.value !== option.value
                                  )
                                )
                              }
                            />
                          </Badge>
                        ))}
                        {savedFilters.chatbot.map((option: IChoiceOption) => (
                          <Badge
                            key={option.value}
                            className="flex items-center gap-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          >
                            {option.label}
                            <Trash2
                              className="w-4 cursor-pointer hover:text-red-500 transition-colors"
                              onClick={() =>
                                updateSavedFilter(
                                  "chatbot",
                                  savedFilters.chatbot.filter((choice: IChoiceOption) => choice.value !== option.value)
                                )
                              }
                            />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Chat List */}
                  <div className="flex-1 min-h-0">
                    <ScrollArea className="h-full">
                      <div className="h-full">
                        {isLoading ? (
                          <div className="p-4 space-y-3">
                            {[...Array(8)].map((_, i) => (
                              <div key={i} className="p-4 border-b border-l-4 border-l-transparent">
                                <div className="flex items-start justify-between">
                                  <div className="flex items-start gap-3 flex-1 min-w-0">
                                    <div className="flex-shrink-0 mt-1">
                                      <div className="h-8 w-8 rounded-md border bg-gray-200 dark:bg-gray-700 animate-pulse" />
                                    </div>
                                    <div className="flex-1 min-w-0 space-y-2">
                                      <div className="flex items-center justify-between mb-1">
                                        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                        <div className="flex items-center gap-2 ml-2">
                                          <div className="flex items-center gap-1">
                                            <div className="h-3 w-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                            <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                          </div>
                                          <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                        </div>
                                      </div>
                                      <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : filteredConversations.length === 0 ? (
                          <div className="h-full flex items-center justify-center">
                            <div className="text-center">
                              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                              <p className="text-gray-500 dark:text-gray-400">
                                {searchQuery ? "No conversations match your search" : "No conversations yet"}
                              </p>
                            </div>
                          </div>
                        ) : (
                          filteredConversations.map((conversation: any) => {
                            const lastMessage = conversation.messages?.[conversation.messages.length - 1];
                            const isSelected = selectedChatId === conversation.id;

                            return (
                              <div
                                key={conversation.id}
                                className={`p-4 border-b cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group border-l-4 ${
                                  isSelected
                                    ? "bg-blue-50 dark:bg-blue-900/20 border-l-primary"
                                    : "border-l-transparent hover:border-l-primary"
                                }`}
                                onClick={() => navigate(`/chat/${conversation.id}`)}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex items-start gap-3 flex-1 min-w-0">
                                    <div className="flex-shrink-0 mt-1">
                                      {conversation.chatbot?.iconUrl ? (
                                        <img
                                          src={`${import.meta.env.VITE_API_URL || "http://localhost:4001"}${conversation.chatbot.iconUrl}`}
                                          alt={conversation.chatbot.name || "Bot"}
                                          className="h-8 w-8 rounded-md border"
                                        />
                                      ) : (
                                        <div className="h-8 w-8 rounded-md border bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                          <Bot className="h-5 w-5 text-blue-600" />
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between mb-1">
                                        <h3 className="font-medium text-sm truncate">
                                          {conversation.chatbot?.name || "Assistant"}
                                        </h3>
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
                          })
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Panel - Chat Messages (Outlet) */}
            <div className="flex-1 min-h-0">
              <Outlet />
            </div>
          </div>
        </div>
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
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700" disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ChatLayout;

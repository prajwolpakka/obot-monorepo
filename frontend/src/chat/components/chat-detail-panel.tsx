import { ScrollArea } from "@/common/components/ui/scroll-area";
import MarkdownMessage from "@/common/components/ui/markdown-message";
import { Bot, MessageSquare, User } from "lucide-react";

interface ChatDetailPanelProps {
  chatbotId: string | null;
}

const ChatDetailPanel = ({ chatbotId }: ChatDetailPanelProps) => {
  // Mock chat details based on chatId
  const getChatDetails = (id: string) => {
    const chats = {
      "1": {
        title: "Customer Support - Product Issue",
        chatbotName: "Support Bot",
        messages: [
          {
            id: "1",
            content: "Hello! I'm having trouble with my billing.",
            role: "user",
            timestamp: "2024-01-20T10:15:00Z",
          },
          {
            id: "2",
            content:
              "I'd be happy to help you with your billing issue. Can you please provide more details about the specific problem you're experiencing?",
            role: "bot",
            timestamp: "2024-01-20T10:16:00Z",
          },
          {
            id: "3",
            content: "I was charged twice for the same subscription this month.",
            role: "user",
            timestamp: "2024-01-20T10:17:00Z",
          },
          {
            id: "4",
            content:
              "I understand your concern about the duplicate charge. Let me look into this for you. Can you please provide the transaction IDs or dates of both charges?",
            role: "bot",
            timestamp: "2024-01-20T10:18:00Z",
          },
          {
            id: "5",
            content: "Thank you for helping me resolve the billing issue!",
            role: "user",
            timestamp: "2024-01-20T10:30:00Z",
          },
        ],
      },
      "2": {
        title: "General Inquiry - Pricing",
        chatbotName: "Sales Bot",
        messages: [
          {
            id: "1",
            content: "Hi, I'm interested in your pricing plans.",
            role: "user",
            timestamp: "2024-01-20T09:00:00Z",
          },
          {
            id: "2",
            content:
              "Great! I'd be happy to help you understand our pricing options. We offer three main plans: Basic, Pro, and Enterprise. What type of usage are you planning?",
            role: "bot",
            timestamp: "2024-01-20T09:01:00Z",
          },
          {
            id: "3",
            content: "Can you tell me more about the enterprise plan?",
            role: "user",
            timestamp: "2024-01-20T09:15:00Z",
          },
        ],
      },
      "3": {
        title: "Technical Support - API Integration",
        chatbotName: "Tech Bot",
        messages: [
          {
            id: "1",
            content: "I need help integrating your API into my application.",
            role: "user",
            timestamp: "2024-01-19T16:30:00Z",
          },
          {
            id: "2",
            content:
              "I'd be happy to help with your API integration! What programming language are you using, and have you reviewed our API documentation?",
            role: "bot",
            timestamp: "2024-01-19T16:31:00Z",
          },
          {
            id: "3",
            content: "I'm using Node.js. I've looked at the docs but I'm having trouble with authentication.",
            role: "user",
            timestamp: "2024-01-19T16:32:00Z",
          },
          {
            id: "4",
            content: "The API documentation was very helpful, thanks!",
            role: "user",
            timestamp: "2024-01-19T16:45:00Z",
          },
        ],
      },
      "4": {
        title: "Feature Request - Dashboard",
        chatbotName: "Support Bot",
        messages: [
          {
            id: "1",
            content: "I have a suggestion for improving the dashboard.",
            role: "user",
            timestamp: "2024-01-19T14:00:00Z",
          },
          {
            id: "2",
            content: "We'd love to hear your feedback! What improvements would you like to see in the dashboard?",
            role: "bot",
            timestamp: "2024-01-19T14:01:00Z",
          },
          {
            id: "3",
            content: "When will the new dashboard features be available?",
            role: "user",
            timestamp: "2024-01-19T14:20:00Z",
          },
        ],
      },
    };
    return chats[id as keyof typeof chats];
  };

  if (!chatbotId) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900/50 rounded-lg">
        <div className="text-center space-y-6 p-8">
          <div className="w-20 h-20 mx-auto bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
            <MessageSquare className="h-10 w-10 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Select a conversation</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm">
              Choose a chat from the list to view the full conversation history and details.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const chatDetails = getChatDetails(chatbotId);

  if (!chatDetails) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">Chat not found</p>
      </div>
    );
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900 rounded-lg border">
      {/* Chat Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
            <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">{chatDetails.title}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{chatDetails.chatbotName}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-6">
        <div className="space-y-4 flex flex-col justify-end min-h-full">
          {chatDetails.messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "bot" && (
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
              )}
              <div className={`max-w-[70%] ${msg.role === "user" ? "order-first" : ""}`}>
                <div
                  className={`p-3 rounded-lg ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                  }`}
                >
                  {msg.role === "bot" ? (
                    <MarkdownMessage content={msg.content} className="text-sm" />
                  ) : (
                    <p className="text-sm">{msg.content}</p>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formatTime(msg.timestamp)}</p>
              </div>
              {msg.role === "user" && (
                <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ChatDetailPanel;

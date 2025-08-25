import { IChat } from "@/chat/models/types";
import { Button } from "@/common/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import { Activity, ArrowRight, Bot, MessageCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

interface RecentConversationsProps {
  recentChats?: IChat[];
}

const RecentConversations = ({ recentChats }: RecentConversationsProps) => {
  const navigate = useNavigate();

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-lg">
            <Activity className="h-5 w-5" />
            Recent Conversations
          </CardTitle>
          <Link to="/chat">
            <Button variant="ghost" size="sm" className="hover:bg-gray-100">
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div style={{ height: "400px" }} className="flex items-center justify-center">
          {recentChats && recentChats.length > 0 ? (
            <div style={{ height: "400px", overflowY: "auto" }} className="w-full">
              <div className="space-y-4">
                {recentChats.slice(0, 10).map((chat) => (
                  <div
                    key={chat.id}
                    className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                    onClick={() => navigate(`/chat/${chat.id}`)}
                  >
                    <div className="flex items-center gap-2 mt-1 flex-shrink-0">
                      {chat.chatbot.iconUrl ? (
                        <img
                          src={chat.chatbot.iconUrl}
                          alt={`${chat.chatbot.name} icon`}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: chat.chatbot.color }}
                        >
                          <Bot className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{chat.chatbot.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {new Date(chat.startedAt).toLocaleDateString()} • {chat.messages.length} messages
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center">
              <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-6" />
              <p className="text-gray-500 dark:text-gray-400 text-sm">No conversations yet</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentConversations;

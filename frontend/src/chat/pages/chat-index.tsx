import { Card, CardContent } from "@/common/components/ui/card";
import { MessageSquare } from "lucide-react";

const ChatIndexPage = () => {
  return (
    <Card className="h-full flex items-center justify-center">
      <CardContent className="text-center">
        <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
        <p className="text-gray-500 dark:text-gray-400">
          Choose a conversation from the list to view its messages
        </p>
      </CardContent>
    </Card>
  );
};

export default ChatIndexPage;
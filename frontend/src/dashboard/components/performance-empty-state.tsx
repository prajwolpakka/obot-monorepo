import { Bot } from "lucide-react";

const PerformanceEmptyState = () => {
  return (
    <div className="text-center py-12">
      <Bot className="h-16 w-16 text-gray-400 mx-auto mb-6" />
      <p className="text-gray-500 dark:text-gray-400 text-sm">No chatbots yet</p>
    </div>
  );
};

export default PerformanceEmptyState;

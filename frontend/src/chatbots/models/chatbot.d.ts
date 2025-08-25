interface IChatOptions {
  apiKey: string;
  initialMessage?: string;
  placeholder?: string;
  chatbotName?: string;
  containerId?: string;
  width?: string;
  height?: string;
  color?: string;
  imageUrl?: string;
  defaultOpen?: boolean;
  triggers: string[];
  chatbotId: string;
  mode: "demo" | "production";
}

interface ChatbotInstance {
  updateTriggers: (newTriggers: string[]) => void;
  updateImage: (newImageUrl?: string) => void;
  updateChatbotName: (newName: string) => void;
  updateColor: (newColor: string) => void;
  updatePlaceholder: (newPlaceholder: string) => void;
  updateWelcomeMessage: (newMessage: string) => void;
}

interface Chatbot {
  instance: ChatbotInstance | null;
  init: (options: IChatOptions) => ChatbotInstance;
  updateTriggers: (newTriggers: string[]) => void;
  updateImage: (newImageUrl?: string) => void;
  updateChatbotName: (newName: string) => void;
  updateColor: (newColor: string) => void;
  updatePlaceholder: (newPlaceholder: string) => void;
  updateWelcomeMessage: (newMessage: string) => void;
}

interface Window {
  Chatbot?: Chatbot;
}

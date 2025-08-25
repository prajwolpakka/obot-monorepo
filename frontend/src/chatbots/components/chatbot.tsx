import { useEffect, useRef } from "react";

const ChatbotComponent = ({
  apiKey,
  chatbotId = "preview",
  initialMessage = "Hello! How can I help you?",
  containerId = "chat-interface",
  width = "100%",
  height = "100%",
  color = "teal",
  chatbotName = "Chatbot Name",
  placeholder = "Type your message here...",
  imageUrl,
  defaultOpen,
  triggers,
  mode = "demo",
}: {
  apiKey: string;
  chatbotId?: string;
  initialMessage?: string;
  containerId?: string;
  width?: string;
  height?: string;
  color?: string;
  chatbotName?: string;
  placeholder?: string;
  imageUrl?: string;
  defaultOpen?: boolean;
  triggers: string[];
  mode?: "demo" | "production";
}) => {
  const chatbotInitialized = useRef(false);
  const prevTriggers = useRef<string[]>([]);

  useEffect(() => {
    if (window.Chatbot && !chatbotInitialized.current) {
      window.Chatbot.init({
        apiKey,
        chatbotId,
        containerId,
        initialMessage,
        width,
        height,
        color,
        chatbotName,
        placeholder,
        imageUrl,
        defaultOpen,
        triggers,
        mode,
      });
      chatbotInitialized.current = true;
      prevTriggers.current = [...triggers];

      // Ensure triggers are set after initialization
      setTimeout(() => {
        if (window.Chatbot && window.Chatbot.updateTriggers) {
          window.Chatbot.updateTriggers(triggers);
        }
      }, 100);
    } else if (!window.Chatbot) {
      console.error("Chatbot script not loaded. Ensure the chatbot.js file is accessible.");
    }

    return () => {
      const container = document.getElementById(containerId);
      if (container) {
        container.innerHTML = "";
      }
      chatbotInitialized.current = false;
      if (window.Chatbot) {
        window.Chatbot.instance = null;
      }
    };
  }, [containerId]); // Only reinitialize if containerId changes

  // Handle dynamic updates without reinitializing
  useEffect(() => {
    if (chatbotInitialized.current && window.Chatbot) {
      if (window.Chatbot.updateImage) {
        window.Chatbot.updateImage(imageUrl);
      }
    }
  }, [imageUrl]);

  useEffect(() => {
    if (chatbotInitialized.current && window.Chatbot) {
      if (window.Chatbot.updateChatbotName) {
        window.Chatbot.updateChatbotName(chatbotName);
      }
    }
  }, [chatbotName]);

  useEffect(() => {
    if (chatbotInitialized.current && window.Chatbot) {
      if (window.Chatbot.updateColor) {
        window.Chatbot.updateColor(color);
      }
    }
  }, [color]);

  useEffect(() => {
    if (chatbotInitialized.current && window.Chatbot) {
      if (window.Chatbot.updatePlaceholder) {
        window.Chatbot.updatePlaceholder(placeholder);
      }
    }
  }, [placeholder]);

  useEffect(() => {
    if (chatbotInitialized.current && window.Chatbot) {
      if (window.Chatbot.updateWelcomeMessage) {
        window.Chatbot.updateWelcomeMessage(initialMessage);
      }
    }
  }, [initialMessage]);

  useEffect(() => {
    if (chatbotInitialized.current && window.Chatbot) {
      if (window.Chatbot.updateTriggers) {
        window.Chatbot.updateTriggers(triggers);
      }
    }
  }, [triggers]);

  return <div id={containerId} className="h-[100%] w-[100%]" />;
};

export default ChatbotComponent;

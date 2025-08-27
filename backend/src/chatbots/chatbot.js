(function () {
  // Prevent duplicate loading
  if (window.Chatbot) return;

  // Load socket.io if not already loaded
  if (!window.io) {
    const script = document.createElement("script");
    script.src = "https://cdn.socket.io/4.7.2/socket.io.min.js";
    script.onload = function () {
      console.log("Socket.IO loaded");
    };
    document.head.appendChild(script);
  }

  // Chatbot class
  function Chatbot(options) {
    // Core required props
    this.chatbotId = options.chatbotId || null;

    // Demo mode props (only used when mode === 'demo')
    this.demoProps = {
      imageUrl: options.imageUrl || null,
      initialMessage: options.initialMessage || "Hello! How can I help you?",
      placeholder: options.placeholder || "Type a message...",
      color: options.color || "#4A2C7E",
      chatbotName: options.chatbotName || "Chatbot",
      triggers: options.triggers || [],
    };

    // Determine mode based on chatbotId
    this.mode = this.chatbotId && this.chatbotId !== "preview" ? "production" : "demo";

    // Default config (will be overridden by socket in production mode)
    this.config = {
      imageUrl: null,
      initialMessage: "Hello! How can I help you?",
      placeholder: "Type a message...",
      color: "#4A2C7E",
      chatbotName: "Chatbot",
      triggers: [],
    };

    // UI props
    this.containerId = options.containerId || "chat-interface";
    this.width = options.width || "350px";
    this.height = options.height || "500px";
    this.defaultOpen = options.defaultOpen || false;
    this.socketUrl = options.socketUrl || "http://localhost:4001";

    // Internal state
    this.messages = [];
    this.sessionId = this.generateSessionId();
    this.configLoaded = false;
  
    // Rate limiting
    this.lastRequestTime = 0;
    this.minRequestInterval = 10000; // 10 seconds between requests (Gemini has better limits)
    this.isRateLimited = false;

    // DOM references
    this.container = null;
    this.messagesDiv = null;
    this.input = null;
    this.sendButton = null;
    this.toggleButton = null;
    this.closeButton = null;
    this.chatWindow = null;
    this.triggerArea = null;
    this.socket = null;

    this.init();
  }

  // Generate or retrieve session ID from localStorage
  Chatbot.prototype.generateSessionId = function () {
    // For demo mode, use a simple session ID
    if (this.mode === "demo") {
      return "demo_session_" + Date.now();
    }

    // For production mode, use persistent session ID
    const storageKey = `chatbot_session_${this.chatbotId}`;
    let sessionId = localStorage.getItem(storageKey);

    if (!sessionId) {
      sessionId = "session_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
      localStorage.setItem(storageKey, sessionId);
    }

    return sessionId;
  };

  // Initialize the chatbot
  Chatbot.prototype.init = function () {
    this.container = document.getElementById(this.containerId);
    if (!this.container) {
      console.error(`Chatbot container "${this.containerId}" not found`);
      return;
    }

    // For production mode, show loading state and wait for config
    if (this.mode === "production") {
      this.showLoadingState();
      this.initSocket();
    } else {
      // For demo mode, render immediately
      this.handleDemoMode();
    }
  };

  // Show loading state while waiting for config
  Chatbot.prototype.showLoadingState = function () {
    this.container.innerHTML = `
      <div class="chatbot-loading" style="
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 60px;
        height: 60px;
        background-color: transparent;
        border: 2px solid rgba(74, 44, 126, 0.3);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        backdrop-filter: blur(10px);
      ">
        <div style="
          width: 20px;
          height: 20px;
          border: 2px solid rgba(74, 44, 126, 0.6);
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        "></div>
      </div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `;
  };

  // Initialize socket connection
  Chatbot.prototype.initSocket = function () {
    // Check if chatbotId is provided to determine mode
    if (!this.chatbotId || this.chatbotId === "preview") {
      this.mode = "demo";
      this.handleDemoMode();
      return;
    }

    // Production mode - connect to socket
    this.mode = "production";

    if (!window.io) {
      console.warn("Socket.IO not loaded yet, retrying...");
      setTimeout(() => this.initSocket(), 100);
      return;
    }

    this.socket = window.io(this.socketUrl, {
      transports: ["websocket", "polling"],
      timeout: 5000,
    });

    this.socket.on("connect", () => {
      console.log("Connected to chat server");
      // Join the chatbot room
      this.socket.emit("join-chat", {
        chatbotId: this.chatbotId,
        sessionId: this.sessionId,
      });

      // Request chatbot configuration
      this.socket.emit("get-chatbot-config", {
        chatbotId: this.chatbotId,
      });
    });

    this.socket.on("disconnect", () => {
      console.log("Disconnected from chat server");
    });

    // Handle chatbot configuration response
    this.socket.on("chatbot-config", (data) => {
      console.log("Received chatbot config:", data);
      this.config = {
        imageUrl: data.iconUrl || null,
        initialMessage: data.welcomeMessage || "Hello! How can I help you?",
        placeholder: data.placeholder || "Type a message...",
        color: data.color || "#4A2C7E",
        chatbotName: data.name || "Chatbot",
        triggers: data.triggers ? data.triggers.map((t) => t.value) : [],
      };
      this.configLoaded = true;

      // Now render the UI with the loaded config
      this.renderChatbotUI();
      this.updateUIWithConfig();

      // Request chat history after config is loaded
      this.socket.emit("get-chat-history", {
        chatbotId: this.chatbotId,
        sessionId: this.sessionId,
      });
    });

    this.socket.on("chatbot-config-error", (data) => {
      console.error("Failed to load chatbot config:", data.error);
      this.configLoaded = true; // Use defaults

      // Render UI with default config
      this.renderChatbotUI();
      this.updateUIWithConfig();
    });

    // Handle streaming response start
    this.socket.on("message-start", (data) => {
      // Remove thinking indicator and immediately show message container
      this.removeThinkingIndicator();
      this.startStreamingMessage(data.messageId, data.timestamp);
    });

    // Handle streaming chunks
    this.socket.on("message-chunk", (data) => {
      this.updateStreamingMessage(data.messageId, data.chunk, data.fullResponse);
    });

    // Handle streaming completion
    this.socket.on("message-complete", (data) => {
      this.completeStreamingMessage(data.messageId, data.finalContent);
    });

    // Fallback for non-streaming responses (backward compatibility)
    this.socket.on("message-response", (data) => {
      this.removeThinkingIndicator();
      this.addMessageWithReferences("Bot", data.message);
    });

    this.socket.on("chat-history", (data) => {
      console.log("Received chat history:", data.messages.length, "messages");
      this.loadChatHistory(data.messages);
    });

    this.socket.on("chat-history-error", (data) => {
      console.error("Failed to load chat history:", data.error);
    });

    this.socket.on("message-error", (data) => {
      this.removeThinkingIndicator();

      // Check if it's a rate limit error
      if (data.error && data.error.includes("429")) {
        this.addMessageWithReferences("Bot", "🚦 Rate limit reached! Please wait a moment before sending another message.");
        // Temporarily increase rate limit interval
        this.minRequestInterval = Math.min(this.minRequestInterval * 2, 120000); // Max 2 minutes
      } else {
        this.addMessageWithReferences("Bot", "Sorry, something went wrong! Please try again.");
      }

      console.error("Chat error:", data.error);
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      this.removeLoadingIndicator();
      this.addMessage("Bot", "Connection error. Please try again.");
    });
  };

  // Handle demo mode setup
  Chatbot.prototype.handleDemoMode = function () {
    console.log("Running in demo mode");
    this.config = { ...this.demoProps };
    this.configLoaded = true;

    // Render UI immediately in demo mode
    this.renderChatbotUI();
    this.updateUIWithConfig();

    // Add initial message for demo
    if (this.config.initialMessage) {
      this.addMessage("Bot", this.config.initialMessage);
    }

    this.updateTriggerButtons();
  };

  // Update UI with loaded configuration
  Chatbot.prototype.updateUIWithConfig = function () {
    if (!this.configLoaded) return;

    // Update color elements
    const header = this.container.querySelector(".chat-header");
    const toggleButton = this.container.querySelector(".chat-toggle");
    const sendButton = this.container.querySelector(".chat-send svg path");

    if (header) header.style.backgroundColor = this.config.color;
    if (toggleButton) toggleButton.style.backgroundColor = this.config.color;
    if (sendButton) sendButton.setAttribute("fill", this.config.color);

    // Update chatbot name
    const titleElement = this.container.querySelector(".chat-header-title");
    if (titleElement) titleElement.textContent = this.config.chatbotName;

    // Update placeholder
    const inputElement = this.container.querySelector(".chat-input");
    if (inputElement) inputElement.placeholder = this.config.placeholder;

    // Update image
    const chatIcon = this.container.querySelector(".chat-icon");
    if (chatIcon) {
      if (this.config.imageUrl) {
        let imageUrl = this.config.imageUrl;
        // Fix relative URLs by prepending backend URL
        if (imageUrl.startsWith('/api/')) {
          const backendUrl = this.socketUrl.replace('/socket.io/', '');
          imageUrl = backendUrl + imageUrl;
        }
        chatIcon.innerHTML = `<img src="${imageUrl}" alt="Chat Icon" style="width: 100%; height: 100%; object-fit: cover;" />`;
      } else {
        chatIcon.innerHTML = "";
      }
    }

    // Update trigger hover color
    this.updateTriggerHoverColor(this.config.color);

    // Update ALL existing user messages color (important for production mode)
    this.updateAllUserMessageColors();
  };

  // Update all user message colors
  Chatbot.prototype.updateAllUserMessageColors = function () {
    const userMessages = this.container.querySelectorAll(".user-message .message-content");
    let color;

    if (this.mode === "demo") {
      color = this.demoProps.color;
    } else if (this.config && this.config.color) {
      // Use config color if it exists, regardless of configLoaded state
      color = this.config.color;
    } else {
      color = "#4A2C7E"; // fallback
    }

    console.log("updateAllUserMessageColors:", {
      mode: this.mode,
      configLoaded: this.configLoaded,
      configColor: this.config?.color,
      demoColor: this.demoProps?.color,
      finalColor: color,
      messageCount: userMessages.length,
    });

    userMessages.forEach((msg) => {
      msg.style.backgroundColor = color;
      msg.style.color = "white";
    });
  };

  // Load chat history from server
  Chatbot.prototype.loadChatHistory = function (messages) {
    // Clear existing messages first (except initial message)
    this.messages = [];
    this.messagesDiv.innerHTML = "";

    // Add initial message if it exists and no history
    if (this.config.initialMessage && messages.length === 0) {
      this.addMessage("Bot", this.config.initialMessage);
    }

    // Load historical messages
    messages.forEach((msg) => {
      const sender = msg.sender === "user" ? "You" : "Bot";
      this.addMessage(sender, msg.content);
    });

    // Update user message colors after loading history
    this.updateAllUserMessageColors();

    // Update triggers after loading history
    this.updateTriggerButtons();

    // Scroll to bottom
    this.messagesDiv.scrollTop = this.messagesDiv.scrollHeight;
  };

  // Clear chat history and session
  Chatbot.prototype.clearChatHistory = function () {
    // For demo mode, just reset the chat state
    if (this.mode === "demo") {
      this.resetChatState();
      return;
    }

    // For production mode, clear localStorage and reconnect
    const storageKey = `chatbot_session_${this.chatbotId}`;
    localStorage.removeItem(storageKey);

    // Generate new session ID
    this.sessionId = this.generateSessionId();

    // Reset chat state
    this.resetChatState();

    // Reconnect with new session
    if (this.socket && this.socket.connected) {
      this.socket.emit("join-chat", {
        chatbotId: this.chatbotId,
        sessionId: this.sessionId,
      });
    }
  };

  // Reset chat state - clear messages and show initial state
  Chatbot.prototype.resetChatState = function () {
    // Clear messages array
    this.messages = [];

    // Clear messages from UI
    this.messagesDiv.innerHTML = "";

    // Add initial message if it exists
    if (this.config.initialMessage) {
      this.addMessage("Bot", this.config.initialMessage);
    }
  };

  // Update triggers dynamically
  Chatbot.prototype.updateTriggers = function (newTriggers) {
    this.config.triggers = newTriggers || [];
    this.resetChatState();
    this.updateTriggerButtons();
  };

  // Update image dynamically
  Chatbot.prototype.updateImage = function (newImageUrl) {
    this.config.imageUrl = newImageUrl;
    const chatIcon = this.container.querySelector(".chat-icon");
    if (chatIcon) {
      if (newImageUrl) {
        chatIcon.innerHTML = `<img src="${newImageUrl}" alt="Chat Icon" style="width: 100%; height: 100%; object-fit: cover;" />`;
      } else {
        chatIcon.innerHTML = "";
      }
    }
  };

  // Update chatbot name dynamically
  Chatbot.prototype.updateChatbotName = function (newName) {
    this.config.chatbotName = newName;
    const titleElement = this.container.querySelector(".chat-header-title");
    if (titleElement) {
      titleElement.textContent = newName;
    }
  };

  // Update color dynamically
  Chatbot.prototype.updateColor = function (newColor) {
    this.config.color = newColor;
    const header = this.container.querySelector(".chat-header");
    const toggleButton = this.container.querySelector(".chat-toggle");
    const sendButton = this.container.querySelector(".chat-send svg path");

    if (header) header.style.backgroundColor = newColor;
    if (toggleButton) toggleButton.style.backgroundColor = newColor;
    if (sendButton) sendButton.setAttribute("fill", newColor);

    // Update existing user messages
    const userMessages = this.container.querySelectorAll(".user-message .message-content");
    userMessages.forEach((msg) => {
      msg.style.backgroundColor = newColor;
      msg.style.color = "white";
    });

    // Update trigger hover color by updating CSS custom property
    this.updateTriggerHoverColor(newColor);
  };

  // Update trigger hover color
  Chatbot.prototype.updateTriggerHoverColor = function (color) {
    // Remove existing trigger hover style if it exists
    let existingStyle = document.getElementById("chatbot-trigger-hover-style");
    if (existingStyle) {
      existingStyle.remove();
    }

    // Create new style element with updated hover color
    const style = document.createElement("style");
    style.id = "chatbot-trigger-hover-style";
    style.textContent = `
      #${this.containerId} .trigger-text:hover {
        background-color: ${color} !important;
        color: white !important;
      }
    `;
    document.head.appendChild(style);
  };

  // Update placeholder dynamically
  Chatbot.prototype.updatePlaceholder = function (newPlaceholder) {
    this.config.placeholder = newPlaceholder;
    const inputElement = this.container.querySelector(".chat-input");
    if (inputElement) {
      inputElement.placeholder = newPlaceholder;
    }
  };

  // Update welcome message dynamically
  Chatbot.prototype.updateWelcomeMessage = function (newMessage) {
    this.config.initialMessage = newMessage;
    // Find and update the first bot message if it exists
    const firstBotMessage = this.container.querySelector(".bot-message .message-content");
    if (firstBotMessage && this.messages.length > 0 && this.messages[0].sender === "Bot") {
      firstBotMessage.textContent = newMessage;
      this.messages[0].text = newMessage;
    }
  };

  // Update trigger buttons in the UI
  Chatbot.prototype.updateTriggerButtons = function () {
    const triggerContainer = this.container.querySelector(".trigger-container");
    const hasUserMessages = this.messages.some((msg) => msg.sender === "You");

    // Filter out empty triggers
    const validTriggers = this.config.triggers.filter((trigger) => trigger && trigger.trim() !== "");

    if (triggerContainer && validTriggers.length > 0 && !hasUserMessages) {
      triggerContainer.innerHTML = "";
      validTriggers.forEach((trigger) => {
        const span = document.createElement("span");
        span.classList.add("trigger-text");
        span.textContent = trigger;
        span.addEventListener("click", () => {
          this.addMessage("You", trigger);
          this.hideTriggerArea();

          // Ensure user message has correct color immediately
          setTimeout(() => this.updateAllUserMessageColors(), 10);

          // In demo mode, show demo response
          if (this.mode === "demo") {
            setTimeout(() => {
              this.addMessageWithTyping("Bot", "🚀 This is preview mode. After integration, you'll get AI responses!");
            }, 500);
          }
        });
        triggerContainer.appendChild(span);
      });
      this.triggerArea.style.display = "block";
      this.adjustMessagesHeight(true);
    } else {
      this.triggerArea.style.display = "none";
      if (triggerContainer) {
        triggerContainer.innerHTML = "";
      }
      this.adjustMessagesHeight(false);
    }
  };

  // Generate the chat header template
  Chatbot.prototype.getHeaderTemplate = function () {
    const color = this.configLoaded ? this.config.color : this.mode === "demo" ? this.demoProps.color : "#4A2C7E";
    const chatbotName = this.configLoaded
      ? this.config.chatbotName
      : this.mode === "demo"
      ? this.demoProps.chatbotName
      : "Chatbot";
    const imageUrl = this.configLoaded ? this.config.imageUrl : this.mode === "demo" ? this.demoProps.imageUrl : null;

    return `
      <div class="chat-header" style="background-color: ${color}">
        <div class="chat-header-content">
          <div class="chat-icon">
            ${
              imageUrl
                ? `<img src="${imageUrl}" alt="Chat Icon" style="width: 100%; height: 100%; object-fit: cover;" />`
                : ""
            }
          </div>
          <span class="chat-header-title">${chatbotName}</span>
        </div>
        <span class="chat-close">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </span>
      </div>
    `;
  };

  // Generate the chat messages area
  Chatbot.prototype.getMessagesTemplate = function () {
    return `
      <div class="chat-messages" style="height: calc(100% - 115px);">
      </div>
      <div class="chat-trigger-area" style="display: none;">
        <div class="trigger-container"></div>
      </div>
    `;
  };

  // Generate the chat input area
  Chatbot.prototype.getInputAreaTemplate = function () {
    const color = this.configLoaded ? this.config.color : this.mode === "demo" ? this.demoProps.color : "#4A2C7E";
    const placeholder = this.configLoaded
      ? this.config.placeholder
      : this.mode === "demo"
      ? this.demoProps.placeholder
      : "Type a message...";

    return `
      <div class="chat-input-area">
        <input class="chat-input" placeholder="${placeholder}" aria-label="Chat input" />
        <button class="chat-send" aria-label="Send message">
          <svg width="19" height="16" viewBox="0 0 19 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 16V10L8 8L0 6V0L19 8L0 16Z" fill="${color}"/>
          </svg>
        </button>
      </div>
    `;
  };

  // Render the chatbot UI
  Chatbot.prototype.renderChatbotUI = function () {
    if (!this.container) {
      console.error(`Chatbot container "${this.containerId}" not found`);
      return;
    }

    const color = this.configLoaded ? this.config.color : this.mode === "demo" ? this.demoProps.color : "#4A2C7E";

    const floatingContainer = `
      <button class="chat-toggle" style="background-color: ${color};" aria-label="Toggle chat">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
        </svg>
      </button>
      <div class="chat-window" style="width: ${this.width}; height: ${this.height};">
        ${this.getHeaderTemplate()}
        ${this.getMessagesTemplate()}
        ${this.getInputAreaTemplate()}
      </div>
    `;

    this.container.innerHTML = floatingContainer;

    // Initialize DOM references
    this.toggleButton = this.container.querySelector(".chat-toggle");
    this.closeButton = this.container.querySelector(".chat-close");
    this.chatWindow = this.container.querySelector(".chat-window");
    if (this.defaultOpen) this.chatWindow.classList.add("visible");

    this.messagesDiv = this.container.querySelector(".chat-messages");
    this.input = this.container.querySelector(".chat-input");
    this.sendButton = this.container.querySelector(".chat-send");
    this.triggerArea = this.container.querySelector(".chat-trigger-area");

    // Event listeners
    this.toggleButton.addEventListener("click", this.toggleChat.bind(this));
    if (this.closeButton) {
      this.closeButton.addEventListener("click", this.toggleChat.bind(this));
    }

    this.input.addEventListener("keypress", this.handleInput.bind(this));
    this.sendButton.addEventListener("click", this.handleSend.bind(this));

    // Setup triggers
    this.updateTriggerButtons();

    // Initialize trigger hover color
    const initialColor = this.configLoaded
      ? this.config.color
      : this.mode === "demo"
      ? this.demoProps.color
      : "#4A2C7E";
    this.updateTriggerHoverColor(initialColor);
  };

  // Hide the trigger area
  Chatbot.prototype.hideTriggerArea = function () {
    this.triggerArea.style.display = "none";
    this.adjustMessagesHeight(false);
  };

  // Adjust messages height based on trigger visibility
  Chatbot.prototype.adjustMessagesHeight = function (triggersVisible) {
    const messagesDiv = this.container.querySelector(".chat-messages");
    if (messagesDiv) {
      const height = triggersVisible ? "calc(100% - 170px)" : "calc(100% - 115px)";
      messagesDiv.style.height = height;
    }
  };

  // Send a message
  Chatbot.prototype.sendMessage = function () {
    const userMessage = this.input.value.trim();
    if (!userMessage) return;

    // Check rate limiting
    const now = Date.now();
    if (now - this.lastRequestTime < this.minRequestInterval) {
      const waitTime = this.minRequestInterval - (now - this.lastRequestTime);
      const waitSeconds = Math.ceil(waitTime / 1000);

      if (!this.isRateLimited) {
        this.isRateLimited = true;
        this.addMessage("Bot", `⏱️ Please wait ${waitSeconds} seconds before sending another message to avoid rate limits.`);
        this.input.value = "";

        // Re-enable input after wait time
        setTimeout(() => {
          this.isRateLimited = false;
          this.addMessage("Bot", "You can now send another message! 💬");
        }, waitTime);
      }
      return;
    }

    this.lastRequestTime = now;
    this.addMessage("You", userMessage);
    this.hideTriggerArea();

    // Ensure user message has correct color immediately
    setTimeout(() => this.updateAllUserMessageColors(), 10);

    // Handle based on mode
    if (this.mode === "demo") {
      // Demo mode - show preview message
      setTimeout(() => {
        this.addMessageWithTyping("Bot", "🚀 This is preview mode. After integration, you'll get AI responses!");
      }, 500);
    } else {
      // Production mode - show thinking indicator immediately
      this.showThinkingIndicator();

      if (this.socket && this.socket.connected) {
        this.socket.emit("send-message", {
          message: userMessage,
          chatbotId: this.chatbotId,
          sessionId: this.sessionId,
        });
      } else {
        // Fallback if socket not connected
        console.warn("Socket not connected, using fallback");
        setTimeout(() => {
          this.removeThinkingIndicator();
          this.addMessageWithTyping(
            "Bot",
            `Thanks for your message! You said: "${userMessage}". I'm currently in offline mode, but I'd love to help you when I'm back online. Please try again in a moment or check your internet connection.`
          );
        }, 1000);
      }
    }

    this.input.value = "";
  };

  // Show thinking indicator as a message box
  Chatbot.prototype.showThinkingIndicator = function () {
    // Remove any existing thinking indicator
    this.removeThinkingIndicator();

    // Create a thinking indicator that looks like a message box
    const thinkingIndicator = document.createElement("div");
    thinkingIndicator.classList.add("message-container", "bot-message", "thinking-container");
    thinkingIndicator.id = "thinking-indicator";
    thinkingIndicator.innerHTML = `
      <div class="message-content thinking-message">
        <div class="thinking-indicator">
          <span class="thinking-spinner" style="
            display: inline-block;
            width: 16px;
            height: 16px;
            border: 2px solid #666;
            border-top-color: transparent;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          "></span>
          <span class="thinking-text">Thinking...</span>
        </div>
      </div>
    `;

    this.messagesDiv.appendChild(thinkingIndicator);
    this.messagesDiv.scrollTop = this.messagesDiv.scrollHeight;
  };

  // Remove thinking indicator
  Chatbot.prototype.removeThinkingIndicator = function () {
    const thinkingIndicator = this.messagesDiv.querySelector("#thinking-indicator");
    if (thinkingIndicator) {
      thinkingIndicator.remove();
    }
  };

  // Start streaming message
  Chatbot.prototype.startStreamingMessage = function (messageId, timestamp) {
    // Remove typing indicator
    const typingIndicator = this.messagesDiv.querySelector("#typing-indicator");
    if (typingIndicator) {
      typingIndicator.remove();
    }

    // Create streaming message container
    const messageElement = document.createElement("div");
    messageElement.classList.add("message-container", "bot-message");
    messageElement.id = `streaming-${messageId}`;

    // Get the appropriate color
    let color;
    if (this.config && this.config.color) {
      color = this.config.color;
    } else {
      color = "#4A2C7E";
    }

    messageElement.innerHTML = `
      <div class="message-content" style="background-color: ${color}; color: white;">
        <span id="content-${messageId}"></span>
        <span id="cursor-${messageId}" class="typing-cursor">|</span>
      </div>
    `;

    this.messagesDiv.appendChild(messageElement);
    this.messagesDiv.scrollTop = this.messagesDiv.scrollHeight;

    // Add cursor blinking animation
    if (!document.getElementById("streaming-cursor-style")) {
      const style = document.createElement("style");
      style.id = "streaming-cursor-style";
      style.textContent = `
        @keyframes streaming-blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        .typing-cursor {
          animation: streaming-blink 1s infinite;
          font-weight: normal;
        }
      `;
      document.head.appendChild(style);
    }
  };

  // Update streaming message with new chunk
  Chatbot.prototype.updateStreamingMessage = function (messageId, chunk, fullResponse) {
    const contentElement = document.getElementById(`content-${messageId}`);
    if (contentElement) {
      contentElement.textContent = fullResponse;
      // Scroll to bottom
      this.messagesDiv.scrollTop = this.messagesDiv.scrollHeight;
    }
  };

  // Complete streaming message and add references
  Chatbot.prototype.completeStreamingMessage = function (messageId, finalContent) {
    // Remove cursor
    const cursorElement = document.getElementById(`cursor-${messageId}`);
    if (cursorElement) {
      cursorElement.remove();
    }

    // Update final content
    const contentElement = document.getElementById(`content-${messageId}`);
    if (contentElement) {
      // Parse and display with references
      const { answer, references } = this.parseResponseWithReferences(finalContent);

      // Update the content
      contentElement.textContent = answer;

      // Add references if they exist
      if (references && references.length > 0) {
        const messageElement = document.getElementById(`streaming-${messageId}`);
        const isUserMessage = false; // Bot message
        const shortRefs = references.map(ref => this.createShortReference(ref, isUserMessage)).join(' ');

        const referenceDiv = document.createElement("div");
        referenceDiv.classList.add("inline-references");
        referenceDiv.style.cssText = `
          margin-top: 8px;
          padding-top: 6px;
          border-top: 1px solid rgba(255,255,255,0.3);
          font-size: 11px;
          opacity: 0.85;
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          align-items: center;
        `;
        referenceDiv.innerHTML = shortRefs;

        messageElement.appendChild(referenceDiv);
      }

      // Scroll to bottom
      this.messagesDiv.scrollTop = this.messagesDiv.scrollHeight;
    }

    // Update triggers
    this.updateTriggerButtons();
  };

  // Toggle the chat window in floating mode
  Chatbot.prototype.toggleChat = function () {
    const isVisible = this.chatWindow.classList.contains("visible");
    this.chatWindow.classList.toggle("visible");
    this.toggleButton.style.transform = isVisible ? "scale(1)" : "scale(1.1)";
  };

  // Add a message with references support
  Chatbot.prototype.addMessageWithReferences = function (sender, text) {
    // Parse the response to separate answer from references
    const { answer, references } = this.parseResponseWithReferences(text);

    this.messages.push({ sender, text: answer, references });

    const messageClass = sender === "You" ? "user-message" : "bot-message";
    const messageElement = document.createElement("div");
    messageElement.classList.add("message-container", messageClass);

    // Get the appropriate color based on mode and config state
    let color;
    if (this.mode === "demo") {
      color = this.demoProps.color;
    } else if (this.config && this.config.color) {
      // Use config color if it exists, regardless of configLoaded state
      color = this.config.color;
    } else {
      color = "#4A2C7E"; // fallback
    }

    const backgroundStyle = sender === "You" ? `style="background-color: ${color}; color: white;"` : "";

    // Create the message content with inline references
    let messageContent = answer;

    // Add references inline if they exist
    if (references && references.length > 0) {
      const isUserMessage = sender === "You";
      const shortRefs = references.map(ref => this.createShortReference(ref, isUserMessage)).join(' ');

      // Different styling for bot vs user messages
      const referenceStyle = sender === "You"
        ? `border-top: 1px solid rgba(255,255,255,0.3); color: rgba(255,255,255,0.8);`
        : `border-top: 1px solid rgba(74,44,126,0.3); color: rgba(74,44,126,0.8);`;

      messageContent += `<div class="inline-references" style="
        margin-top: 8px;
        padding-top: 6px;
        ${referenceStyle}
        font-size: 11px;
        opacity: 0.85;
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        align-items: center;
      ">${shortRefs}</div>`;
    }

    const messageHTML = `<div class="message-content" ${backgroundStyle}>${messageContent}</div>`;

    messageElement.innerHTML = messageHTML;

    this.messagesDiv.appendChild(messageElement);
    this.messagesDiv.scrollTop = this.messagesDiv.scrollHeight;

    // Update triggers after adding message
    this.updateTriggerButtons();
  };

  // Create shortened reference with hover tooltip
  Chatbot.prototype.createShortReference = function (fullRef, isUserMessage = false) {
    // Extract filename from reference (assuming format like "Document Name (Page X)")
    const fileMatch = fullRef.match(/^([^(\n]+)/);
    const filename = fileMatch ? fileMatch[1].trim() : fullRef;

    // Create shortened version (lowercase, first 15 chars + extension if available)
    let shortName = filename.toLowerCase();

    // If it's longer than 15 chars, truncate and add extension if present
    if (shortName.length > 15) {
      const extMatch = filename.match(/\.([a-zA-Z0-9]+)$/);
      const extension = extMatch ? extMatch[1] : '';
      shortName = shortName.substring(0, 12) + '...' + (extension ? '.' + extension : '');
    }

    // Return as individual item with icon and proper spacing
    return `<span class="reference-item" title="${fullRef}" style="
      display: inline-flex;
      align-items: center;
      gap: 4px;
      cursor: help;
      border-bottom: 1px dotted rgba(255,255,255,0.5);
      padding: 2px 6px;
      border-radius: 3px;
      transition: opacity 0.2s ease;
      font-size: 10px;
    ">📄 ${shortName}</span>`;
  };

  // Parse response to separate answer from references
  Chatbot.prototype.parseResponseWithReferences = function (text) {
    // Look for the reference separator (---)
    const separatorIndex = text.indexOf('\n---\n');

    if (separatorIndex === -1) {
      // No references found, return the whole text as answer
      return { answer: text, references: null };
    }

    const answer = text.substring(0, separatorIndex).trim();
    const referencesText = text.substring(separatorIndex + 5).trim();

    // Parse references (assuming format: "Sources: [file1, file2, ...]")
    const references = [];
    if (referencesText.toLowerCase().startsWith('sources:')) {
      const sourcesText = referencesText.substring(8).trim();
      // Split by comma and clean up
      const sources = sourcesText.split(',').map(source => source.trim().replace(/^\[|\]$/g, ''));
      references.push(...sources);
    }

    return { answer, references };
  };

  // Add a message to the chat (legacy method)
  Chatbot.prototype.addMessage = function (sender, text) {
    this.messages.push({ sender, text });

    const messageClass = sender === "You" ? "user-message" : "bot-message";
    const messageElement = document.createElement("div");
    messageElement.classList.add("message-container", messageClass);

    // Get the appropriate color based on mode and config state
    let color;
    if (this.mode === "demo") {
      color = this.demoProps.color;
    } else if (this.config && this.config.color) {
      // Use config color if it exists, regardless of configLoaded state
      color = this.config.color;
    } else {
      color = "#4A2C7E"; // fallback
    }

    console.log("addMessage color logic:", {
      mode: this.mode,
      configLoaded: this.configLoaded,
      configColor: this.config?.color,
      demoColor: this.demoProps?.color,
      finalColor: color,
    });

    const backgroundStyle = sender === "You" ? `style="background-color: ${color}; color: white;"` : "";
    messageElement.innerHTML = `
      <div class="message-content" ${backgroundStyle}>${text}</div>
    `;

    this.messagesDiv.appendChild(messageElement);
    this.messagesDiv.scrollTop = this.messagesDiv.scrollHeight;

    // Update triggers after adding message
    this.updateTriggerButtons();
  };

  // Add a message with typing animation (like Gemini)
  Chatbot.prototype.addMessageWithTyping = function (sender, text) {
    this.messages.push({ sender, text });

    const messageClass = sender === "You" ? "user-message" : "bot-message";
    const messageElement = document.createElement("div");
    messageElement.classList.add("message-container", messageClass);

    // Get the appropriate color based on mode and config state
    let color;
    if (this.mode === "demo") {
      color = this.demoProps.color;
    } else if (this.config && this.config.color) {
      // Use config color if it exists, regardless of configLoaded state
      color = this.config.color;
    } else {
      color = "#4A2C7E"; // fallback
    }

    // Create message content div
    const messageContent = document.createElement("div");
    messageContent.classList.add("message-content");
    if (sender === "You") {
      messageContent.style.backgroundColor = color;
      messageContent.style.color = "white";
    }

    messageElement.appendChild(messageContent);
    this.messagesDiv.appendChild(messageElement);

    // Smooth character-by-character animation with natural pauses
    let currentIndex = 0;
    const baseSpeed = 25; // base milliseconds per character

    const typeWriter = () => {
      if (currentIndex < text.length) {
        const currentChar = text[currentIndex];
        let delay = baseSpeed;

        // Add natural pauses for punctuation
        if (currentChar === "." || currentChar === "!" || currentChar === "?") {
          delay = 300; // longer pause for sentence endings
        } else if (currentChar === "," || currentChar === ";") {
          delay = 150; // medium pause for commas
        } else if (currentChar === " ") {
          delay = 50; // short pause for spaces
        }

        messageContent.innerHTML =
          text.substring(0, currentIndex + 1) +
          '<span class="typing-cursor" style="animation: blink 1s infinite;">|</span>';
        currentIndex++;
        this.messagesDiv.scrollTop = this.messagesDiv.scrollHeight;
        setTimeout(typeWriter, delay);
      } else {
        // Remove cursor and show final text
        messageContent.innerHTML = text;
        this.updateTriggerButtons();
      }
    };

    // Add CSS for blinking cursor
    if (!document.getElementById("typing-cursor-style")) {
      const style = document.createElement("style");
      style.id = "typing-cursor-style";
      style.textContent = `
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        .typing-cursor {
          font-weight: normal;
          color: #666;
        }
      `;
      document.head.appendChild(style);
    }

    typeWriter();
  };

  // Show loading indicator
  Chatbot.prototype.showLoadingIndicator = function () {
    const loadingElement = document.createElement("div");
    loadingElement.classList.add("message-container", "bot-message", "loading-container");
    loadingElement.id = "chat-loading";
    loadingElement.innerHTML = `
      <div class="loading-indicator">
        <span style="display: inline-block; width: 16px; height: 16px; border: 2px solid #666; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite;"></span>
        <span class="loading-text">Thinking...</span>
      </div>
    `;
    this.messagesDiv.appendChild(loadingElement);
    this.messagesDiv.scrollTop = this.messagesDiv.scrollHeight;
  };

  // Remove loading indicator
  Chatbot.prototype.removeLoadingIndicator = function () {
    const loadingElement = this.messagesDiv.querySelector("#chat-loading");
    if (loadingElement) {
      loadingElement.remove();
    }
  };

  // Handle input keypress (Enter key)
  Chatbot.prototype.handleInput = function (e) {
    if (e.key === "Enter" && this.input.value.trim()) {
      this.sendMessage();
    }
  };

  // Handle send button click
  Chatbot.prototype.handleSend = function () {
    if (this.input.value.trim()) {
      this.sendMessage();
    }
  };

  // Expose the Chatbot to the global scope
  window.Chatbot = {
    instance: null,
    init: function (options = {}) {
      this.instance = new Chatbot(options);
      return this.instance;
    },
    updateTriggers: function (newTriggers) {
      if (this.instance) {
        this.instance.updateTriggers(newTriggers);
      }
    },
    updateImage: function (newImageUrl) {
      if (this.instance) {
        this.instance.updateImage(newImageUrl);
      }
    },
    updateChatbotName: function (newName) {
      if (this.instance) {
        this.instance.updateChatbotName(newName);
      }
    },
    updateColor: function (newColor) {
      if (this.instance) {
        this.instance.updateColor(newColor);
      }
    },
    updatePlaceholder: function (newPlaceholder) {
      if (this.instance) {
        this.instance.updatePlaceholder(newPlaceholder);
      }
    },
    updateWelcomeMessage: function (newMessage) {
      if (this.instance) {
        this.instance.updateWelcomeMessage(newMessage);
      }
    },
    clearChatHistory: function () {
      if (this.instance) {
        this.instance.clearChatHistory();
      }
    },
  };
})();


import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Chatbot {
  id: string;
  name: string;
  tone: "professional" | "friendly" | "casual";
  welcomeMessage: string;
  inputPlaceholder: string;
  color: string;
  placement: "inline" | "floating";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  conversationCount: number;
}

interface ChatbotsState {
  chatbots: Chatbot[];
  currentChatbot: Chatbot | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ChatbotsState = {
  chatbots: [],
  currentChatbot: null,
  isLoading: false,
  error: null,
};

export const chatbotsSlice = createSlice({
  name: "chatbots",
  initialState,
  reducers: {
    setChatbots: (state, action: PayloadAction<Chatbot[]>) => {
      state.chatbots = action.payload;
    },
    setCurrentChatbot: (state, action: PayloadAction<Chatbot | null>) => {
      state.currentChatbot = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    addChatbot: (state, action: PayloadAction<Chatbot>) => {
      state.chatbots.push(action.payload);
    },
    updateChatbot: (state, action: PayloadAction<Chatbot>) => {
      const index = state.chatbots.findIndex(bot => bot.id === action.payload.id);
      if (index !== -1) {
        state.chatbots[index] = action.payload;
      }
    },
    deleteChatbot: (state, action: PayloadAction<string>) => {
      state.chatbots = state.chatbots.filter(bot => bot.id !== action.payload);
    },
  },
});

export const { 
  setChatbots, 
  setCurrentChatbot, 
  setLoading, 
  setError, 
  addChatbot, 
  updateChatbot, 
  deleteChatbot 
} = chatbotsSlice.actions;

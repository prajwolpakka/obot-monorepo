import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IAuth, IUser } from "../models/types";
import { ISubscription } from "@/subscription/models/types";

const initialState: IAuth = {
  user: null,
  isAuthenticated: false,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthData: (state, action: PayloadAction<{ user: IUser }>) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;
    },
    setUser: (state, action: PayloadAction<IUser>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    updateUserName: (state, action: PayloadAction<{ fullName: string }>) => {
      state.user = { ...state.user, fullName: action.payload.fullName };
    },
    updateUserSubscription: (state, action: PayloadAction<ISubscription>) => {
      if (state.user) {
        state.user.subscription = action.payload;
      }
    },
    resetAuthData: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setAuthData, setUser, updateUserName, updateUserSubscription, resetAuthData } = authSlice.actions;
export default authSlice.reducer;

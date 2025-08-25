import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SettingsState {
  darkMode: boolean;
}

const initialState: SettingsState = {
  darkMode: false,
};

export const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.darkMode = action.payload;
    },
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
    },
  },
});

export const { setDarkMode, toggleDarkMode } = settingsSlice.actions;
export default settingsSlice.reducer;

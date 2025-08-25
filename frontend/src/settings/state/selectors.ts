import { RootState } from "@/common/state/slice";

export const selectSettingsState = (state: RootState) => state.settings;
export const selectDarkMode = (state: RootState) => state.settings.darkMode;

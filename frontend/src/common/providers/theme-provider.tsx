import { useAppDispatch, useAppSelector } from "@/common/state/hooks";
import { selectDarkMode } from "@/settings/state/selectors";
import { setDarkMode } from "@/settings/state/slice";
import { createContext, ReactNode, useContext, useEffect } from "react";

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  setDarkModeEnabled: (enabled: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const dispatch = useAppDispatch();
  const isDarkMode = useAppSelector(selectDarkMode);

  const toggleDarkMode = () => {
    dispatch(setDarkMode(!isDarkMode));
  };

  const setDarkModeEnabled = (enabled: boolean) => {
    dispatch(setDarkMode(enabled));
  };

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  const value: ThemeContextType = {
    isDarkMode,
    toggleDarkMode,
    setDarkModeEnabled,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

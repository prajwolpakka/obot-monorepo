import { TooltipProvider } from "@/common/components/ui/tooltip";
import { persistor } from "@/common/state/slice";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import ErrorBoundary from "./common/pages/ErrorBoundary";
import SplashScreen from "./common/pages/SplashScreen";
import { store } from "./common/state/slice";
import "./index.css";
import AppRouter from "./router";
import { NotificationProvider } from "./notifications";
import { ThemeProvider } from "./common/providers/theme-provider";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
    mutations: {
      retry: 1,
    },
  },
});

const App = () => (
  <Provider store={store}>
    <PersistGate loading={<SplashScreen />} persistor={persistor}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <NotificationProvider>
            <ThemeProvider>
              <ErrorBoundary>
                <AppRouter />
              </ErrorBoundary>
            </ThemeProvider>
          </NotificationProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </PersistGate>
  </Provider>
);

export default App;

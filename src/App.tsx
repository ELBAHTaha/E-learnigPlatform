import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { AppRouter } from "@/routes/AppRouter";
import { ToastViewport } from "@/components/ui";
import { useAuth } from "@/store/auth";
import { ApiError, http, useMocks } from "@/lib/httpClient";

function AuthBootstrap() {
  const { token, logout } = useAuth();

  useEffect(() => {
    if (!token || useMocks) return;
    http("/profile").catch((err) => {
      if (err instanceof ApiError && err.status === 401) {
        logout();
      }
    });
  }, []);

  return null;
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthBootstrap />
        <AppRouter />
        <ToastViewport />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

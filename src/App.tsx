import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { AppRouter } from "@/routes/AppRouter";
import { ToastViewport } from "@/components/ui";

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRouter />
        <ToastViewport />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

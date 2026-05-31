import { Outlet } from "react-router-dom";
import { MarketingHeader } from "./MarketingHeader";
import { MarketingFooter } from "./MarketingFooter";
import { ChatbotWidget } from "@/features/chatbot/ChatbotWidget";

export function MarketingLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <MarketingHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <MarketingFooter />
      <ChatbotWidget />
    </div>
  );
}

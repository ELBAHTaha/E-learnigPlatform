import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar, type NavItem } from "./Sidebar";
import { Topbar } from "./Topbar";
import { Drawer } from "@/components/ui";
import { ChatbotWidget } from "@/features/chatbot/ChatbotWidget";
import { useAuth } from "@/store/auth";

interface DashboardLayoutProps {
  navItems: NavItem[];
  title?: string;
}

export function DashboardLayout({ navItems, title }: DashboardLayoutProps) {
  const [open, setOpen] = useState(false);
  const user = useAuth((s) => s.user);
  return (
    <div className="min-h-screen flex bg-surface">
      <div className="hidden lg:flex sticky top-0 h-screen">
        <Sidebar items={navItems} />
      </div>
      <Drawer open={open} onClose={() => setOpen(false)} side="left">
        <Sidebar items={navItems} onNavigate={() => setOpen(false)} compact />
      </Drawer>
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onMenu={() => setOpen(true)} title={title} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
      {user?.role === "eleve" && <ChatbotWidget />}
    </div>
  );
}

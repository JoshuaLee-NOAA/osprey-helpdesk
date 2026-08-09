"use client";

import { MessageSquare, PanelLeftClose, Sparkles, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HistorySidebarProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onNewChat: () => void;
}

export default function HistorySidebar({ isOpen, onClose, onNewChat }: HistorySidebarProps) {
  // Ultra-clean Gemini-style chronological list of past conversations
  const mockConversations = [
    { id: "1", title: "Deploy GCP Science Workstation", date: "Today", active: true },
    { id: "2", title: "Request Figma Seat for Staging", date: "Yesterday", active: false },
    { id: "3", title: "MFA Reset Code Failure", date: "3 days ago", active: false },
    { id: "4", title: "Configuring Slack Channel Access", date: "Last week", active: false },
  ];

  if (!isOpen) return null;

  return (
    <div className="w-64 h-[82vh] min-h-[480px] max-h-[850px] bg-background border border-border rounded-2xl flex flex-col shadow-md overflow-hidden animate-in slide-in-from-left duration-300 shrink-0 select-none">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-border/40 flex items-center justify-between shrink-0 bg-slate-50/50">
        <span className="text-xs font-bold text-[#005F9E] tracking-wider flex items-center gap-1.5 uppercase font-mono">
          <Sparkles className="h-4 w-4 text-[#005F9E]" />
          Chat History
        </span>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose} 
          className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground"
        >
          <PanelLeftClose className="h-4 w-4" />
        </Button>
      </div>

      {/* New Chat CTA */}
      <div className="p-4 shrink-0">
        <Button 
          onClick={onNewChat}
          className="w-full h-11 rounded-xl bg-gradient-to-r from-[#005F9E] to-[#0085CA] text-white font-semibold flex items-center justify-center gap-2 shadow-sm border border-transparent hover:brightness-105 active:scale-[0.98] transition-all"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      </div>

      {/* Gemini-Style Chat Log Feed */}
      <div className="flex-1 overflow-y-auto px-3 pb-4 flex flex-col gap-1.5 scroll-smooth">
        <span className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase px-3 py-1">
          Recent
        </span>
        <div className="flex flex-col gap-1">
          {mockConversations.map((chat) => (
            <button
              key={chat.id}
              className={cn(
                "w-full text-left rounded-xl px-3 py-2.5 text-xs font-medium flex items-center gap-2.5 transition-all duration-200 border border-transparent group",
                chat.active 
                  ? "bg-[#005F9E]/5 border-[#005F9E]/10 text-[#005F9E]" 
                  : "text-muted-foreground hover:bg-slate-100/60 hover:text-foreground"
              )}
            >
              <MessageSquare className={cn("h-4 w-4 shrink-0", chat.active ? "text-[#005F9E]" : "text-muted-foreground/60")} />
              <span className="truncate font-semibold flex-1 text-foreground group-hover:text-[#005F9E] transition-colors">
                {chat.title}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

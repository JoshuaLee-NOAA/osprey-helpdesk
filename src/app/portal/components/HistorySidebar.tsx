"use client";

import { MessageSquare, History, Plus, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface Thread {
  id: string;
  title: string;
  sessionState?: any;
  events?: readonly any[];
  createdAt: number;
}

interface HistorySidebarProps {
  readonly isOpen: boolean;
  readonly onNewChat: () => void;
  readonly threads?: readonly Thread[];
  readonly activeThreadId?: string;
  readonly onSelectThread?: (id: string) => void;
}

export default function HistorySidebar({ 
  isOpen, 
  onNewChat,
  threads = [],
  activeThreadId,
  onSelectThread
}: HistorySidebarProps) {

  if (!isOpen) return null;

  return (
    <div className="w-64 h-[82vh] min-h-[480px] max-h-[850px] bg-background border border-border rounded-2xl flex flex-col shadow-md overflow-hidden animate-in slide-in-from-left duration-300 shrink-0 select-none">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-border/40 flex items-center justify-between shrink-0 bg-slate-50/50">
        <span className="text-xs font-bold text-[#005F9E] tracking-wider flex items-center gap-1.5 uppercase font-mono">
          <History className="h-4 w-4 text-[#005F9E]" />
          Chat History
        </span>
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

      {/* Dynamic Chronological Chat Log Feed */}
      <div className="flex-1 overflow-y-auto px-3 pb-4 flex flex-col gap-3 scroll-smooth">
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase px-3 py-1 flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Recent Chats ({threads.length})
          </span>
          <div className="flex flex-col gap-1">
            {threads.length === 0 ? (
              <p className="text-[11px] text-muted-foreground px-3 py-2 italic font-medium">
                No recent chat sessions.
              </p>
            ) : (
              threads.map((chat) => {
                const isActive = chat.id === activeThreadId;
                return (
                  <button
                    key={chat.id}
                    onClick={() => onSelectThread?.(chat.id)}
                    className={cn(
                      "w-full text-left rounded-xl px-3 py-2.5 text-xs font-medium flex items-center gap-2.5 transition-all duration-200 border border-transparent group cursor-pointer",
                      isActive 
                        ? "bg-[#005F9E]/5 border-[#005F9E]/10 text-[#005F9E]" 
                        : "text-muted-foreground hover:bg-slate-100/60 hover:text-foreground"
                    )}
                  >
                    <MessageSquare className={cn("h-4 w-4 shrink-0", isActive ? "text-[#005F9E]" : "text-muted-foreground/60")} />
                    <span className={cn(
                      "truncate flex-1 group-hover:text-[#005F9E] transition-colors leading-relaxed",
                      isActive ? "text-[#005F9E] font-bold" : "text-foreground font-semibold"
                    )}>
                      {chat.title}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

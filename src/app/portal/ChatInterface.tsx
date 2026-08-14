"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useEveAgent } from "eve/react";
import type { EveDynamicToolPart, EveMessage, EveMessagePart } from "eve/react";
import { UserButton, useAuth } from "@clerk/nextjs";
import {
  Send,
  Bot,
  User,
  Loader2,
  Clock,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Wrench,
  Sparkles,
  PanelLeft,
  PanelLeftClose,
  PanelRight,
  PanelRightClose,
  ArrowRight,
  Shield,
  Laptop,
  Cpu,
  Network,
  Plus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

import HistorySidebar, { type Thread } from "./components/HistorySidebar";
import DiagnosticsConsole from "./components/DiagnosticsConsole";
import { getJiraTicketsAction, type TicketItem } from "./actions";

interface ChatInterfaceProps {
  readonly user: {
    name: string;
    email: string;
    imageUrl: string;
  };
}

/**
 * ChatInterface acts as the state manager for chronological chat threads.
 * Persists and loads previous conversation metadata and cursors to localStorage.
 */
export default function ChatInterface({ user }: ChatInterfaceProps) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string>("");
  const [isLeftOpen, setIsLeftOpen] = useState(true);

  // 1. Rehydrate threads list on mount
  useEffect(() => {
    if (!user.email) return;
    const localStorageKey = `osprey_threads_${user.email}`;
    const saved = localStorage.getItem(localStorageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setThreads(parsed);
          setActiveThreadId(parsed[0].id);
          return;
        }
      } catch (e) {
        console.error("Failed to parse saved threads:", e);
      }
    }

    // First launch fallback
    const initialThread: Thread = {
      id: Math.random().toString(36).substring(2, 15),
      title: "New Chat",
      createdAt: Date.now(),
    };
    setThreads([initialThread]);
    setActiveThreadId(initialThread.id);
  }, [user.email]);

  const saveThreads = useCallback((updatedThreads: Thread[]) => {
    if (!user.email) return;
    const localStorageKey = `osprey_threads_${user.email}`;
    localStorage.setItem(localStorageKey, JSON.stringify(updatedThreads));
  }, [user.email]);

  const handleNewChat = () => {
    const newThread: Thread = {
      id: Math.random().toString(36).substring(2, 15),
      title: "New Chat",
      createdAt: Date.now(),
    };
    const updated = [newThread, ...threads];
    setThreads(updated);
    setActiveThreadId(newThread.id);
    saveThreads(updated);
  };

  const handleSelectThread = (id: string) => {
    setActiveThreadId(id);
  };

  const handleSessionChange = (id: string, sessionState: any, events?: readonly any[]) => {
    setThreads((prevThreads) => {
      // Allow explicit reset requests to wipe stale session cursors
      if (sessionState === null || sessionState === "reset") {
        const updated = prevThreads.map((t) =>
          t.id === id ? { ...t, sessionState: undefined, events: undefined } : t
        );
        saveThreads(updated);
        return updated;
      }

      const existing = prevThreads.find((t) => t.id === id);
      
      const updatedSession = sessionState ?? existing?.sessionState;
      const updatedEvents = events ?? existing?.events;

      // Avoid infinite React re-render loops if state is structurally identical
      if (
        JSON.stringify(existing?.sessionState) === JSON.stringify(updatedSession) &&
        JSON.stringify(existing?.events) === JSON.stringify(updatedEvents)
      ) {
        return prevThreads;
      }

      const updated = prevThreads.map((t) => 
        t.id === id ? { ...t, sessionState: updatedSession, events: updatedEvents } : t
      );
      saveThreads(updated);
      return updated;
    });
  };

  const handleUpdateThreadTitle = (id: string, firstMessage: string) => {
    setThreads((prevThreads) => {
      const updated = prevThreads.map((t) => {
        if (t.id === id && t.title === "New Chat") {
          const cleanText = firstMessage
            .replace(/^\[System Context:[^\]]+\]\s*/i, "")
            .trim();
          const truncated = cleanText.length > 32 ? cleanText.slice(0, 30) + "..." : cleanText;
          return { ...t, title: truncated || "Dynamic Chat" };
        }
        return t;
      });
      saveThreads(updated);
      return updated;
    });
  };

  if (!activeThreadId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50/50 w-full h-full min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 text-[#005F9E] animate-spin" />
          <span className="text-xs font-mono font-bold text-slate-400 tracking-wider">LOADING USER SESSIONS...</span>
        </div>
      </div>
    );
  }

  const activeThread = threads.find((t) => t.id === activeThreadId);

  return (
    <ChatInterfaceContent
      key={activeThreadId} // Strict key forcing full React remount on thread swap to bind correct store session
      user={user}
      activeThread={activeThread}
      threads={threads}
      isLeftOpen={isLeftOpen}
      setIsLeftOpen={setIsLeftOpen}
      onNewChat={handleNewChat}
      onSelectThread={handleSelectThread}
      onSessionChange={handleSessionChange}
      onUpdateThreadTitle={handleUpdateThreadTitle}
    />
  );
}

interface ChatInterfaceContentProps {
  readonly user: {
    name: string;
    email: string;
    imageUrl: string;
  };
  readonly activeThread: Thread | undefined;
  readonly threads: readonly Thread[];
  readonly isLeftOpen: boolean;
  readonly setIsLeftOpen: (open: boolean) => void;
  readonly onNewChat: () => void;
  readonly onSelectThread: (id: string) => void;
  readonly onSessionChange: (id: string, session: any, events?: readonly any[]) => void;
  readonly onUpdateThreadTitle: (id: string, firstMessage: string) => void;
}

/**
 * Houses the active conversation viewport. Establishes the real useEveAgent hook
 * rehydrated by the active thread's cached session cursor.
 */
function ChatInterfaceContent({
  user,
  activeThread,
  threads,
  isLeftOpen,
  setIsLeftOpen,
  onNewChat,
  onSelectThread,
  onSessionChange,
  onUpdateThreadTitle,
}: ChatInterfaceContentProps) {
  const [input, setInput] = useState("");
  const [isRightOpen, setIsRightOpen] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { getToken } = useAuth();

  const [activeTickets, setActiveTickets] = useState<TicketItem[]>([]);
  const [resolvedTickets, setResolvedTickets] = useState<TicketItem[]>([]);

  const fetchTickets = useCallback(async () => {
    if (!user.email) return;
    const res = await getJiraTicketsAction(user.email);
    if (res.success && res.activeTickets && res.resolvedTickets) {
      setActiveTickets(res.activeTickets as TicketItem[]);
      setResolvedTickets(res.resolvedTickets as TicketItem[]);
    }
  }, [user.email]);

  useEffect(() => {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const url = typeof args[0] === "string" ? args[0] : (args[0] instanceof Request ? args[0].url : String(args[0]));
      const isAgentCall = url.includes("/_eve") || url.includes("/agent") || url.includes("eve");
      if (isAgentCall) {
        console.log("[Eve Agent Fetch Interceptor] Requesting:", url);
        const res = await originalFetch(...args);
        console.log("[Eve Agent Fetch Interceptor] Response Status:", res.status, res.statusText);
        if (!res.ok) {
          const cloned = res.clone();
          const text = await cloned.text().catch(() => "");
          if (text.includes("SESSION_NOT_RESUMABLE") || text.includes("cannot be resumed") || res.status === 404) {
            console.warn("[Eve Agent Fetch Interceptor] Suppressing SESSION_NOT_RESUMABLE / 404 toast for automatic session re-initialization.");
            return res;
          }
          if (text.includes("AI Gateway rejected") || text.includes("MODEL_CALL_FAILED")) {
            console.error(
              "%c[AI Gateway Auth Error Details]",
              "color: red; font-size: 14px; font-weight: bold;",
              {
                url,
                status: res.status,
                statusText: res.statusText,
                body: text,
                hint: "Check /api/debug/gateway-status to verify AI_GATEWAY_API_KEY environment variable presence on server."
              }
            );
          }
          console.error(`[Eve Agent HTTP ${res.status} Error Details]:`, text);
          toast.error(`Agent Error (${res.status}): ${text || res.statusText}`, { duration: 10000 });
        }
        return res;
      }
      return originalFetch(...args);
    };
    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  const agent = useEveAgent({
    initialSession: activeThread?.sessionState,
    initialEvents: activeThread?.events,
    onSessionChange: (session) => {
      if (activeThread?.id && session) {
        onSessionChange(activeThread.id, session, undefined);
      }
    },
    onEvent: (event: any) => {
      console.log(`[EveAgent Stream Event] (${event?.type}):`, event);
    },
    onFinish: (result: any) => {
      console.log("[EveAgent Turn Finished]:", result);
    },
    headers: async () => {
      const token = await getToken();
      console.log("[ChatInterface] Auth token retrieved:", token ? `Present (${token.slice(0, 15)}...)` : "MISSING!");
      return {
        authorization: token ? `Bearer ${token}` : "",
        "x-clerk-authorization": token ? `Bearer ${token}` : "",
      };
    },
    onError: (err: any) => {
      console.error(
        "[EveAgent onError Event Detailed Log]:",
        {
          name: err?.name,
          message: err?.message,
          code: err?.code,
          cause: err?.cause,
          stack: err?.stack,
          fullError: err
        }
      );
      const errMsg = err?.message || String(err);
      if (
        errMsg.includes("Session is not active") ||
        errMsg.includes("cannot be resumed") ||
        errMsg.includes("SESSION_NOT_RESUMABLE")
      ) {
        console.warn("[ChatInterface] Stale session detected in local cache. Resetting thread session state...");
        onSessionChange(activeThread?.id || "", null, undefined);
      } else {
        toast.error(`Agent Error: ${errMsg}`, {
          duration: 8000,
        });
      }
    },
  });

  const isBusy = agent.status === "submitted" || agent.status === "streaming";
  const messages = agent.data.messages;
  const visibleMessages = messages.filter(hasVisibleContent);
  const isEmpty = visibleMessages.length === 0;

  const prevBusyRef = useRef(isBusy);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  useEffect(() => {
    if (prevBusyRef.current && !isBusy) {
      console.log("[ChatInterface] Agent completed conversational turn. Re-fetching live Jira tickets...");
      fetchTickets();
    }
    prevBusyRef.current = isBusy;
  }, [isBusy, fetchTickets]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
      container.scrollTo({
        top: container.scrollHeight,
        behavior,
      });
    };

    const scrollBehavior = agent.status === "streaming" ? "auto" : "smooth";
    scrollToBottom(scrollBehavior);

    const observer = new ResizeObserver(() => {
      const isNearBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight < 300;
      if (isNearBottom) {
        scrollToBottom(scrollBehavior);
      }
    });

    const chatContent = container.firstElementChild;
    if (chatContent) {
      observer.observe(chatContent);
    }

    return () => observer.disconnect();
  }, [visibleMessages, agent.status]);

  const handleSend = async (text: string) => {
    let trimmed = text.trim();
    if (!trimmed || isBusy) return;
    setInput("");

    // If this is the pristine first turn, dynamically re-title the thread
    if (visibleMessages.length === 0 && activeThread) {
      onUpdateThreadTitle(activeThread.id, trimmed);
    }

    if (user) {
      trimmed = `[System Context: Current authenticated user is ${user.name} with email ${user.email}.]\n\n${trimmed}`;
    }

    try {
      await agent.send({ message: trimmed });
    } catch (error: any) {
      console.error("Failed to send message to Osprey agent:", error);
      const errMsg = error?.message || String(error);
      if (
        errMsg.includes("Session is not active") ||
        errMsg.includes("cannot be resumed") ||
        errMsg.includes("SESSION_NOT_RESUMABLE")
      ) {
        console.warn("[ChatInterface] Session expired on send. Resetting and retrying message...");
        onSessionChange(activeThread?.id || "", null, undefined);
        agent.reset();
        try {
          await agent.send({ message: trimmed });
        } catch (retryErr) {
          console.error("Retry send failed:", retryErr);
        }
      }
    }
  };

  const handleTicketClick = (summary: string, key: string) => {
    handleSend(`Please give me a status update on ticket ${key}: ${summary}`);
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-50/50 overflow-hidden">
      {/* Full-width Top Header */}
      <header className="h-14 border-b border-border flex items-center justify-between px-6 shrink-0 bg-background z-20">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsLeftOpen(!isLeftOpen)}
            className="rounded-lg text-muted-foreground mr-1 hover:text-foreground h-9 w-9 shrink-0"
            title={isLeftOpen ? "Collapse Left Drawer" : "Expand Left Drawer"}
          >
            {isLeftOpen ? (
              <PanelLeftClose className="h-5 w-5 text-[#005F9E]" />
            ) : (
              <PanelLeft className="h-5 w-5 text-muted-foreground" />
            )}
          </Button>

          <img
            src="/logo.svg"
            alt="Osprey Logo"
            className="h-6 w-auto object-contain select-none"
          />
          <span className="text-sm font-extrabold tracking-wider ml-1 bg-gradient-to-r from-[#005F9E] via-[#0085CA] to-[#FF9F1C] bg-clip-text text-transparent select-none">
            OSPREY
          </span>
          <span
            className={cn(
              "ml-2 h-1.5 w-1.5 rounded-full",
              isBusy ? "bg-accent animate-pulse-glow" : "bg-emerald-500"
            )}
            title={isBusy ? "Osprey is working" : "Osprey is ready"}
          />
        </div>

        <div className="flex items-center gap-2.5">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsRightOpen(!isRightOpen)}
            className={cn(
              "rounded-lg h-9 w-9 shrink-0 transition-colors",
              isRightOpen ? "text-[#005F9E] bg-slate-100" : "text-muted-foreground hover:text-foreground"
            )}
            title={isRightOpen ? "Hide Service Tickets & Logs" : "Show Service Tickets & Logs"}
          >
            {isRightOpen ? (
              <PanelRightClose className="h-5 w-5 text-[#005F9E]" />
            ) : (
              <PanelRight className="h-5 w-5 text-muted-foreground" />
            )}
          </Button>
          
          <UserButton />
        </div>
      </header>

      <div className="flex-1 flex items-center justify-between overflow-hidden p-6 bg-slate-50/50 gap-6">
        <HistorySidebar 
          isOpen={isLeftOpen} 
          onNewChat={onNewChat}
          threads={threads}
          activeThreadId={activeThread?.id}
          onSelectThread={onSelectThread}
        />

        <div className="flex-1 flex items-center justify-center h-full">
          <div className="w-full max-w-3xl h-[82vh] min-h-[480px] max-h-[850px] bg-background border border-border rounded-2xl flex flex-col shadow-md relative overflow-hidden">
            <div ref={scrollContainerRef} className="flex-1 overflow-y-auto scroll-smooth">
              <div className="px-6 py-10 flex flex-col min-h-full">
                {isEmpty ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center gap-6 py-4">
                    <div className="flex flex-col items-center gap-2">
                      <h2 className="text-2xl font-bold text-foreground tracking-tight">
                        How can I help you today, {user.name.split(" ")[0]}?
                      </h2>
                      <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
                        Osprey is ready to assist. You can ask a new question below, or select one of your active IT service tickets to discuss status.
                      </p>
                    </div>

                    {/* Frequently Asked Request Categories Grid */}
                    <div className="w-full max-w-xl grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-left mt-4 animate-in fade-in slide-in-from-bottom duration-500">
                      {[
                        { icon: Shield, title: "MFA Token Reset", subtitle: "Recover authentication access", prompt: "I need to reset my MFA token. I am locked out.", iconColor: "text-amber-600 bg-amber-50 border-amber-100" },
                        { icon: Laptop, title: "Software License", subtitle: "Request a seat or utility key", prompt: "I need to request a Figma seat license for staging.", iconColor: "text-blue-600 bg-blue-50 border-blue-100" },
                        { icon: Cpu, title: "Calendar Booking", subtitle: "Schedule IT onboarding & support slots", prompt: "I need to schedule a 1-hour IT onboarding meeting on my calendar.", iconColor: "text-emerald-600 bg-emerald-50 border-emerald-100" },
                        { icon: Network, title: "Access & Network", subtitle: "Alter team or network access", prompt: "I need access to configuring my team's Slack channel.", iconColor: "text-purple-600 bg-purple-50 border-purple-100" },
                      ].map((action) => (
                        <button
                          key={action.title}
                          onClick={() => handleSend(action.prompt)}
                          className="p-4 rounded-xl border border-border/70 hover:border-[#005F9E]/30 bg-slate-50/50 hover:bg-[#005F9E]/[0.02] hover:shadow-xs transition-all duration-200 flex flex-col gap-2 group text-left h-full"
                        >
                          <div className="flex items-center gap-2">
                            <div className={cn("p-1.5 rounded-lg border flex items-center justify-center shrink-0", action.iconColor)}>
                              <action.icon className="h-4.5 w-4.5" />
                            </div>
                            <span className="text-xs font-bold text-slate-800 leading-snug group-hover:text-[#005F9E] transition-colors">
                              {action.title}
                            </span>
                          </div>
                          <p className="text-[10px] text-muted-foreground leading-normal line-clamp-2 mt-1">
                            {action.subtitle}
                          </p>
                          <span className="text-[9px] text-[#005F9E] font-bold flex items-center gap-1 mt-auto pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            Launch Request <ArrowRight className="h-2.5 w-2.5 group-hover:translate-x-0.5 transition-transform" />
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-6 w-full">
                    {visibleMessages.map((message) => (
                      <ChatMessage
                        key={message.id}
                        message={message}
                        userImageUrl={user.imageUrl}
                      />
                    ))}
                    {isBusy && agent.status !== "streaming" && (
                      <div className="flex items-center gap-2.5 px-2.5 text-muted-foreground select-none">
                        <Loader2 className="h-4 w-4 animate-spin text-[#005F9E]" />
                        <span className="text-xs font-semibold tracking-wider font-mono">Osprey is thinking...</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-border shrink-0 bg-background">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend(input);
                }}
                className="relative flex items-center gap-2"
              >
                <Input
                  type="text"
                  placeholder="Message Osprey..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isBusy}
                  className="h-12 pl-4 pr-12 rounded-full text-sm border-border shadow-sm bg-slate-50/50 focus-visible:bg-background"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!input.trim() || isBusy}
                  className="absolute right-1.5 h-9 w-9 rounded-full bg-gradient-to-r from-[#005F9E] to-[#0085CA]"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </div>

        <DiagnosticsConsole 
          isOpen={isRightOpen} 
          messages={messages}
          isBusy={isBusy}
          onTicketClick={handleTicketClick}
          activeTickets={activeTickets}
          resolvedTickets={resolvedTickets}
        />
      </div>
    </div>
  );
}

function ChatMessage({ message, userImageUrl }: { readonly message: EveMessage; readonly userImageUrl: string }) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-3 max-w-[85%]", isUser ? "self-end flex-row-reverse ml-auto" : "self-start")}>
      <Avatar className={cn("shrink-0 shadow-sm", isUser ? "size-8" : "size-16")}>
        {isUser ? (
          <>
            <AvatarImage src={userImageUrl} alt="User Avatar" />
            <AvatarFallback className="bg-muted text-foreground">
              <User className="h-4 w-4" />
            </AvatarFallback>
          </>
        ) : (
          <>
            <AvatarImage
              src="/logo.svg"
              alt="Osprey Avatar"
              className="p-2.5 bg-white object-contain"
            />
            <AvatarFallback className="bg-primary text-primary-foreground">
              <Bot className="h-8 w-8" />
            </AvatarFallback>
          </>
        )}
      </Avatar>

      <div className="flex flex-col gap-3 min-w-0">
        {message.parts.map((part, index) => (
          <MessagePart key={`${message.id}-${index}`} part={part} isUser={isUser} />
        ))}
      </div>
    </div>
  );
}

function ReasoningPart({ text }: { readonly text: string }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border border-slate-100 bg-slate-50/40 rounded-xl px-3.5 py-2 text-xs max-w-full my-1 shrink-0 animate-in fade-in duration-200">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 w-full text-left font-semibold text-[#005F9E] hover:text-[#0085CA] transition-colors"
      >
        <Sparkles className="h-3.5 w-3.5 text-[#FF9F1C] animate-pulse-glow" />
        <span>{isExpanded ? "Hide thought process" : "Show thought process"}</span>
        <span className="ml-auto text-[10px] text-muted-foreground select-none">
          {isExpanded ? "▲" : "▼"}
        </span>
      </button>
      {isExpanded && (
        <div className="mt-2 pl-4 text-muted-foreground leading-relaxed whitespace-pre-wrap font-mono text-[10px] border-l-2 border-[#005F9E]/20 animate-in fade-in duration-200">
          {text}
        </div>
      )}
    </div>
  );
}

function MessagePart({ part, isUser }: { readonly part: EveMessagePart; readonly isUser: boolean }) {
  switch (part.type) {
    case "step-start":
      return null;

    case "text": {
      const displayText = isUser && part.text.startsWith("[System Context:")
        ? part.text.replace(/^\[System Context:.*?\](\r?\n)*/g, "")
        : part.text;

      return (
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm leading-relaxed",
            isUser
              ? "bg-muted text-foreground rounded-tr-none whitespace-pre-wrap"
              : "bg-background text-foreground border border-border rounded-tl-none shadow-xs"
          )}
        >
          {isUser ? displayText : <MarkdownRenderer text={displayText} />}
        </div>
      );
    }

    case "reasoning":
      return null;

    case "file":
      return (
        <div className="text-xs bg-muted rounded-lg px-3 py-2 text-muted-foreground">
          Attachment: {part.filename ?? part.mediaType}
        </div>
      );

    case "authorization":
      return (
        <Card className="border-secondary/30 bg-secondary/5">
          <CardContent className="text-xs text-muted-foreground">
            {part.description}
          </CardContent>
        </Card>
      );

    case "dynamic-tool":
      return <SubagentToolCard part={part} />;

    default:
      return null;
  }
}

const TOOL_STATE_META: Record<
  EveDynamicToolPart["state"],
  { label: string; icon: typeof Clock | null; className: string }
> = {
  "input-streaming": { label: "Pending", icon: Clock, className: "text-muted-foreground" },
  "input-available": { label: "Running", icon: null, className: "text-[#005F9E]" },
  "approval-requested": { label: "Awaiting Approval", icon: ShieldAlert, className: "text-accent" },
  "approval-responded": { label: "Responded", icon: CheckCircle2, className: "text-secondary" },
  "output-available": { label: "Completed", icon: CheckCircle2, className: "text-emerald-600" },
  "output-error": { label: "Error", icon: XCircle, className: "text-destructive" },
  "output-denied": { label: "Denied", icon: XCircle, className: "text-orange-600" },
};

function SubagentToolCard({ part }: { readonly part: EveDynamicToolPart }) {
  const meta = TOOL_STATE_META[part.state];
  const Icon = meta.icon;
  const kind = part.toolMetadata?.eve?.kind;
  const displayName = part.toolMetadata?.eve?.name ?? part.toolName;
  const isSubagent = kind === "subagent-call";

  return (
    <div className="flex flex-col gap-1.5 my-1.5 w-full min-w-[300px] sm:min-w-[420px]">
      <div className="flex items-center gap-1.5 px-1 text-muted-foreground select-none">
        <Wrench className="h-3.5 w-3.5 text-[#005F9E]" />
        <span className="text-[10px] font-mono uppercase tracking-widest font-black">
          {isSubagent ? "Subagent Invocation" : "Tool Call"}
        </span>
      </div>

      <Card className="border border-border bg-background shadow-xs">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between gap-4 text-sm w-full">
            <span className="font-bold text-foreground truncate">
              {displayName}
            </span>
            <span className={cn("flex items-center gap-1 text-xs font-semibold whitespace-nowrap shrink-0", meta.className)}>
              {part.state === "input-available" ? (
                <span className="relative flex h-2 w-2 shrink-0 mr-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#005F9E]"></span>
                </span>
              ) : Icon ? (
                <Icon className="h-3.5 w-3.5" />
              ) : null}
              {meta.label}
            </span>
          </CardTitle>
        </CardHeader>
        {(part.state === "output-available" || part.state === "output-error") && (
          <CardContent className="pt-0">
            <pre className="text-xs bg-muted/60 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap text-muted-foreground">
              {part.state === "output-error"
                ? part.errorText
                : JSON.stringify(part.output, null, 2)}
            </pre>
          </CardContent>
        )}
      </Card>
    </div>
  );
}

function hasVisibleContent(message: EveMessage): boolean {
  if (message.role === "user") return true;

  return message.parts.some((part) => {
    switch (part.type) {
      case "text":
        return part.text.trim().length > 0;
      case "reasoning":
        return part.text.trim().length > 0;
      case "dynamic-tool":
        return true;
      case "authorization":
        return true;
      case "file":
        return true;
      default:
        return false;
    }
  });
}

function MarkdownRenderer({ text }: { readonly text: string }) {
  interface ParsedContent {
    type: "paragraph" | "list" | "heading" | "codeblock";
    text: string;
    items?: string[];
  }

  const parseMarkdown = (raw: string): ParsedContent[] => {
    const lines = raw.split("\n");
    const blocks: ParsedContent[] = [];
    let currentList: string[] = [];

    const flushList = () => {
      if (currentList.length > 0) {
        blocks.push({ type: "list", text: "", items: [...currentList] });
        currentList = [];
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Heading blocks (###)
      if (trimmed.startsWith("###")) {
        flushList();
        blocks.push({ type: "heading", text: trimmed.slice(3).trim() });
        continue;
      }

      // Codeblocks
      if (trimmed.startsWith("```")) {
        flushList();
        let codeLines = [];
        i++;
        while (i < lines.length && !lines[i].trim().startsWith("```")) {
          codeLines.push(lines[i]);
          i++;
        }
        blocks.push({ type: "codeblock", text: codeLines.join("\n") });
        continue;
      }

      // Chronological Bullet lists
      if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
        currentList.push(trimmed.slice(2).trim());
        continue;
      }

      // Ordered number lists (e.g. 1.)
      if (/^\d+\.\s+/.test(trimmed)) {
        currentList.push(trimmed.replace(/^\d+\.\s+/, "").trim());
        continue;
      }

      // Normal text or paragraph breaks
      if (trimmed === "") {
        flushList();
      } else {
        flushList();
        blocks.push({ type: "paragraph", text: trimmed });
      }
    }

    flushList();
    return blocks;
  };

  const renderInlineStyles = (rawText: string) => {
    // 1. Double Bold matcher **text**
    const boldRegex = /\*\*(.*?)\*\*/g;
    // 2. Inline code matcher `code`
    const codeRegex = /`(.*?)`/g;
    // 3. Anchor hyperlink matcher [text](url)
    const linkRegex = /\[(.*?)\]\((.*?)\)/g;

    let parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    // We do a combined loop for inline elements
    const combinedRegex = /(\*\*.*?\*\*|`.*?`|\[.*?\]\(.*?\))/g;
    const tokens = rawText.split(combinedRegex);

    return tokens.map((token, index) => {
      if (token.startsWith("**") && token.endsWith("**")) {
        return <strong key={index} className="font-black text-slate-900 bg-slate-100/40 px-1 py-0.5 rounded">{token.slice(2, -2)}</strong>;
      }
      if (token.startsWith("`") && token.endsWith("`")) {
        return <code key={index} className="font-mono text-xs font-bold text-[#005F9E] bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/50">{token.slice(1, -1)}</code>;
      }
      if (token.startsWith("[") && token.includes("](")) {
        const linkMatch = token.match(/\[(.*?)\]\((.*?)\)/);
        if (linkMatch) {
          return (
            <a 
              key={index} 
              href={linkMatch[2]} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-[#005F9E] hover:underline font-bold inline-flex items-center gap-0.5 hover:text-[#0085CA]"
            >
              {linkMatch[1]}
            </a>
          );
        }
      }
      return token;
    });
  };

  const blocks = parseMarkdown(text);

  return (
    <div className="flex flex-col gap-3.5 text-foreground leading-relaxed">
      {blocks.map((block, index) => {
        switch (block.type) {
          case "heading":
            return (
              <h4 key={index} className="text-sm font-black text-slate-800 tracking-wide mt-2 border-b border-slate-100 pb-1 uppercase font-mono">
                {block.text}
              </h4>
            );
          case "codeblock":
            return (
              <pre key={index} className="text-xs bg-slate-900 text-slate-100 rounded-xl p-3.5 overflow-x-auto whitespace-pre font-mono leading-normal shadow-inner border border-slate-800">
                <code>{block.text}</code>
              </pre>
            );
          case "list":
            return (
              <ul key={index} className="list-none flex flex-col gap-2 pl-1.5 py-0.5">
                {block.items?.map((item, itemIdx) => (
                  <li key={itemIdx} className="text-sm flex items-start gap-2.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#005F9E] mt-2 shrink-0 shadow-xs" />
                    <span className="flex-1 leading-normal font-medium">{renderInlineStyles(item)}</span>
                  </li>
                ))}
              </ul>
            );
          case "paragraph":
          default:
            return (
              <p key={index} className="text-sm leading-relaxed font-medium">
                {renderInlineStyles(block.text)}
              </p>
            );
        }
      })}
    </div>
  );
}

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
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

import HistorySidebar from "./components/HistorySidebar";
import DiagnosticsConsole from "./components/DiagnosticsConsole";
import { getJiraTicketsAction, type TicketItem } from "./actions";



interface ChatInterfaceProps {
  user: {
    name: string;
    email: string;
    imageUrl: string;
  };
}

export default function ChatInterface({ user }: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const [isLeftOpen, setIsLeftOpen] = useState(true);
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

  const agent = useEveAgent({
    headers: async () => {
      const token = await getToken();
      return {
        authorization: token ? `Bearer ${token}` : "",
      };
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
    // Whenever isBusy transitions from true to false, re-fetch live tickets
    if (prevBusyRef.current && !isBusy) {
      console.log("[ChatInterface] Agent completed conversational turn. Re-fetching live Jira tickets...");
      fetchTickets();
    }
    prevBusyRef.current = isBusy;
  }, [isBusy, fetchTickets]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Scroll helper supporting custom behavior (smooth vs instant)
    const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
      container.scrollTo({
        top: container.scrollHeight,
        behavior,
      });
    };

    // Use instant scrolling during live text streaming for rock-solid anchors
    const scrollBehavior = agent.status === "streaming" ? "auto" : "smooth";

    // Scroll immediately on new messages or status changes
    scrollToBottom(scrollBehavior);

    // Use ResizeObserver to lock scroll to bottom seamlessly as text streams
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

    // Prepend system context identity to every message of the session
    if (user) {
      trimmed = `[System Context: Current authenticated user is ${user.name} with email ${user.email}.]\n\n${trimmed}`;
    }

    try {
      await agent.send({ message: trimmed });
    } catch (error) {
      console.error("Failed to send message to Osprey agent:", error);
    }
  };

  const handleTicketClick = (summary: string, id: string) => {
    handleSend(`Please give me a status update on ticket ${id}: ${summary}`);
  };

  const handleNewChat = () => {
    // Force a fresh reload to reset session state and launch a pristine conversational thread
    window.location.reload();
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-50/50 overflow-hidden">
      {/* Full-width Top Header */}
      <header className="h-14 border-b border-border flex items-center justify-between px-6 shrink-0 bg-background z-20">
        <div className="flex items-center gap-2">
          {/* Left Sidebar Toggle */}
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
          {/* Right Sidebar Toggle */}
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

      {/* Main viewport below header split into gutters + centered chat */}
      <div className="flex-1 flex items-center justify-between overflow-hidden p-6 bg-slate-50/50 gap-6">
        {/* Left Sidebar History Drawer - Clean Gemini-Style */}
        <HistorySidebar 
          isOpen={isLeftOpen} 
          onClose={() => setIsLeftOpen(false)} 
          onNewChat={handleNewChat}
        />

        {/* Centered chat wrapper */}
        <div className="flex-1 flex items-center justify-center h-full">
          {/* Bounded Center Chat Area - STRICT fixed height and width */}
          <div className="w-full max-w-3xl h-[82vh] min-h-[480px] max-h-[850px] bg-background border border-border rounded-2xl flex flex-col shadow-md relative overflow-hidden">
            {/* Chat Column */}
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
                        { icon: Cpu, title: "Developer Provisioning", subtitle: "Scaffold DevOps sandboxes", prompt: "I need to deploy a GCP Science Workstation.", iconColor: "text-emerald-600 bg-emerald-50 border-emerald-100" },
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
                  <div className="flex-1 flex flex-col gap-6">
                    {visibleMessages.map((message) => (
                      <ChatMessage key={message.id} message={message} userImageUrl={user.imageUrl} />
                    ))}
                  </div>
                )}

                {agent.error ? (
                  <p className="text-xs text-destructive font-medium text-center mt-4">
                    {agent.error.message}
                  </p>
                ) : null}
              </div>
            </div>

            {/* Message Input */}
            <div className="shrink-0 px-6 pb-6 pt-4 border-t border-border/40 bg-background z-10">
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
                  className="absolute right-1.5 h-9 w-9 rounded-full"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Support Tickets Stacked on top of minimized AI Diagnostics Console */}
        <DiagnosticsConsole 
          isOpen={isRightOpen} 
          onClose={() => setIsRightOpen(false)} 
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
      return <ReasoningPart text={part.text} />;

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
      {/* Tool Icon and Label above the card container */}
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
      case "file":
      case "authorization":
      case "dynamic-tool":
        return true;
      default:
        return false;
    }
  });
}

function MarkdownRenderer({ text }: { readonly text: string }) {
  // Split text by lines
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  
  let inList = false;
  let listItems: React.ReactNode[] = [];
  let listKey = 0;

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${listKey++}`} className="list-disc pl-5 my-2 space-y-1">
          {listItems}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  const parseInlineStyles = (content: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    let currentText = content;
    let index = 0;

    while (currentText.length > 0) {
      const boldIdx = currentText.indexOf("**");
      const codeIdx = currentText.indexOf("`");
      const linkIdx = currentText.search(/\[.*?\]\(.*?\)/);

      const targets = [
        { type: "bold", idx: boldIdx },
        { type: "code", idx: codeIdx },
        { type: "link", idx: linkIdx }
      ].filter(t => t.idx !== -1);

      if (targets.length === 0) {
        parts.push(<span key={index++}>{currentText}</span>);
        break;
      }

      targets.sort((a, b) => a.idx - b.idx);
      const first = targets[0];

      if (first.idx > 0) {
        parts.push(<span key={index++}>{currentText.substring(0, first.idx)}</span>);
      }

      currentText = currentText.substring(first.idx);

      if (first.type === "bold") {
        const closingIdx = currentText.indexOf("**", 2);
        if (closingIdx !== -1) {
          const boldText = currentText.substring(2, closingIdx);
          parts.push(<strong key={index++} className="font-extrabold text-foreground">{boldText}</strong>);
          currentText = currentText.substring(closingIdx + 2);
        } else {
          parts.push(<span key={index++}>**</span>);
          currentText = currentText.substring(2);
        }
      } else if (first.type === "code") {
        const closingIdx = currentText.indexOf("`", 1);
        if (closingIdx !== -1) {
          const codeText = currentText.substring(1, closingIdx);
          parts.push(<code key={index++} className="bg-slate-100 text-[#005F9E] font-mono text-xs px-1.5 py-0.5 rounded border border-slate-200/50">{codeText}</code>);
          currentText = currentText.substring(closingIdx + 1);
        } else {
          parts.push(<span key={index++}>`</span>);
          currentText = currentText.substring(1);
        }
      } else if (first.type === "link") {
        const match = currentText.match(/^\[(.*?)\]\((.*?)\)/);
        if (match) {
          const linkText = match[1];
          const url = match[2];
          parts.push(
            <a key={index++} href={url} target="_blank" rel="noopener noreferrer" className="text-[#005F9E] hover:text-[#0085CA] underline font-semibold inline-flex items-center gap-0.5">
              {linkText}
            </a>
          );
          currentText = currentText.substring(match[0].length);
        } else {
          parts.push(<span key={index++}>[</span>);
          currentText = currentText.substring(1);
        }
      }
    }

    return parts;
  };

  lines.forEach((line, lineIdx) => {
    const trimmed = line.trim();

    // Headers
    if (trimmed.startsWith("### ")) {
      flushList();
      elements.push(
        <h4 key={lineIdx} className="text-xs font-extrabold text-[#005F9E] mt-4 mb-2 first:mt-1 flex items-center gap-1.5 border-b border-slate-100 pb-1 uppercase font-mono tracking-wider">
          {parseInlineStyles(trimmed.substring(4))}
        </h4>
      );
    } else if (trimmed.startsWith("## ")) {
      flushList();
      elements.push(
        <h3 key={lineIdx} className="text-sm font-extrabold text-[#005F9E] mt-5 mb-2 flex items-center gap-1.5 border-b border-slate-100 pb-1">
          {parseInlineStyles(trimmed.substring(3))}
        </h3>
      );
    } else if (trimmed.startsWith("# ")) {
      flushList();
      elements.push(
        <h2 key={lineIdx} className="text-base font-black text-[#005F9E] mt-6 mb-3 border-b border-border pb-1.5">
          {parseInlineStyles(trimmed.substring(2))}
        </h2>
      );
    }
    // Bullet Lists (matches *, -, +)
    else if (trimmed.startsWith("* ") || trimmed.startsWith("- ") || trimmed.startsWith("+ ")) {
      inList = true;
      const bulletContent = trimmed.substring(2);
      listItems.push(
        <li key={`li-${lineIdx}`} className="text-xs text-slate-700 leading-relaxed font-medium pl-1 list-disc">
          {parseInlineStyles(bulletContent)}
        </li>
      );
    }
    // Numbered lists (matches e.g., "1. ")
    else if (/^\d+\.\s/.test(trimmed)) {
      flushList();
      const content = trimmed.replace(/^\d+\.\s/, "");
      elements.push(
        <div key={lineIdx} className="flex gap-2 text-xs text-slate-700 leading-relaxed pl-1 my-1">
          <span className="font-extrabold text-[#005F9E] shrink-0 font-mono">{trimmed.match(/^\d+/)?.[0]}.</span>
          <span className="font-medium">{parseInlineStyles(content)}</span>
        </div>
      );
    }
    // Empty Line
    else if (trimmed === "") {
      flushList();
      if (elements.length > 0 && lineIdx < lines.length - 1) {
        elements.push(<div key={`space-${lineIdx}`} className="h-1.5" />);
      }
    }
    // Regular Paragraph
    else {
      flushList();
      elements.push(
        <p key={lineIdx} className="text-xs text-slate-700 leading-relaxed font-medium my-1">
          {parseInlineStyles(line)}
        </p>
      );
    }
  });

  flushList();

  return <div className="flex flex-col gap-0.5">{elements}</div>;
}

"use client";

import { useEffect, useRef, useState } from "react";
import { useEveAgent } from "eve/react";
import type { EveDynamicToolPart, EveMessage, EveMessagePart } from "eve/react";
import { UserButton } from "@clerk/nextjs";
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
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface ChatInterfaceProps {
  user: {
    name: string;
    email: string;
    imageUrl: string;
  };
}

export default function ChatInterface({ user }: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const agent = useEveAgent({
    headers: async () => ({
      // In production, append Clerk session tokens here, e.g.:
      // authorization: `Bearer ${await getClerkToken()}`,
    }),
  });

  const isBusy = agent.status === "submitted" || agent.status === "streaming";
  const messages = agent.data.messages;
  const visibleMessages = messages.filter(hasVisibleContent);
  const isEmpty = visibleMessages.length === 0;

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
    const trimmed = text.trim();
    if (!trimmed || isBusy) return;
    setInput("");
    try {
      await agent.send({ message: trimmed });
    } catch (error) {
      console.error("Failed to send message to Osprey agent:", error);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-50/50 overflow-hidden">
      {/* Full-width Top Header */}
      <header className="h-14 border-b border-border flex items-center justify-between px-6 shrink-0 bg-background z-20">
        <div className="flex items-center gap-2">
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

        <div className="flex items-center gap-2">
          <UserButton />
        </div>
      </header>

      {/* Main viewport below header split into gutters + centered chat */}
      <div className="flex-1 flex items-center justify-center overflow-hidden p-4 bg-slate-50/50">
        {/* Bounded Center Chat Area - STRICT fixed height and width */}
        <div className="w-full max-w-3xl h-[82vh] min-h-[480px] max-h-[850px] bg-background border border-border rounded-2xl flex flex-col shadow-md relative overflow-hidden">
          {/* Chat Column */}
          <div ref={scrollContainerRef} className="flex-1 overflow-y-auto scroll-smooth">
            <div className="px-6 py-10 flex flex-col min-h-full">
              {isEmpty ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
                  <h2 className="text-2xl font-semibold text-foreground">
                    How can I help you today, {user.name.split(" ")[0]}?
                  </h2>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Describe an IT issue or ask for a status update — Osprey will route your
                    request to the right specialist agent.
                  </p>
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

function MessagePart({ part, isUser }: { readonly part: EveMessagePart; readonly isUser: boolean }) {
  switch (part.type) {
    case "step-start":
      return null;

    case "text":
      return (
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap",
            isUser
              ? "bg-muted text-foreground rounded-tr-none"
              : "bg-background text-foreground border border-border rounded-tl-none"
          )}
        >
          {part.text}
        </div>
      );

    case "reasoning":
      return (
        <p className="text-xs text-muted-foreground italic px-2">{part.text}</p>
      );

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
  { label: string; icon: typeof Clock; className: string }
> = {
  "input-streaming": { label: "Pending", icon: Clock, className: "text-muted-foreground" },
  "input-available": { label: "Running", icon: Loader2, className: "text-secondary animate-spin" },
  "approval-requested": { label: "Awaiting Approval", icon: ShieldAlert, className: "text-accent" },
  "approval-responded": { label: "Responded", icon: CheckCircle2, className: "text-secondary" },
  "output-available": { label: "Completed", icon: CheckCircle2, className: "text-emerald-600" },
  "output-error": { label: "Error", icon: XCircle, className: "text-destructive" },
  "output-denied": { label: "Denied", icon: XCircle, className: "text-orange-600" },
};

function SubagentToolCard({ part }: { readonly part: EveDynamicToolPart }) {
  const meta = TOOL_STATE_META[part.state];
  const Icon = meta.icon;
  const isActive = part.state === "input-available" || part.state === "approval-requested";
  const kind = part.toolMetadata?.eve?.kind;
  const displayName = part.toolMetadata?.eve?.name ?? part.toolName;

  return (
    <Card
      className={cn(
        "border-border",
        isActive && "border-accent/40 bg-accent/5 animate-pulse-glow"
      )}
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2">
            <Wrench className="h-4 w-4 text-muted-foreground" />
            {displayName}
            {kind ? (
              <Badge variant="outline" className="text-[10px] uppercase font-semibold">
                {kind === "subagent-call" ? "Subagent" : "Tool"}
              </Badge>
            ) : null}
          </span>
          <span className={cn("flex items-center gap-1.5 text-xs font-semibold", meta.className)}>
            <Icon className="h-3.5 w-3.5" />
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

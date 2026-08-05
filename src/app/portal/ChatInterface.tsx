"use client";

import { useEffect, useRef, useState } from "react";
import { useEveAgent } from "eve/react";
import type { EveDynamicToolPart, EveMessage, EveMessagePart } from "eve/react";
import { UserButton } from "@clerk/nextjs";
import {
  Send,
  Bot,
  User,
  Sparkles,
  Loader2,
  Clock,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Wrench,
  SquarePen,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  const scrollAnchorRef = useRef<HTMLDivElement>(null);

  const agent = useEveAgent({
    headers: async () => ({
      // In production, append Clerk session tokens here, e.g.:
      // authorization: `Bearer ${await getClerkToken()}`,
    }),
  });

  const isBusy = agent.status === "submitted" || agent.status === "streaming";
  const messages = agent.data.messages;
  const isEmpty = messages.length === 0;

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, agent.status]);

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
    <div className="flex flex-1 flex-col h-full bg-background">
      {/* Minimal Top Header */}
      <header className="h-14 border-b border-border flex items-center justify-between px-4 sm:px-6 shrink-0">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
          </div>
          <span className="text-sm font-semibold text-foreground">Osprey</span>
          <span
            className={cn(
              "ml-2 h-1.5 w-1.5 rounded-full",
              isBusy ? "bg-accent animate-pulse-glow" : "bg-emerald-500"
            )}
            title={isBusy ? "Osprey is working" : "Osprey is ready"}
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label="New chat"
            onClick={() => agent.reset()}
            disabled={isBusy}
            className="text-muted-foreground"
          >
            <SquarePen className="h-4 w-4" />
          </Button>
          <UserButton />
        </div>
      </header>

      {/* Chat Column */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 flex flex-col min-h-full">
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
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}

              {agent.status === "submitted" && (
                <div className="flex items-center gap-3 bg-accent/10 border border-accent/20 px-4 py-2.5 rounded-full w-fit animate-pulse-glow">
                  <Loader2 className="h-4 w-4 text-accent animate-spin" />
                  <span className="text-xs font-semibold text-accent">
                    Osprey is thinking...
                  </span>
                </div>
              )}

              <div ref={scrollAnchorRef} />
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
      <div className="shrink-0 px-4 sm:px-6 pb-6 pt-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          className="max-w-2xl mx-auto relative flex items-center gap-2"
        >
          <Input
            type="text"
            placeholder="Message Osprey..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isBusy}
            className="h-12 pl-4 pr-12 rounded-full text-sm border-border shadow-sm"
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
  );
}

function ChatMessage({ message }: { readonly message: EveMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-3 max-w-[85%]", isUser ? "self-end flex-row-reverse ml-auto" : "self-start")}>
      <Avatar className="shrink-0">
        <AvatarFallback className={isUser ? "bg-muted text-foreground" : "bg-primary text-primary-foreground"}>
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </AvatarFallback>
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

"use client";

import { useRef, useEffect, useState } from "react";
import { 
  Terminal, 
  PanelRightClose, 
  ChevronDown, 
  ChevronUp, 
  Cpu, 
  FileCode, 
  Network, 
  Check, 
  CircleDot, 
  Ticket, 
  Clock, 
  CheckCircle2, 
  ExternalLink,
  Shield,
  Laptop,
  Wrench 
} from "lucide-react";
import type { EveMessage } from "eve/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const TICKET_TYPE_ICONS: Record<string, { icon: any; color: string }> = {
  access: { icon: Shield, color: "text-purple-600 bg-purple-50 border-purple-100" },
  security: { icon: Shield, color: "text-amber-600 bg-amber-50 border-amber-100" },
  license: { icon: Laptop, color: "text-blue-600 bg-blue-50 border-blue-100" },
  software: { icon: Laptop, color: "text-blue-600 bg-blue-50 border-blue-100" },
  devops: { icon: Cpu, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
  hardware: { icon: Laptop, color: "text-indigo-600 bg-indigo-50 border-indigo-100" },
};

export interface TicketItem {
  id: string;
  key: string;
  summary: string;
  status: string;
  type: string;
  severity: string;
}

interface DiagnosticsConsoleProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly messages: readonly EveMessage[];
  readonly isBusy: boolean;
  readonly onTicketClick?: (summary: string, id: string) => void;
  readonly activeTickets?: readonly TicketItem[];
  readonly resolvedTickets?: readonly TicketItem[];
}

export default function DiagnosticsConsole({ 
  isOpen, 
  onClose, 
  messages, 
  isBusy,
  onTicketClick,
  activeTickets = [],
  resolvedTickets = []
}: DiagnosticsConsoleProps) {
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const [isConsoleExpanded, setIsConsoleExpanded] = useState(false);

  // Extract streaming reasoning parts

  // Extract streaming reasoning parts
  const reasoningLogs: string[] = [];
  messages.forEach((msg) => {
    msg.parts.forEach((part) => {
      if (part.type === "reasoning" && part.text.trim()) {
        reasoningLogs.push(part.text);
      }
    });
  });

  // Scan for active running tools or subagents
  let activeToolName = "";
  let activeToolPayload: Record<string, unknown> | null = null;
  let activeToolState = "";

  messages.forEach((msg) => {
    msg.parts.forEach((part) => {
      if (part.type === "dynamic-tool") {
        const state = part.state;
        if (state === "input-available" || state === "approval-requested") {
          activeToolName = part.toolName;
          activeToolPayload = part.input as Record<string, unknown>;
          activeToolState = state;
        }
      }
    });
  });

  // Auto-scroll the reasoning logs terminal to the bottom as reasoning streams in
  useEffect(() => {
    if (isConsoleExpanded && isOpen) {
      terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [reasoningLogs.length, isConsoleExpanded, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="w-80 h-[82vh] min-h-[480px] max-h-[850px] bg-background border border-border rounded-2xl flex flex-col shadow-md overflow-hidden animate-in slide-in-from-right duration-300 shrink-0 text-slate-800">
      
      {/* Sidebar Header */}
      <div className="p-4 border-b border-border/40 flex items-center justify-between shrink-0 bg-slate-50/50">
        <span className="text-xs font-bold text-[#005F9E] tracking-wider flex items-center gap-1.5 uppercase font-mono">
          <Ticket className="h-4 w-4 text-[#005F9E]" />
          My Service Tickets
        </span>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose} 
          className="h-7 w-7 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100"
        >
          <PanelRightClose className="h-4 w-4" />
        </Button>
      </div>

      {/* Main stacked ticket display panel */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6 scroll-smooth">
        
        {/* Active Support Tickets */}
        <div className="flex flex-col gap-2.5">
          <span className="text-[10px] font-mono font-bold text-slate-400 tracking-widest uppercase px-1 flex items-center gap-1">
            <Clock className="h-3 w-3 text-slate-400" />
            Active Tickets ({activeTickets.length})
          </span>
          <div className="flex flex-col gap-2">
            {activeTickets.map((ticket) => {
              const typeMeta = TICKET_TYPE_ICONS[ticket.type.toLowerCase()] || { icon: Wrench, color: "text-slate-600 bg-slate-50 border-slate-100" };
              const IconComponent = typeMeta.icon;

              return (
                <Card 
                  key={ticket.id} 
                  onClick={() => onTicketClick?.(ticket.summary, ticket.key)}
                  className="border border-border/40 hover:border-[#005F9E]/30 hover:bg-slate-50/50 hover:shadow-xs transition-all duration-200 cursor-pointer group animate-in fade-in zoom-in-95 duration-250"
                >
                  <CardContent className="p-3.5 flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={cn("p-1 rounded-md border flex items-center justify-center shrink-0", typeMeta.color)}>
                          <IconComponent className="h-3 w-3" />
                        </div>
                        <span className="text-[10px] font-mono font-extrabold text-[#005F9E] tracking-wide flex items-center gap-0.5 truncate">
                          {ticket.key}
                          <ExternalLink className="h-2.5 w-2.5 opacity-0 group-hover:opacity-100 transition-opacity ml-1 text-[#005F9E] shrink-0" />
                        </span>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-[9px] uppercase px-1.5 py-0 rounded-full font-extrabold tracking-wide shrink-0",
                          ticket.status.toLowerCase() === "in progress" && "bg-blue-50 text-[#005F9E] border-blue-100",
                          (ticket.status.toLowerCase() === "pending approval" || ticket.status.toLowerCase() === "to do") && "bg-amber-50 text-[#FF9F1C] border-amber-100 animate-pulse-glow"
                        )}
                      >
                        {ticket.status}
                      </Badge>
                    </div>
                    <p className="text-xs font-semibold text-foreground leading-snug truncate">
                      {ticket.summary}
                    </p>
                    <div className="flex items-center justify-between text-[9px] text-muted-foreground mt-0.5 border-t border-slate-100/50 pt-1.5">
                      <span className="bg-slate-100 px-1.5 py-0.5 rounded font-semibold text-slate-500 capitalize">{ticket.type}</span>
                      <span className="font-medium text-muted-foreground/85">Severity: <span className="font-bold text-slate-700 capitalize">{ticket.severity}</span></span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Resolved Support Tickets */}
        <div className="flex flex-col gap-2.5">
          <span className="text-[10px] font-mono font-bold text-slate-400 tracking-widest uppercase px-1 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-slate-400" />
            Resolved Tickets ({resolvedTickets.length})
          </span>
          <div className="flex flex-col gap-2">
            {resolvedTickets.map((ticket) => {
              const typeMeta = TICKET_TYPE_ICONS[ticket.type.toLowerCase()] || { icon: Wrench, color: "text-slate-600 bg-slate-50 border-slate-100" };
              const IconComponent = typeMeta.icon;

              return (
                <Card 
                  key={ticket.id} 
                  onClick={() => onTicketClick?.(ticket.summary, ticket.key)}
                  className="border border-border/40 hover:border-emerald-500/20 hover:bg-slate-50/50 hover:shadow-xs transition-all duration-200 cursor-pointer group animate-in fade-in zoom-in-95 duration-250"
                >
                  <CardContent className="p-3.5 flex flex-col gap-2 bg-emerald-500/[0.01]">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={cn("p-1 rounded-md border flex items-center justify-center shrink-0", typeMeta.color)}>
                          <IconComponent className="h-3 w-3" />
                        </div>
                        <span className="text-[10px] font-mono font-extrabold text-slate-500 tracking-wide flex items-center gap-0.5 truncate">
                          {ticket.key}
                          <ExternalLink className="h-2.5 w-2.5 opacity-0 group-hover:opacity-100 transition-opacity ml-1 text-slate-400 shrink-0" />
                        </span>
                      </div>
                      <Badge variant="outline" className="text-[9px] uppercase px-1.5 py-0 rounded-full font-extrabold tracking-wide shrink-0 bg-emerald-50 text-emerald-600 border-emerald-100">
                        Resolved
                      </Badge>
                    </div>
                    <p className="text-xs font-semibold text-slate-500 leading-snug truncate">
                      {ticket.summary}
                    </p>
                    <div className="flex items-center justify-between text-[9px] text-muted-foreground mt-0.5 border-t border-slate-100/50 pt-1.5">
                      <span className="bg-slate-100 px-1.5 py-0.5 rounded font-semibold text-slate-400 capitalize">{ticket.type}</span>
                      <span className="font-medium text-slate-400/80">Severity: <span className="font-semibold text-slate-500 capitalize">{ticket.severity}</span></span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

      </div>

      {/* Minimizable / Collapsible AI Diagnostics Console Drawer at Bottom */}
      <div className="border-t border-border shrink-0 bg-slate-50/80 backdrop-blur-xs flex flex-col">
        {/* Toggle bar */}
        <button 
          onClick={() => setIsConsoleExpanded(!isConsoleExpanded)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-100 transition-colors"
        >
          <span className="text-xs font-mono font-black text-amber-600 tracking-wider flex items-center gap-1.5 uppercase">
            <Terminal className="h-4 w-4 text-amber-600 animate-pulse-glow" />
            AI Diagnostics Monitor
          </span>
          {isConsoleExpanded ? (
            <ChevronDown className="h-4 w-4 text-slate-500" />
          ) : (
            <ChevronUp className="h-4 w-4 text-slate-500" />
          )}
        </button>

        {/* Collapsible Content */}
        {isConsoleExpanded && (
          <div className="px-4 pb-4 flex flex-col gap-4 animate-in slide-in-from-bottom duration-300 max-h-[300px] overflow-y-auto border-t border-border/40 pt-3">
            
            {/* Reasoning Terminal Log */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] font-mono font-bold text-slate-400 tracking-widest uppercase flex items-center gap-1">
                <Cpu className="h-3 w-3" />
                Reasoning Logs
              </span>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-[10px] leading-relaxed overflow-y-auto flex flex-col gap-2 max-h-[140px] text-slate-300">
                {reasoningLogs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-1 py-4">
                    <CircleDot className={cn("h-3 w-3", isBusy ? "text-amber-500 animate-pulse" : "text-slate-700")} />
                    <p className="italic text-[9px]">
                      {isBusy ? "Osprey thinking..." : "Awaiting prompts..."}
                    </p>
                  </div>
                ) : (
                  <>
                    {reasoningLogs.map((log, index) => (
                      <p key={index} className="text-slate-300 select-all border-l-2 border-slate-800 pl-1.5">
                        {log}
                      </p>
                    ))}
                    {isBusy && (
                      <div className="flex items-center gap-0.5 text-amber-500 mt-0.5">
                        <span className="h-1 w-1 bg-amber-500 rounded-full animate-bounce" />
                        <span className="h-1 w-1 bg-amber-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                        <span className="h-1 w-1 bg-amber-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                      </div>
                    )}
                    <div ref={terminalEndRef} />
                  </>
                )}
              </div>
            </div>

            {/* Visual connectivity trace */}
            <div className="flex items-center justify-between text-[10px] bg-white border border-border rounded-lg p-2.5 shrink-0">
              <div className="flex items-center gap-1.5 font-mono">
                <Network className="h-3.5 w-3.5 text-slate-400" />
                <span className="font-semibold text-slate-600">Active Node:</span>
              </div>
              <Badge variant="outline" className="text-[8px] border-emerald-500/30 text-emerald-600 bg-emerald-500/5 font-black uppercase">
                {activeToolName ? (activeToolName.includes("-") ? activeToolName.split("-")[0] : "workspace") : "supervisor"}
              </Badge>
            </div>

            {/* Zod Inspector */}
            {activeToolPayload && (
              <div className="flex flex-col gap-1.5 animate-in fade-in duration-300 shrink-0">
                <span className="text-[9px] font-mono font-bold text-slate-400 tracking-widest uppercase flex items-center gap-1">
                  <FileCode className="h-3 w-3" />
                  Active Parameters
                </span>
                <pre className="bg-slate-950 border border-slate-800 text-amber-500 font-mono text-[9px] rounded-xl p-2.5 overflow-x-auto max-h-[100px] whitespace-pre-wrap select-all">
                  {JSON.stringify(activeToolPayload, null, 2)}
                </pre>
              </div>
            )}

          </div>
        )}
      </div>

    </div>
  );
}

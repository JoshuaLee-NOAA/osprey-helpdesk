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
  Wrench,
  Brain,
  Compass,
  ClipboardList,
  Workflow
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
  readonly messages: readonly EveMessage[];
  readonly isBusy: boolean;
  readonly onTicketClick?: (summary: string, id: string) => void;
  readonly activeTickets?: readonly TicketItem[];
  readonly resolvedTickets?: readonly TicketItem[];
}

export default function DiagnosticsConsole({ 
  isOpen, 
  messages, 
  isBusy,
  onTicketClick,
  activeTickets = [],
  resolvedTickets = []
}: DiagnosticsConsoleProps) {
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const [isConsoleExpanded, setIsConsoleExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"timeline" | "diagnostics">("timeline");

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

  // Chronological list of all tool and subagent calls
  const toolCallsMap = new Map<string, {
    toolName: string;
    displayName: string;
    state: string;
    isSubagent: boolean;
    input: any;
    output: any;
    errorText?: string;
  }>();

  messages.forEach((msg) => {
    msg.parts.forEach((part) => {
      if (part.type === "dynamic-tool") {
        const key = (part as any).toolCallId || part.toolName;
        const kind = (part as any).toolMetadata?.eve?.kind;
        const displayName = (part as any).toolMetadata?.eve?.name ?? part.toolName;
        const isSubagent = kind === "subagent-call";

        toolCallsMap.set(key, {
          toolName: part.toolName,
          displayName,
          state: part.state,
          isSubagent,
          input: part.input,
          output: part.output,
          errorText: (part as any).errorText
        });
      }
    });
  });

  const toolCalls = Array.from(toolCallsMap.entries()).map(([id, info]) => ({
    id,
    ...info
  }));

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
          <ClipboardList className="h-4 w-4 text-[#005F9E]" />
          My Service Tickets
        </span>
      </div>

      {/* Main stacked ticket display panel */}
      <div className={cn(
        "overflow-y-auto p-4 flex flex-col gap-6 scroll-smooth transition-all duration-300",
        isConsoleExpanded ? "h-0 flex-0 p-0 overflow-hidden border-none" : "flex-1"
      )}>
        
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

      {/* Collapsible Tool & Agent Activity Timeline Drawer at Bottom */}
      <div className={cn(
        "border-t border-border bg-slate-50/95 backdrop-blur-xs flex flex-col transition-all duration-300",
        isConsoleExpanded ? "flex-1 min-h-0" : "shrink-0"
      )}>
        {/* Toggle bar */}
        <button 
          onClick={() => setIsConsoleExpanded(!isConsoleExpanded)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-100 transition-colors"
        >
          <span className="text-xs font-mono font-black text-[#005F9E] tracking-wider flex items-center gap-1.5 uppercase">
            <Workflow className="h-4 w-4 text-[#005F9E] animate-pulse" />
            Agent & Tool Activity
          </span>
          {isConsoleExpanded ? (
            <ChevronDown className="h-4 w-4 text-slate-500" />
          ) : (
            <ChevronUp className="h-4 w-4 text-slate-500" />
          )}
        </button>

        {/* Collapsible Content */}
        {isConsoleExpanded && (
          <div className="px-5 pb-5 flex flex-col gap-4 animate-in slide-in-from-bottom duration-300 flex-1 overflow-y-auto border-t border-border/40 pt-3.5 min-h-0">
            
            {/* Tabs Bar */}
            <div className="flex border-b border-border/40 shrink-0 select-none mb-1 gap-4">
              <button
                onClick={() => setActiveTab("timeline")}
                className={cn(
                  "pb-2 text-xs font-mono font-bold border-b-2 transition-all px-1 flex items-center gap-1.5",
                  activeTab === "timeline" 
                    ? "border-[#005F9E] text-[#005F9E]" 
                    : "border-transparent text-slate-400 hover:text-slate-600"
                )}
              >
                <Workflow className="h-3.5 w-3.5" />
                Timeline
              </button>
              <button
                onClick={() => setActiveTab("diagnostics")}
                className={cn(
                  "pb-2 text-xs font-mono font-bold border-b-2 transition-all px-1 flex items-center gap-1.5",
                  activeTab === "diagnostics" 
                    ? "border-[#005F9E] text-[#005F9E]" 
                    : "border-transparent text-slate-400 hover:text-slate-600"
                )}
              >
                <Terminal className="h-3.5 w-3.5" />
                Thought Terminal
                {isBusy && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />}
              </button>
            </div>

            {/* Tab 1: Activity Timeline */}
            {activeTab === "timeline" && (
              <div className="flex flex-col gap-4 flex-1 min-h-0">
                {/* Minimalist Sub-Header */}
                <p className="text-[10px] text-muted-foreground font-medium italic select-none">
                  Chronological log of specialized subagent handoffs and executed backend integrations.
                </p>

                {/* Timeline component */}
                <div className="flex flex-col gap-4 pl-3 border-l border-slate-200 ml-1.5 flex-1 overflow-y-auto">
                  {toolCalls.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-2">
                      <Compass className={cn("h-5 w-5", isBusy ? "animate-spin text-[#005F9E]" : "text-slate-300")} />
                      <p className="text-xs font-medium italic">
                        {isBusy ? "Initiating systems..." : "No active calls. Tools will display here as they run!"}
                      </p>
                    </div>
                  ) : (
                    <>
                      {toolCalls.map((call, index) => {
                        const isSubagent = call.isSubagent;

                        // Extract nice meta descriptions from input and output
                        const metaRows: { label: string; value: string }[] = [];
                        const inputObj = call.input as Record<string, any> || {};
                        const outputObj = call.output as Record<string, any> || {};

                        // Extract input fields
                        if (inputObj.summary) {
                          metaRows.push({ label: "Summary", value: inputObj.summary });
                        }
                        if (inputObj.query || inputObj.jql) {
                          metaRows.push({ label: "Query", value: inputObj.query || inputObj.jql });
                        }
                        if (inputObj.prompt || inputObj.task) {
                          metaRows.push({ label: "Task", value: inputObj.prompt || inputObj.task });
                        }
                        if (inputObj.assignee) {
                          metaRows.push({ label: "Assignee", value: inputObj.assignee });
                        }

                        // Extract output fields (e.g. Jira key or success message)
                        if (outputObj.key || outputObj.id) {
                          metaRows.push({ label: "Key", value: outputObj.key || outputObj.id });
                        }
                        if (outputObj.status) {
                          metaRows.push({ label: "Status", value: outputObj.status });
                        }

                        // Tool state metadata mapping
                        const stateMetaMap: Record<string, { label: string; className: string; bg: string }> = {
                          "input-streaming": { label: "Pending", className: "text-slate-400", bg: "bg-slate-100 border-slate-200" },
                          "input-available": { label: "Running", className: "text-blue-600", bg: "bg-blue-50 border-blue-100 animate-pulse" },
                          "approval-requested": { label: "Approval Required", className: "text-amber-600", bg: "bg-amber-50 border-amber-100 animate-pulse" },
                          "approval-responded": { label: "Responded", className: "text-slate-500", bg: "bg-slate-100 border-slate-200" },
                          "output-available": { label: "Completed", className: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" },
                          "output-error": { label: "Failed", className: "text-red-600", bg: "bg-red-50 border-red-100" },
                          "output-denied": { label: "Denied", className: "text-orange-600", bg: "bg-orange-50 border-orange-100" },
                        };

                        const stateMeta = stateMetaMap[call.state] || { label: call.state, className: "text-slate-500", bg: "bg-slate-100 border-slate-200" };

                        return (
                          <div key={call.id} className="flex flex-col gap-1.5 relative animate-in fade-in slide-in-from-left-2 duration-300">
                            {/* Timeline Connector Node */}
                            <div className={cn(
                              "absolute -left-[17px] top-1 h-3.5 w-3.5 rounded-full border-2 border-white shadow-xs flex items-center justify-center z-10",
                              call.state === "input-available" || call.state === "approval-requested"
                                ? "bg-[#FF9F1C] text-white"
                                : call.state === "output-available"
                                  ? "bg-emerald-500 text-white"
                                  : call.state === "output-error" || call.state === "output-denied"
                                    ? "bg-red-500 text-white"
                                    : "bg-[#005F9E] text-white"
                            )}>
                              {isSubagent ? (
                                <Cpu className="h-1.5 w-1.5" />
                              ) : (
                                <Wrench className="h-1.5 w-1.5" />
                              )}
                            </div>

                            {/* Content Card */}
                            <div className="bg-white border border-slate-150 rounded-xl p-3 shadow-xs flex flex-col gap-2">
                              {/* Card Header */}
                              <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5">
                                <div className="flex flex-col min-w-0">
                                  <span className="text-[10px] font-mono font-extrabold uppercase text-[#005F9E] leading-none tracking-wider">
                                    {isSubagent ? "Subagent Call" : "System Tool"}
                                  </span>
                                  <span className="text-xs font-extrabold text-slate-800 truncate mt-0.5">
                                    {call.displayName}
                                  </span>
                                </div>
                                <span className={cn("text-[9px] font-black uppercase px-2 py-0.5 rounded-full border tracking-wide", stateMeta.className, stateMeta.bg)}>
                                  {stateMeta.label}
                                </span>
                              </div>

                              {/* Meta Key-Value Grid */}
                              {metaRows.length > 0 ? (
                                <div className="grid grid-cols-1 gap-1">
                                  {metaRows.map((row, idx) => (
                                    <div key={idx} className="flex items-start gap-1 text-[10px] leading-relaxed">
                                      <span className="font-mono font-black text-slate-400 uppercase w-14 shrink-0">{row.label}:</span>
                                      <span className="text-slate-600 font-semibold truncate flex-1">{row.value}</span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-[10px] text-slate-400 font-medium italic">
                                  Invoking pipeline parameters...
                                </p>
                              )}

                              {/* Error block if failed */}
                              {(call.state === "output-error" && call.errorText) && (
                                <div className="text-[9px] bg-red-50 text-red-700 border border-red-100 rounded-lg p-2 font-mono break-all select-all">
                                  {call.errorText}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      {isBusy && (
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#FF9F1C] pl-1 py-1">
                          <span className="h-1.5 w-1.5 bg-[#FF9F1C] rounded-full animate-bounce" />
                          <span className="h-1.5 w-1.5 bg-[#FF9F1C] rounded-full animate-bounce [animation-delay:0.2s]" />
                          <span className="h-1.5 w-1.5 bg-[#FF9F1C] rounded-full animate-bounce [animation-delay:0.4s]" />
                          Running subagent processes...
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Tab 2: Retro Green Diagnostics Terminal */}
            {activeTab === "diagnostics" && (
              <div className="flex flex-col gap-3.5 flex-1 min-h-0">
                <p className="text-[10px] text-muted-foreground font-medium italic select-none">
                  Real-time terminal streaming the agent's actual thoughts, reasoning steps, and background execution traces.
                </p>
                <div className="flex-1 bg-slate-950 text-emerald-400 font-mono text-[10.5px] p-4 rounded-xl border border-slate-800 shadow-inner overflow-y-auto leading-relaxed flex flex-col gap-2 min-h-[180px] max-h-[450px]">
                  {reasoningLogs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-2 select-none py-10">
                      <Terminal className={cn("h-5 w-5", isBusy ? "animate-pulse text-emerald-500" : "text-slate-700")} />
                      <p className="text-xs italic text-center">
                        {isBusy ? "Establishing secure log bridge..." : "Diagnostics idle. Start a chat to stream logs!"}
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {reasoningLogs.map((log, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 break-words whitespace-pre-wrap select-all">
                          <span className="text-[#005F9E] select-none shrink-0 font-bold">&gt;</span>
                          <span className="text-emerald-400">{log}</span>
                        </div>
                      ))}
                      {isBusy && (
                        <div className="flex items-center gap-1.5 text-emerald-500 select-none animate-pulse shrink-0 font-bold mt-1">
                          <span>&gt;</span>
                          <span className="animate-ping">●</span>
                          <span className="ml-1 text-xs text-emerald-500">Processing next logical step...</span>
                        </div>
                      )}
                    </div>
                  )}
                  <div ref={terminalEndRef} />
                </div>
              </div>
            )}

          </div>
        )}
      </div>

    </div>
  );
}

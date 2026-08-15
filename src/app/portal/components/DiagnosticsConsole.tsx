"use client";

import { useState } from "react";
import { 
  Cpu, 
  Wrench, 
  Compass, 
  Workflow,
  Clock, 
  CheckCircle2, 
  XCircle, 
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Terminal,
  Activity
} from "lucide-react";
import type { EveMessage } from "eve/react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DiagnosticsConsoleProps {
  readonly isOpen: boolean;
  readonly messages: readonly EveMessage[];
  readonly isBusy: boolean;
}

export default function DiagnosticsConsole({ 
  isOpen, 
  messages, 
  isBusy
}: DiagnosticsConsoleProps) {
  const [expandedDetails, setExpandedDetails] = useState<Record<string, boolean>>({});

  const toggleDetails = (id: string) => {
    setExpandedDetails((prev) => ({ ...prev, [id]: !prev[id] }));
  };

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
        const isSubagent = kind === "subagent-call" || part.toolName?.includes("agent") || part.toolName?.includes("jira") || part.toolName?.includes("workspace");

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

  if (!isOpen) return null;

  return (
    <div className="w-80 h-[82vh] min-h-[480px] max-h-[850px] bg-background border border-border rounded-2xl flex flex-col shadow-md overflow-hidden animate-in slide-in-from-right duration-300 shrink-0 text-slate-800">
      
      {/* Sidebar Header */}
      <div className="p-3.5 border-b border-slate-800 flex items-center justify-between shrink-0 bg-gradient-to-r from-slate-900 via-slate-900 to-[#003087]/90 shadow-xs">
        <div className="flex items-center gap-2">
          <Workflow className="h-4 w-4 text-[#FF9F1C] animate-pulse" />
          <span className="text-xs font-mono font-black text-cyan-400 tracking-wider uppercase">
            Agent & Tool Activity
          </span>
        </div>
        
        {isBusy ? (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-[#FF9F1C] border border-amber-500/30 animate-pulse">
            <span className="h-1.5 w-1.5 rounded-full bg-[#FF9F1C]" />
            Running
          </span>
        ) : toolCalls.length > 0 ? (
          <Badge variant="outline" className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800/80 text-cyan-300 border-slate-700">
            {toolCalls.length} {toolCalls.length === 1 ? "Event" : "Events"}
          </Badge>
        ) : (
          <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
            <Activity className="h-3 w-3 text-slate-400" />
            Idle
          </span>
        )}
      </div>

      {/* Main Activity Timeline Feed */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 scroll-smooth">
        {toolCalls.length === 0 && !isBusy ? (
          <div className="flex flex-col items-center justify-center h-full py-16 text-center px-4 gap-3 text-slate-400">
            <div className="p-3.5 rounded-2xl bg-slate-100/70 border border-slate-200/60 shadow-xs">
              <Compass className="h-6 w-6 text-[#005F9E]/70 animate-pulse" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-xs font-bold text-slate-700 font-mono">
                No Tool Activity Yet
              </p>
              <p className="text-[11px] text-muted-foreground leading-relaxed max-w-[200px]">
                Subagent calls, Jira workflows, and system tools will stream here in real time.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 pl-3.5 border-l-2 border-slate-200 ml-2 mt-1 pr-1 pb-4">
            {toolCalls.map((call) => {
              const isSubagent = call.isSubagent;
              const isExpanded = !!expandedDetails[call.id];

              // Extract readable meta values from input and output
              const metaRows: { label: string; value: string }[] = [];
              const inputObj = (call.input as Record<string, any>) || {};
              const outputObj = (call.output as Record<string, any>) || {};

              if (inputObj.summary) metaRows.push({ label: "Summary", value: inputObj.summary });
              if (inputObj.query || inputObj.jql) metaRows.push({ label: "Query", value: inputObj.query || inputObj.jql });
              if (inputObj.prompt || inputObj.task) metaRows.push({ label: "Task", value: inputObj.prompt || inputObj.task });
              if (inputObj.assignee) metaRows.push({ label: "Assignee", value: inputObj.assignee });
              if (inputObj.userEmail) metaRows.push({ label: "User", value: inputObj.userEmail });

              if (outputObj.key || outputObj.id) metaRows.push({ label: "Key", value: outputObj.key || outputObj.id });
              if (outputObj.status) metaRows.push({ label: "Status", value: outputObj.status });
              if (outputObj.action) metaRows.push({ label: "Action", value: outputObj.action });

              // State styling meta
              const stateMetaMap: Record<string, { label: string; className: string; bg: string; dotBg: string }> = {
                "input-streaming": { label: "Pending", className: "text-slate-400", bg: "bg-slate-100 border-slate-200", dotBg: "bg-slate-400" },
                "input-available": { label: "Running", className: "text-amber-800", bg: "bg-amber-50 border-amber-200", dotBg: "bg-[#FF9F1C]" },
                "approval-requested": { label: "Approval Required", className: "text-amber-800", bg: "bg-amber-50 border-amber-200", dotBg: "bg-[#FF9F1C]" },
                "approval-responded": { label: "Responded", className: "text-slate-600", bg: "bg-slate-100 border-slate-200", dotBg: "bg-slate-500" },
                "output-available": { label: "Completed", className: "text-emerald-800 font-bold", bg: "bg-emerald-50 border-emerald-200", dotBg: "bg-emerald-500" },
                "output-error": { label: "Failed", className: "text-red-800", bg: "bg-red-50 border-red-200", dotBg: "bg-red-500" },
                "output-denied": { label: "Denied", className: "text-orange-800", bg: "bg-orange-50 border-orange-200", dotBg: "bg-orange-500" },
              };

              const stateMeta = stateMetaMap[call.state] || { 
                label: call.state, 
                className: "text-slate-500", 
                bg: "bg-slate-100 border-slate-200", 
                dotBg: "bg-[#005F9E]" 
              };

              return (
                <div key={call.id} className="flex flex-col gap-1.5 relative animate-in fade-in slide-in-from-left-2 duration-300">
                  {/* Timeline Node Dot */}
                  <div className={cn(
                    "absolute -left-[22px] top-1 h-4 w-4 rounded-full border-2 border-white shadow-xs flex items-center justify-center z-10",
                    stateMeta.dotBg,
                    (call.state === "input-available" || call.state === "approval-requested") && "animate-pulse"
                  )}>
                    {isSubagent ? (
                      <Cpu className="h-2 w-2 text-white" />
                    ) : (
                      <Wrench className="h-2 w-2 text-white" />
                    )}
                  </div>

                  {/* Content Card */}
                  <Card className="border border-slate-200/90 bg-white rounded-xl shadow-xs overflow-hidden">
                    <CardContent className="p-3 flex flex-col gap-2">
                      {/* Card Header */}
                      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5">
                        <div className="flex flex-col min-w-0">
                          <span className={cn(
                            "text-[9px] font-mono font-black uppercase leading-none tracking-wider", 
                            isSubagent ? "text-[#005F9E]" : "text-indigo-600"
                          )}>
                            {isSubagent ? "Subagent Call" : "System Tool"}
                          </span>
                          <span className="text-xs font-bold text-slate-900 truncate mt-0.5">
                            {call.displayName}
                          </span>
                        </div>
                        <span className={cn(
                          "text-[9px] font-mono font-extrabold uppercase px-2 py-0.5 rounded-full border tracking-wide shrink-0", 
                          stateMeta.className, 
                          stateMeta.bg
                        )}>
                          {stateMeta.label}
                        </span>
                      </div>

                      {/* Summary Key-Values */}
                      {metaRows.length > 0 ? (
                        <div className="grid grid-cols-1 gap-1">
                          {metaRows.map((row, idx) => (
                            <div key={idx} className="flex items-start gap-1 text-[10px] leading-relaxed">
                              <span className="font-mono font-bold text-slate-400 uppercase w-14 shrink-0">{row.label}:</span>
                              <span className="text-slate-700 font-medium truncate flex-1">{row.value}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[10px] text-slate-400 font-mono italic">
                          Executing tool parameters...
                        </p>
                      )}

                      {/* Error block if failed */}
                      {call.state === "output-error" && call.errorText && (
                        <div className="text-[9px] bg-red-50 text-red-700 border border-red-200 rounded-lg p-2 font-mono break-all select-all">
                          {call.errorText}
                        </div>
                      )}

                      {/* Expandable Raw Payload / Result Inspector */}
                      {(call.input || call.output) && (
                        <div className="border-t border-slate-100 pt-1.5 mt-0.5">
                          <button
                            type="button"
                            onClick={() => toggleDetails(call.id)}
                            className="flex items-center justify-between w-full text-[10px] font-mono font-semibold text-slate-500 hover:text-[#005F9E] transition-colors"
                          >
                            <span className="flex items-center gap-1">
                              <Terminal className="h-3 w-3" />
                              {isExpanded ? "Hide Details" : "Inspect Payload"}
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="h-3 w-3" />
                            ) : (
                              <ChevronDown className="h-3 w-3" />
                            )}
                          </button>
                          {isExpanded && (
                            <div className="mt-2 flex flex-col gap-1.5 animate-in fade-in duration-200">
                              {call.input && (
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">Input:</span>
                                  <pre className="text-[9px] bg-slate-900 text-slate-100 rounded-lg p-2 overflow-x-auto whitespace-pre font-mono leading-tight">
                                    {JSON.stringify(call.input, null, 2)}
                                  </pre>
                                </div>
                              )}
                              {call.output && (
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">Output:</span>
                                  <pre className="text-[9px] bg-slate-900 text-emerald-400 rounded-lg p-2 overflow-x-auto whitespace-pre font-mono leading-tight">
                                    {JSON.stringify(call.output, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              );
            })}

            {/* Pulsing Active Node at bottom of timeline when agent is busy */}
            {isBusy && (
              <div className="flex flex-col gap-1.5 relative animate-in fade-in slide-in-from-left-2 duration-300">
                <div className="absolute -left-[22px] top-1 h-4 w-4 rounded-full border-2 border-white shadow-xs bg-[#FF9F1C] text-slate-950 flex items-center justify-center z-10 animate-pulse">
                  <Compass className="h-2.5 w-2.5 animate-spin text-slate-950" />
                </div>

                <div className="bg-amber-50/90 border border-amber-200/90 rounded-xl p-3 shadow-xs flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF9F1C] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF9F1C]"></span>
                    </span>
                    <span className="text-xs font-mono font-extrabold text-amber-900 uppercase tracking-wider">
                      Active Process
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-full border border-amber-200 uppercase shrink-0">
                    Executing...
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}

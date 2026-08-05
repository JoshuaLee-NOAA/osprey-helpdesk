import {
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Loader2,
  XCircle,
  Wrench,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

/**
 * Internal design-system preview page.
 *
 * Not linked from primary navigation and not covered by the auth
 * middleware matcher (`/portal`, `/dashboard`, `/api/agent/resume`), so it's
 * reachable in local dev for visually verifying brand tokens and base
 * shadcn/ui components before they're composed into real Osprey screens.
 */

const SWATCHES: Array<{
  name: string;
  variable: string;
  hex: string;
  textClassName: string;
}> = [
  { name: "NOAA Dark Blue", variable: "--primary", hex: "#003087", textClassName: "text-white" },
  { name: "Process Light Blue", variable: "--secondary", hex: "#0085CA", textClassName: "text-white" },
  { name: "Osprey Amber", variable: "--accent", hex: "#FF9F1C", textClassName: "text-[#003087]" },
  { name: "Background", variable: "--background", hex: "#FFFFFF", textClassName: "text-foreground" },
  { name: "Card", variable: "--card", hex: "#F8FAFC", textClassName: "text-foreground" },
  { name: "Muted", variable: "--muted", hex: "#F1F5F9", textClassName: "text-foreground" },
];

const TOOL_STATES: Array<{
  label: string;
  icon: typeof Clock;
  className: string;
}> = [
  { label: "Pending", icon: Clock, className: "text-muted-foreground" },
  { label: "Running", icon: Loader2, className: "text-secondary animate-spin" },
  { label: "Awaiting Approval", icon: ShieldAlert, className: "text-accent" },
  { label: "Completed", icon: CheckCircle2, className: "text-emerald-600" },
  { label: "Error", icon: XCircle, className: "text-destructive" },
];

export default function StyleGuidePage() {
  return (
    <div className="min-h-screen bg-muted/30 py-12 px-6">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <header className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg">
              <Sparkles className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Osprey Design System
              </h1>
              <p className="text-sm text-muted-foreground">
                NOAA / Osprey Amber brand tokens &amp; shadcn/ui component preview
              </p>
            </div>
          </div>
        </header>

        {/* Color Palette */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Color Palette</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {SWATCHES.map((swatch) => (
              <div
                key={swatch.variable}
                className="rounded-xl overflow-hidden border border-border shadow-sm"
              >
                <div
                  className={`h-20 flex items-end p-3 ${swatch.textClassName}`}
                  style={{ backgroundColor: swatch.hex }}
                >
                  <span className="text-xs font-semibold">{swatch.hex}</span>
                </div>
                <div className="bg-background p-3">
                  <p className="text-sm font-medium text-foreground">{swatch.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{swatch.variable}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <Separator />

        {/* Typography */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Typography (Lato)</h2>
          <Card>
            <CardContent className="space-y-3 pt-4">
              <h1 className="text-4xl font-bold text-foreground">Heading 1 — Osprey Helpdesk</h1>
              <h2 className="text-2xl font-semibold text-foreground">Heading 2 — Incident Triage</h2>
              <h3 className="text-lg font-medium text-foreground">Heading 3 — Ticket Summary</h3>
              <p className="text-sm text-foreground">
                Body text — Describe an IT issue, ask for a status update, or request a support
                session. Osprey will route your request to the right specialist agent.
              </p>
              <p className="text-xs text-muted-foreground">
                Muted / caption text — Last updated 2 minutes ago.
              </p>
            </CardContent>
          </Card>
        </section>

        <Separator />

        {/* Buttons */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Buttons</h2>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="default">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Link</Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon" aria-label="Wrench">
              <Wrench />
            </Button>
          </div>
        </section>

        <Separator />

        {/* Badges & HITL Status Indicators */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Badges &amp; Agent Status</h2>
          <div className="flex flex-wrap items-center gap-3">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge className="bg-accent text-accent-foreground border-transparent">
              Osprey Amber
            </Badge>
          </div>

          <div className="flex flex-wrap gap-3">
            {TOOL_STATES.map(({ label, icon: Icon, className }) => (
              <div
                key={label}
                className="flex items-center gap-1.5 text-xs font-semibold bg-background border border-border rounded-full px-3 py-1.5"
              >
                <Icon className={`h-3.5 w-3.5 ${className}`} />
                <span className={className}>{label}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 bg-accent/10 border border-accent/20 px-4 py-2.5 rounded-full w-fit animate-pulse-glow">
            <Loader2 className="h-4 w-4 text-accent animate-spin" />
            <span className="text-xs font-semibold text-accent">
              Osprey invoking Jira agent...
            </span>
          </div>
        </section>

        <Separator />

        {/* Form elements */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Form Elements</h2>
          <Card>
            <CardContent className="space-y-4 pt-4 max-w-sm">
              <div className="space-y-1.5">
                <Label htmlFor="sg-email">Email</Label>
                <Input id="sg-email" type="email" placeholder="you@noaa.gov" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sg-issue">Describe your issue</Label>
                <Input id="sg-issue" placeholder="My monitor won't turn on" />
              </div>
            </CardContent>
          </Card>
        </section>

        <Separator />

        {/* Cards */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Cards</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Ticket #OSP-1042</CardTitle>
                <CardDescription>Hardware — Broken mouse</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Drafted by Jira sub-agent. Awaiting IT staff triage.
                </p>
              </CardContent>
            </Card>
            <Card className="border-accent/40 bg-accent/5 animate-pulse-glow">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Wrench className="h-4 w-4 text-muted-foreground" />
                    send-gmail
                    <Badge variant="outline" className="text-[10px] uppercase font-semibold">
                      Tool
                    </Badge>
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-accent">
                    <ShieldAlert className="h-3.5 w-3.5" />
                    Awaiting Approval
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  High-risk send targeting an external domain — suspended via Eve&apos;s{" "}
                  <code>needsApproval</code>.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator />

        {/* Avatars */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Avatars</h2>
          <div className="flex items-center gap-4">
            <Avatar size="sm">
              <AvatarFallback className="bg-primary text-primary-foreground">JL</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarFallback className="bg-secondary text-secondary-foreground">OS</AvatarFallback>
            </Avatar>
            <Avatar size="lg">
              <AvatarFallback className="bg-accent text-accent-foreground">IT</AvatarFallback>
            </Avatar>
          </div>
        </section>

        <Separator />

        {/* Tabs */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Tabs</h2>
          <Tabs defaultValue="queue">
            <TabsList>
              <TabsTrigger value="queue">Pending Approvals</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
            <TabsContent value="queue" className="pt-3">
              <p className="text-sm text-muted-foreground">
                Live HITL approval queue would render here.
              </p>
            </TabsContent>
            <TabsContent value="history" className="pt-3">
              <p className="text-sm text-muted-foreground">
                Resolved transaction history would render here.
              </p>
            </TabsContent>
          </Tabs>
        </section>

        <Separator />

        {/* Table (HITL queue preview) */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">
            Data Table — HITL Approval Queue Preview
          </h2>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction</TableHead>
                  <TableHead>Tool</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-mono text-xs">txn_8f21ac</TableCell>
                  <TableCell>send-gmail</TableCell>
                  <TableCell>
                    <Badge className="bg-accent text-accent-foreground border-transparent">
                      High
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-accent">
                      <ShieldAlert className="h-3.5 w-3.5" />
                      Awaiting Approval
                    </span>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-xs">txn_5b90de</TableCell>
                  <TableCell>create-issue</TableCell>
                  <TableCell>
                    <Badge variant="secondary">Low</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Completed
                    </span>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Card>
        </section>

        <Separator />

        {/* Dialog */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Dialog</h2>
          <Dialog>
            <DialogTrigger render={<Button variant="outline" />}>
              Open Inspector Preview
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Approve tool execution?</DialogTitle>
                <DialogDescription>
                  Review the raw JSON payload before approving, modifying, or rejecting this
                  suspended workflow.
                </DialogDescription>
              </DialogHeader>
              <pre className="text-xs bg-muted/60 rounded-lg p-3 overflow-x-auto text-muted-foreground">
                {JSON.stringify({ to: "external@domain.com", subject: "CRITICAL" }, null, 2)}
              </pre>
              <DialogFooter>
                <Button variant="destructive">Reject</Button>
                <Button variant="secondary">Modify &amp; Run</Button>
                <Button>Approve</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </section>
      </div>
    </div>
  );
}

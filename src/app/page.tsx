import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import {
  ShieldCheck,
  ArrowRight,
  MessageSquareText,
  Workflow,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    const user = await currentUser();
    const role = user?.publicMetadata?.role;
    if (role === "IT_Admin") {
      redirect("/dashboard/hitl");
    } else {
      redirect("/portal");
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background text-foreground animate-moving-bg">
      {/* Animated aurora background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 select-none"
      >
        {/* Ambient floating circles */}
        <div className="animate-aurora absolute -top-40 -left-40 h-[560px] w-[560px] rounded-full bg-[#0085CA]/15 blur-[140px]" />
        <div className="animate-aurora-slow absolute top-1/3 -right-48 h-[480px] w-[480px] rounded-full bg-[#003087]/12 blur-[140px]" />
        <div className="animate-aurora absolute -bottom-48 left-1/3 h-[420px] w-[420px] rounded-full bg-[#FF9F1C]/10 blur-[120px]" />

        {/* Vibrant Saturated Corner Glows */}
        <div className="absolute -top-60 -left-60 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-[#003087]/30 to-[#005F9E]/20 blur-[150px] dark:from-[#00103a]/75 dark:to-[#002244]/45" />
        <div className="absolute -top-60 -right-60 h-[500px] w-[500px] rounded-full bg-gradient-to-bl from-[#005F9E]/25 to-[#0085CA]/20 blur-[150px] dark:from-[#002244]/65 dark:to-[#003355]/45" />
        <div className="absolute -bottom-60 -left-60 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-[#FF9F1C]/20 to-[#FF9F1C]/10 blur-[150px] dark:from-[#aa3c00]/45 dark:to-[#661c00]/25" />
        <div className="absolute -bottom-60 -right-60 h-[500px] w-[500px] rounded-full bg-gradient-to-tl from-[#0085CA]/25 to-[#003087]/20 blur-[150px] dark:from-[#002244]/65 dark:to-[#00103a]/55" />

        {/* Dark Vignette Overlay for rich corner depth */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.06)_100%)] dark:bg-[radial-gradient(circle_at_center,transparent_15%,rgba(0,0,0,0.55)_100%)]" />
      </div>

      <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-6 py-20 text-center">
        {/* Assist chip */}
        <div className="glass-panel-float mb-10 inline-flex items-center gap-2 rounded-full px-4 py-1.5 shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
          <span className="text-xs font-semibold tracking-wide text-primary">
            AI-Powered Autonomous IT Operations
          </span>
        </div>

        {/* Headline with inline floating brand logo, bubbles, and static gradient */}
        <h1 className="mb-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-6xl font-black tracking-tight md:text-8xl">
          {/* Logo container with float & staggered bubbles */}
          <div className="relative inline-flex items-center select-none">
            <img
              src="/logo.svg"
              alt="Osprey Logo"
              className="animate-float h-16 w-auto drop-shadow-xl transition-all duration-500 hover:scale-[1.08] md:h-22"
            />
            {/* Ambient staggered bubbles */}
            <span className="animate-bubble-1 absolute -top-3 -right-1 size-2 rounded-full border border-primary/40 bg-primary/5" />
            <span className="animate-bubble-2 absolute -top-1 -right-4 size-3 rounded-full border border-secondary/50 bg-secondary/5" />
            <span className="animate-bubble-3 absolute -top-2 -left-3 size-1.5 rounded-full border border-accent/40 bg-accent/5" />
          </div>

          <span className="bg-gradient-to-r from-[#003087] via-[#005F9E] to-[#FF9F1C] bg-clip-text text-transparent dark:from-[#3146a2] dark:via-[#1da3c0] dark:to-[#FF9F1C]">
            OSPREY
          </span>
          <span className="mt-1 block w-full text-center text-3xl font-bold tracking-tight text-foreground md:text-5xl">
            Autonomous IT Helpdesk
          </span>
        </h1>

        {/* Supporting copy */}
        <p className="mb-12 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
          Describe your IT issue in plain language. Osprey&apos;s specialized
          agents triage, ticket, and schedule — while every high-risk action
          waits for a human&apos;s approval.
        </p>

        {/* CTAs */}
        <div className="mb-20 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <SignInButton mode="modal">
            <Button className="relative h-12 rounded-full px-12 min-w-[220px] text-base font-semibold shadow-lg shadow-primary/20 transition-transform hover:scale-[1.03] flex items-center justify-center">
              <span>Sign in to Portal</span>
              <ArrowRight className="absolute right-6 size-4" />
            </Button>
          </SignInButton>

          <SignUpButton mode="modal">
            <Button
              variant="outline"
              className="h-12 rounded-full px-12 min-w-[220px] text-base font-semibold transition-transform hover:scale-[1.03]"
            >
              Create Account
            </Button>
          </SignUpButton>
        </div>

        {/* Feature cards */}
        <div className="grid w-full grid-cols-1 gap-5 text-left md:grid-cols-3">
          <div className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
            <div className="mb-4 inline-flex size-11 items-center justify-center rounded-xl bg-secondary/10">
              <MessageSquareText className="size-5 text-secondary" />
            </div>
            <h3 className="mb-1.5 font-bold text-foreground">
              Conversational Portal
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Describe issues naturally. Specialized agents draft Jira tickets
              and automate setups instantly — no forms.
            </p>
          </div>

          <div className="group rounded-2xl border border-accent/20 bg-accent/5 p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md animate-border-glow">
            <div className="mb-4 inline-flex size-11 items-center justify-center rounded-xl bg-accent/15">
              <ShieldCheck className="size-5 text-accent" />
            </div>
            <h3 className="mb-1.5 font-bold text-foreground">
              Human-in-the-Loop Control
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              High-risk actions pause durably for IT Admin review — approve,
              modify, or reject before anything executes.
            </p>
          </div>

          <div className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
            <div className="mb-4 inline-flex size-11 items-center justify-center rounded-xl bg-primary/10">
              <Workflow className="size-5 text-primary" />
            </div>
            <h3 className="mb-1.5 font-bold text-foreground">
              Unified Execution
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Powered by Vercel Eve. Agents and app run single-origin with an
              immutable audit trail of every decision.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 flex items-center justify-center gap-1.5 pb-8 text-xs text-muted-foreground">
        <Sparkles className="size-3.5 text-accent" />
        &copy; {new Date().getFullYear()} Osprey Helpdesk Systems &middot;
        Powered by Vercel Eve SDK
      </footer>
    </div>
  );
}
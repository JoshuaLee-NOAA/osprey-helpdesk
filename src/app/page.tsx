import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { ShieldCheck, ArrowRight, MessageSquareText, HelpCircle, Activity } from "lucide-react";

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
    <div className="flex-1 flex flex-col justify-center items-center bg-slate-950 text-white min-h-screen relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-blue-900/10 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-amber-500/5 blur-[100px]" />
      </div>

      <main className="w-full max-w-4xl px-6 py-12 flex flex-col items-center text-center z-10">
        {/* Floating Brand Header */}
        <div className="flex items-center gap-2 mb-8 bg-white/5 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
          <Activity className="h-5 w-5 text-amber-500 animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Next-Gen Autonomous Operations
          </span>
        </div>

        {/* Title */}
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
          Osprey Helpdesk
        </h1>

        {/* Tagline */}
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-12 font-light leading-relaxed">
          The AI-powered autonomous IT Helpdesk. Experience seamless, high-velocity incident triage, durable human-in-the-loop task routing, and military-grade guardrails.
        </p>

        {/* CTA Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-16 text-left">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/30 transition-all group">
            <MessageSquareText className="h-8 w-8 text-blue-400 mb-4" />
            <h3 className="font-semibold text-lg mb-2 text-slate-200">Conversational Portal</h3>
            <p className="text-sm text-slate-400">Describe your issues naturally. Specialized agents draft Jira tickets and automate setups instantly.</p>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-500/30 transition-all">
            <ShieldCheck className="h-8 w-8 text-amber-400 mb-4" />
            <h3 className="font-semibold text-lg mb-2 text-slate-200">Secure HITL Interception</h3>
            <p className="text-sm text-slate-400">Rest easy. High-risk administrative tasks trigger native workflow pauses for admin authorization.</p>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-slate-500/30 transition-all">
            <HelpCircle className="h-8 w-8 text-slate-300 mb-4" />
            <h3 className="font-semibold text-lg mb-2 text-slate-200">Unified Execution</h3>
            <p className="text-sm text-slate-400">Powered by Vercel Eve. Single-origin proxying handles workflow state transitions with zero CORS issues.</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          <SignInButton mode="modal">
            <button className="flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 font-semibold text-white hover:bg-blue-500 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-lg shadow-blue-600/20">
              Sign In to Portal
              <ArrowRight className="h-4 w-4" />
            </button>
          </SignInButton>

          <SignUpButton mode="modal">
            <button className="flex h-12 items-center justify-center rounded-xl border border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 px-6 font-semibold text-slate-200 transition-all cursor-pointer">
              Create Account
            </button>
          </SignUpButton>
        </div>
      </main>

      {/* Footer */}
      <footer className="absolute bottom-6 text-xs text-slate-600 z-10">
        &copy; {new Date().getFullYear()} Osprey Helpdesk Systems. Powered by Vercel Eve SDK.
      </footer>
    </div>
  );
}

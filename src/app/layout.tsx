import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Osprey | AI-Powered Autonomous IT Helpdesk",
  description: "Secure, real-time, autonomous IT service management powered by Vercel Eve.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#005F9E", // Contrast-accessible Brand Blue
          colorBackground: "#FFFFFF",
          colorDanger: "#ef4444",
          colorSuccess: "#22c55e",
          colorWarning: "#FF9F1C", // Osprey Amber accent
          fontFamily: "Plus Jakarta Sans, sans-serif",
          borderRadius: "1rem",
        },
        elements: {
          cardBox: "shadow-2xl border border-slate-100/50",
          headerTitle: "text-2xl font-black tracking-tight",
          headerSubtitle: "text-slate-500",
          socialButtonsIconButton: "border border-slate-200 hover:bg-slate-50 transition-colors duration-200 rounded-xl",
          formButtonPrimary: "bg-[#005F9E] hover:bg-[#004b7c] text-white transition-all duration-300 font-semibold shadow-md hover:shadow-lg rounded-full h-11 border-0",
          formFieldInput: "rounded-xl border-slate-200 focus:border-primary focus:ring-primary/20 transition-all duration-200 h-11",
          footerActionLink: "text-primary hover:text-primary-dark transition-colors duration-200 font-semibold",
        }
      }}
    >
      <html lang="en" className="h-full antialiased font-sans">
        <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
          {children}
          <Toaster richColors position="top-right" />
        </body>
      </html>
    </ClerkProvider>
  );
}

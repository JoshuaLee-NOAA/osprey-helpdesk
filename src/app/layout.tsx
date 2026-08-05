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
    <ClerkProvider>
      <html lang="en" className="h-full antialiased font-sans">
        <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
          {children}
          <Toaster richColors position="top-right" />
        </body>
      </html>
    </ClerkProvider>
  );
}

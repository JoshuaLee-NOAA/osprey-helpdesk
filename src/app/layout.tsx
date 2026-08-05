import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

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
      <html lang="en" className="h-full antialiased">
        <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}

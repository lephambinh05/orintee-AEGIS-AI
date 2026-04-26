import type { Metadata } from "next";
import "./globals.css";
import { Web3Provider } from "@/providers/Web3Provider";
import { Toaster } from 'sonner';
import { initCron } from "@/lib/cron-init";

// Khởi chạy tự động Cron job khi Next.js Server (hoặc app) khởi động
initCron();

export const metadata: Metadata = {
  title: "AEGIS AI | Crypto Risk Management",
  description: "Advanced AI-powered crypto asset analysis and risk management platform on Base Network.",
};

import { Sidebar } from "@/components/shared/Sidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-bg-primary overflow-hidden">
        <Web3Provider>
          <div className="flex flex-1 min-h-0 overflow-hidden">
            <Sidebar />
            <main className="flex-1 flex flex-col min-w-0 relative overflow-y-auto custom-scrollbar">
              {children}
            </main>
          </div>
        </Web3Provider>
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}

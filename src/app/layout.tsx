import type { Metadata } from "next";
import "./globals.css";
import { Web3Provider } from "@/providers/Web3Provider";
import { Toaster } from 'sonner';

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
    <html lang="en" className="h-full">
      <body className="min-h-full flex overflow-hidden">
        <Web3Provider>
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
            {children}
          </div>
        </Web3Provider>
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}

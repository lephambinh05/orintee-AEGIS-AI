'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, History, ExternalLink } from 'lucide-react';
import { useMetamask } from '@/hooks/useMetamask';

export function GlobalNav() {
  const pathname = usePathname();
  const { account, isConnected, connect, switchChain, isCorrectNetwork, isConnecting } = useMetamask();

  const navItems = [
    { 
      label: 'Terminal', 
      href: '/dashboard', 
      icon: <LayoutDashboard className="w-4 h-4" /> 
    },
    { 
      label: 'History', 
      href: '/history', 
      icon: <History className="w-4 h-4" /> 
    },
    { 
      label: 'Proof', 
      href: 'https://sepolia.basescan.org', 
      icon: <ExternalLink className="w-4 h-4" />,
      external: true 
    },
  ];

  return (
    <nav className="h-[56px] bg-white border-b border-border flex items-center px-6 sticky top-0 z-[100]">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mr-8 group">
        <div className="w-7 h-7 bg-green-primary rounded-[6px] flex items-center justify-center text-white text-[14px]">
          🛡️
        </div>
        <span className="font-bold text-[16px] tracking-tight group-hover:text-green-primary transition-colors">
          AEGIS AI
        </span>
      </Link>

      {/* Nav Links */}
      <div className="flex items-center gap-1">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            target={item.external ? '_blank' : undefined}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors",
              pathname === item.href 
                ? "bg-bg-secondary text-text-primary" 
                : "text-text-secondary hover:text-text-primary hover:bg-bg-secondary/50"
            )}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </div>

      {/* Right Side */}
      <div className="ml-auto flex items-center gap-4">
        {!isConnected ? (
          <button 
            onClick={connect} 
            disabled={isConnecting}
            className="btn-secondary !py-1.5 !px-3 text-[13px] font-semibold border-green-primary/20 hover:border-green-primary"
          >
            {isConnecting ? "Connecting..." : "Connect Wallet"}
          </button>
        ) : (
          <div className="flex items-center gap-3">
            {!isCorrectNetwork && (
              <button
                onClick={switchChain}
                className="px-3 py-1.5 bg-red-500 text-white rounded-md text-[13px] font-semibold animate-pulse"
              >
                Wrong Network
              </button>
            )}
            <button 
              className="btn-secondary !py-1.5 !px-3 text-[13px] font-semibold flex items-center gap-2"
            >
              <div className="w-2 h-2 rounded-full bg-green-primary" />
              {account?.slice(0, 6)}...{account?.slice(-4)}
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

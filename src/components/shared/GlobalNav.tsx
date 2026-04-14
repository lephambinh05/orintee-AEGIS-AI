'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, History, ExternalLink } from 'lucide-react';
import { useMetamask } from '@/hooks/useMetamask';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export function GlobalNav() {
  const pathname = usePathname();
  const { switchToTargetChain, isProcessing } = useMetamask();

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

      {/* Right Side - RainbowKit Connect Button */}
      <div className="ml-auto flex items-center gap-4">
        <ConnectButton.Custom>
          {({
            account,
            chain,
            openAccountModal,
            openChainModal,
            openConnectModal,
            authenticationStatus,
            mounted,
          }) => {
            const ready = mounted && authenticationStatus !== 'loading';
            const connected =
              ready &&
              account &&
              chain &&
              (!authenticationStatus || authenticationStatus === 'authenticated');

            return (
              <div
                {...(!ready && {
                  'aria-hidden': true,
                  'style': {
                    opacity: 0,
                    pointerEvents: 'none',
                    userSelect: 'none',
                  },
                })}
              >
                {(() => {
                  if (!connected) {
                    return (
                      <button 
                        onClick={openConnectModal}
                        type="button"
                        className="btn-secondary !py-1.5 !px-3 text-[13px] font-semibold border-green-primary/20 hover:border-green-primary"
                      >
                        Connect Wallet
                      </button>
                    );
                  }

                  if (chain.unsupported) {
                    return (
                      <button 
                        onClick={openChainModal}
                        type="button"
                        className="px-3 py-1.5 bg-red-500 text-white rounded-md text-[13px] font-semibold animate-pulse"
                      >
                        Wrong Network
                      </button>
                    );
                  }

                  return (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={openChainModal}
                        type="button"
                        className="btn-secondary !py-1.5 !px-3 text-[13px] font-semibold flex items-center gap-2"
                      >
                        {chain.hasIcon && (
                          <div
                            style={{
                              background: chain.iconBackground,
                              width: 12,
                              height: 12,
                              borderRadius: 999,
                              overflow: 'hidden',
                              marginRight: 4,
                            }}
                          >
                            {chain.iconUrl && (
                              <img
                                alt={chain.name ?? 'Chain icon'}
                                src={chain.iconUrl}
                                style={{ width: 12, height: 12 }}
                              />
                            )}
                          </div>
                        )}
                        {chain.name}
                      </button>

                      <button 
                        onClick={openAccountModal} 
                        type="button"
                        className="btn-secondary !py-1.5 !px-3 text-[13px] font-semibold flex items-center gap-2"
                      >
                        <div className="w-2 h-2 rounded-full bg-green-primary" />
                        {account.displayName}
                        {account.displayBalance
                          ? ` (${account.displayBalance})`
                          : ''}
                      </button>
                    </div>
                  );
                })()}
              </div>
            );
          }}
        </ConnectButton.Custom>
      </div>
    </nav>
  );
}


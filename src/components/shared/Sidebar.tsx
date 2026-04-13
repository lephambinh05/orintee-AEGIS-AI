'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, History, Settings, HelpCircle, ShieldCheck } from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();

  if (pathname === '/') return null;

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: History, label: 'History', href: '/history' },
  ];

  const bottomItems = [
    { icon: Settings, label: 'Settings', href: '#' },
    { icon: HelpCircle, label: 'Help', href: '#' },
  ];

  return (
    <aside className="w-[48px] bg-white border-r border-border flex flex-col items-center py-4 flex-shrink-0 z-50">
      <div className="mb-8 text-green-primary">
        <ShieldCheck size={24} />
      </div>
      
      <div className="flex-1 flex flex-col gap-4">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "p-2 rounded-lg transition-colors group relative",
              pathname === item.href 
                ? "bg-green-light text-green-primary" 
                : "text-text-muted hover:bg-bg-secondary hover:text-text-primary"
            )}
          >
            <item.icon size={20} />
            <div className="absolute left-full ml-2 px-2 py-1 bg-text-primary text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
              {item.label}
            </div>
          </Link>
        ))}
      </div>

      <div className="flex flex-col gap-4 mt-auto">
        {bottomItems.map((item) => (
          <button
            key={item.label}
            className="p-2 text-text-muted hover:bg-bg-secondary hover:text-text-primary rounded-lg transition-colors group relative"
          >
            <item.icon size={20} />
            <div className="absolute left-full ml-2 px-2 py-1 bg-text-primary text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
              {item.label}
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
}

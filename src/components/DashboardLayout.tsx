'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Bot, Store, Radio } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/agents', label: 'Agents', icon: Bot },
  { href: '/marketplace', label: 'Marketplace', icon: Store },
  { href: '/activity', label: 'Activity', icon: Radio },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="flex h-screen bg-[#060b14] text-gray-100">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/[0.06] bg-white/[0.02] backdrop-blur-xl flex flex-col relative">
        {/* Subtle top edge glow */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />

        {/* Brand */}
        <div className="p-6 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            {/* Hexagon accent mark */}
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <div className="w-3 h-3 rounded-sm bg-emerald-400/80 rotate-45" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-gradient font-[family-name:var(--font-outfit)]">
                AgentVerse
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-3">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-50" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span className="text-[11px] text-emerald-400/70 font-medium tracking-wide uppercase font-[family-name:var(--font-jetbrains)]">
              Testnet
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-0.5 mt-2">
          {navItems.map(item => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 relative',
                  isActive
                    ? 'bg-emerald-500/[0.08] text-emerald-400 font-medium'
                    : 'text-gray-500 hover:bg-white/[0.04] hover:text-gray-200'
                )}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 bg-emerald-400 rounded-r-full" />
                )}
                <Icon className={cn(
                  'w-4 h-4 transition-colors duration-200',
                  isActive ? 'text-emerald-400' : 'text-gray-600 group-hover:text-gray-400'
                )} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40" />
            <span className="text-[11px] text-gray-600 font-[family-name:var(--font-jetbrains)] tracking-wide">
              Powered by Hedera
            </span>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto relative z-10">
        <div className="max-w-7xl mx-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}

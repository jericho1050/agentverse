'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShieldCheck, FileText, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/verify', label: 'Verify', icon: ShieldCheck },
  { href: '/records', label: 'My Records', icon: FileText },
  { href: '/activity', label: 'Activity', icon: Activity },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Don't render sidebar for public share pages
  const isSharePage = pathname?.startsWith('/share/');

  if (isSharePage) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/[0.08] bg-gray-900/50 backdrop-blur-xl flex flex-col relative">
        {/* Subtle medical pulse accent */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent animate-pulse" />

        {/* Brand */}
        <div className="p-6 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            {/* Medical cross icon */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center relative">
              <div className="w-4 h-1 bg-emerald-400 absolute" />
              <div className="w-1 h-4 bg-emerald-400 absolute" />
              <div className="absolute inset-0 rounded-xl bg-emerald-400/10 blur-sm" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight font-[family-name:var(--font-outfit)]">
                <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 bg-clip-text text-transparent">
                  MediVerify
                </span>
              </h1>
              <p className="text-[10px] text-gray-500 font-medium tracking-wider uppercase mt-0.5">
                AI Health Passport
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4 px-3 py-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span className="text-[11px] text-emerald-400 font-medium tracking-wide uppercase font-[family-name:var(--font-jetbrains)]">
              Live on Testnet
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 mt-2">
          {navItems.map(item => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200 relative',
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 text-emerald-400 font-semibold border border-emerald-500/20'
                    : 'text-gray-400 hover:bg-white/[0.03] hover:text-gray-200 border border-transparent'
                )}
              >
                {/* Active indicator glow */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-emerald-400 rounded-r-full shadow-lg shadow-emerald-400/50" />
                )}
                <Icon className={cn(
                  'w-[18px] h-[18px] transition-all duration-200',
                  isActive ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]' : 'text-gray-500 group-hover:text-gray-300'
                )} />
                <span className="relative">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/[0.08]">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/40">
            <svg className="w-4 h-4 text-emerald-500/60" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
            </svg>
            <span className="text-[11px] text-gray-500 font-[family-name:var(--font-jetbrains)] tracking-wide font-medium">
              Powered by Hedera
            </span>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto relative z-10">
        <div className="max-w-7xl mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

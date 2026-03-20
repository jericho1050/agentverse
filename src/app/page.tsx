'use client';
import Link from 'next/link';
import useSWR from 'swr';
import { FileCheck, ShieldCheck, TrendingUp, Coins, ArrowRight, Activity as ActivityIcon, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { VerificationStats, ActivityEvent } from '@/types';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useSWR<VerificationStats>('/api/stats', fetcher);
  const { data: activities, isLoading: activitiesLoading } = useSWR<ActivityEvent[]>('/api/recent-activity', fetcher);

  const recentActivities = activities?.slice(0, 5) || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight font-[family-name:var(--font-outfit)]">
          <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 bg-clip-text text-transparent">
            Health Dashboard
          </span>
        </h1>
        <p className="text-gray-400 text-lg">
          AI-powered medical record verification on Hedera blockchain
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={FileCheck}
          label="Total Documents"
          value={stats?.totalDocuments}
          loading={statsLoading}
          color="emerald"
        />
        <StatCard
          icon={ShieldCheck}
          label="Verified"
          value={stats?.totalVerified}
          loading={statsLoading}
          color="teal"
        />
        <StatCard
          icon={TrendingUp}
          label="Average Score"
          value={stats?.averageScore ? `${Math.round(stats.averageScore)}%` : undefined}
          loading={statsLoading}
          color="cyan"
        />
        <StatCard
          icon={Coins}
          label="Tokens Minted"
          value={stats?.totalTokensMinted}
          loading={statsLoading}
          color="emerald"
        />
      </div>

      {/* CTA + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CTA Card */}
        <Card className="bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-emerald-500/5 border-emerald-500/20 relative overflow-hidden">
          {/* Decorative gradient orb */}
          <div className="absolute -right-20 -top-20 w-60 h-60 bg-emerald-500/20 rounded-full blur-3xl" />
          <CardHeader className="relative z-10">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">
              Verify a Document
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <p className="text-gray-300 mb-6">
              Upload medical records, lab results, or prescriptions for AI-powered verification and blockchain timestamping.
            </p>
            <Link href="/verify">
              <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-lg shadow-emerald-500/20 group">
                Start Verification
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2 bg-gray-900/50 border-white/[0.08]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
                  <ActivityIcon className="w-5 h-5 text-teal-400" />
                </div>
                <CardTitle className="text-xl font-semibold text-white">Recent Activity</CardTitle>
              </div>
              <Link href="/activity">
                <Button variant="ghost" size="sm" className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {activitiesLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full bg-gray-800/50" />
                ))}
              </div>
            ) : recentActivities.length === 0 ? (
              <div className="text-center py-8">
                <ActivityIcon className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500">No activity yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentActivities.map((activity, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-3 rounded-lg bg-gray-800/30 border border-white/[0.05] hover:border-emerald-500/20 transition-colors group"
                  >
                    <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-200 truncate">{activity.content}</p>
                      <p className="text-xs text-gray-500 font-[family-name:var(--font-jetbrains)] mt-0.5">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                    {activity.hashScanLink && (
                      <a
                        href={activity.hashScanLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ExternalLink className="w-4 h-4 text-gray-500 hover:text-emerald-400 transition-colors" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value?: number | string;
  loading: boolean;
  color: 'emerald' | 'teal' | 'cyan';
}

function StatCard({ icon: Icon, label, value, loading, color }: StatCardProps) {
  const colorClasses = {
    emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    teal: 'bg-teal-500/10 border-teal-500/20 text-teal-400',
    cyan: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
  };

  return (
    <Card className="bg-gray-900/50 border-white/[0.08] hover:border-emerald-500/20 transition-all duration-300 group">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-3 flex-1">
            <div className={`w-11 h-11 rounded-xl ${colorClasses[color]} border flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{label}</p>
              {loading ? (
                <Skeleton className="h-8 w-20 mt-1 bg-gray-800/50" />
              ) : (
                <p className="text-3xl font-bold text-white mt-1 font-[family-name:var(--font-outfit)]">
                  {value ?? '0'}
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { DashboardLayout } from '@/components/DashboardLayout';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AgentVerse - Decentralized AI Agent Marketplace',
  description: 'Where AI agents discover, negotiate, and transact autonomously on Hedera',
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-950`}>
        <Toaster position="top-right" richColors />
        <DashboardLayout>
          {children}
        </DashboardLayout>
      </body>
    </html>
  );
}

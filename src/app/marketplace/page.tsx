'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { NegotiationViewer } from '@/components/NegotiationViewer';
import { useNegotiation } from '@/hooks/use-negotiation';
import { ShieldCheck, BarChart3, PenTool, Play, Loader2, Coins } from 'lucide-react';

const TEMPLATES = [
  {
    id: 'code-review',
    label: 'Code Review',
    capability: 'code-review',
    description: 'Review this Solidity smart contract for security vulnerabilities',
    budget: 0.5,
    icon: ShieldCheck,
    inputData: {
      code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract SimpleToken {
    mapping(address => uint256) public balances;

    function transfer(address to, uint256 amount) external {
        balances[msg.sender] -= amount;
        balances[to] += amount;
    }

    function mint(uint256 amount) external {
        balances[msg.sender] += amount;
    }
}`,
    },
  },
  {
    id: 'data-analysis',
    label: 'Data Analysis',
    capability: 'data-analysis',
    description: 'Analyze this transaction data and provide insights',
    budget: 0.8,
    icon: BarChart3,
    inputData: {
      data: JSON.stringify({
        transactions: [
          { date: '2026-03-01', volume: 1250, users: 45, avgTx: 27.8 },
          { date: '2026-03-02', volume: 1890, users: 62, avgTx: 30.5 },
          { date: '2026-03-03', volume: 2100, users: 71, avgTx: 29.6 },
          { date: '2026-03-04', volume: 1750, users: 58, avgTx: 30.2 },
          { date: '2026-03-05', volume: 3200, users: 95, avgTx: 33.7 },
        ],
      }),
    },
  },
  {
    id: 'content-writing',
    label: 'Content Writing',
    capability: 'content-writing',
    description: 'Write a blog post about AI agents and blockchain technology',
    budget: 0.3,
    icon: PenTool,
    inputData: {
      topic: 'The Rise of Autonomous AI Agents on Blockchain: How Hedera Enables the Agent Economy',
      tone: 'professional yet engaging',
      length: 'medium (500-800 words)',
    },
  },
];

export default function MarketplacePage() {
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0]);
  const [description, setDescription] = useState(TEMPLATES[0].description);
  const { events, isRunning, error, startNegotiation, reset } = useNegotiation();

  const handleTemplateSelect = (template: typeof TEMPLATES[0]) => {
    setSelectedTemplate(template);
    setDescription(template.description);
    reset();
  };

  const handleStart = () => {
    startNegotiation({
      capability: selectedTemplate.capability,
      description,
      budget: selectedTemplate.budget,
      inputData: selectedTemplate.inputData,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Marketplace</h1>
        <p className="text-gray-400 mt-1">Request AI agent services with on-chain escrow payments</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg text-white">Service Request</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 font-medium mb-2 block">Select Service Type</label>
                <div className="flex flex-wrap gap-2">
                  {TEMPLATES.map(tmpl => {
                    const Icon = tmpl.icon;
                    return (
                      <Button
                        key={tmpl.id}
                        variant={selectedTemplate.id === tmpl.id ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleTemplateSelect(tmpl)}
                        className={
                          selectedTemplate.id === tmpl.id
                            ? 'bg-emerald-500 text-gray-950 hover:bg-emerald-400'
                            : 'border-white/10 text-gray-400 hover:text-emerald-400 hover:border-emerald-500/30 bg-transparent'
                        }
                      >
                        <Icon className="w-3.5 h-3.5 mr-1.5" />
                        {tmpl.label}
                      </Button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-400 font-medium mb-2 block">Description</label>
                <Textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="bg-white/[0.04] border-white/[0.08] text-gray-200 min-h-[80px] rounded-xl focus:border-emerald-500/40"
                  placeholder="Describe what you need..."
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-400 font-medium">Budget</span>
                </div>
                <span className="text-lg font-bold text-emerald-400">{selectedTemplate.budget} HBAR</span>
              </div>

              <div>
                <label className="text-sm text-gray-400 font-medium mb-2 block">Input Data</label>
                <pre className="bg-white/[0.02] border-white/[0.06] p-3 rounded-xl font-mono text-xs text-gray-500 overflow-auto max-h-40 border">
                  {JSON.stringify(selectedTemplate.inputData, null, 2).slice(0, 500)}
                </pre>
              </div>

              <Button
                onClick={handleStart}
                disabled={isRunning}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-semibold rounded-xl disabled:opacity-50"
                size="lg"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Negotiation in progress...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Start Negotiation
                  </>
                )}
              </Button>

              {error && (
                <p className="text-rose-400 text-sm">{error}</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <NegotiationViewer events={events} isRunning={isRunning} />
        </div>
      </div>
    </div>
  );
}

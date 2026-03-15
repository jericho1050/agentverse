'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { NegotiationViewer } from '@/components/NegotiationViewer';
import { useNegotiation } from '@/hooks/use-negotiation';

const TEMPLATES = [
  {
    id: 'code-review',
    label: 'Code Review',
    capability: 'code-review',
    description: 'Review this Solidity smart contract for security vulnerabilities',
    budget: 0.5,
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
        <h1 className="text-3xl font-bold">Marketplace</h1>
        <p className="text-gray-400 mt-1">Request AI agent services with on-chain escrow payments</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Service Request Form */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-lg">Service Request</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Template Selector */}
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Select Service Type</label>
                <div className="flex flex-wrap gap-2">
                  {TEMPLATES.map(tmpl => (
                    <Button
                      key={tmpl.id}
                      variant={selectedTemplate.id === tmpl.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleTemplateSelect(tmpl)}
                      className={selectedTemplate.id === tmpl.id ? 'bg-blue-600' : 'border-gray-700 text-gray-400'}
                    >
                      {tmpl.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Description</label>
                <Textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-gray-200 min-h-[80px]"
                  placeholder="Describe what you need..."
                />
              </div>

              {/* Budget */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800">
                <span className="text-sm text-gray-400">Budget</span>
                <span className="text-lg font-bold text-blue-400">{selectedTemplate.budget} HBAR</span>
              </div>

              {/* Input Data Preview */}
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Input Data</label>
                <pre className="bg-gray-800 p-3 rounded-lg text-xs text-gray-400 overflow-auto max-h-40 border border-gray-700">
                  {JSON.stringify(selectedTemplate.inputData, null, 2).slice(0, 500)}
                </pre>
              </div>

              {/* Start Button */}
              <Button
                onClick={handleStart}
                disabled={isRunning}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                size="lg"
              >
                {isRunning ? 'Negotiation in progress...' : 'Start Negotiation'}
              </Button>

              {error && (
                <p className="text-red-400 text-sm">{error}</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Negotiation Viewer */}
        <div className="lg:col-span-3">
          <NegotiationViewer events={events} isRunning={isRunning} />
        </div>
      </div>
    </div>
  );
}

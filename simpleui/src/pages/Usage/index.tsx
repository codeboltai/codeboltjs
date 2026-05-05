import React from 'react';
import { DollarSign, Clock, Zap, Cpu } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Progress } from '@/components/ui';

const Usage: React.FC = () => {
  const stats = [
    { title: "Today's Cost", value: '$4.32', icon: DollarSign, color: 'text-green-500' },
    { title: "This Week's Cost", value: '$23.45', icon: DollarSign, color: 'text-green-500' },
    { title: 'Tokens Used Today', value: '45,231', icon: Zap, color: 'text-blue-500' },
    { title: 'Active Agent Hours', value: '4h 23m', icon: Clock, color: 'text-purple-500' },
  ];

  const agentUsage = [
    { agent: 'Frontend Agent', tokens: 23000, calls: 45, cost: '$2.34' },
    { agent: 'Backend Agent', tokens: 15000, calls: 30, cost: '$1.56' },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Usage & Costs</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Usage by Agent</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {agentUsage.map((usage) => (
              <div key={usage.agent} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium">{usage.agent}</p>
                  <p className="text-sm text-muted-foreground">{usage.tokens.toLocaleString()} tokens • {usage.calls} calls</p>
                </div>
                <p className="font-semibold">{usage.cost}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Usage;

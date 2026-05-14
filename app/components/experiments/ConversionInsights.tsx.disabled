"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie,
  Legend
} from 'recharts';
import { ShoppingBag, Star, TrendingUp } from 'lucide-react';
import { cn } from "@/app/lib/utils";

const InsightCard = ({ title, value, icon: Icon, color, subtitle, trend }: any) => (
  <Card className="hover:shadow-lg transition-shadow bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border-zinc-200/50 dark:border-zinc-800/50">
    <CardContent className="pt-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{title}</p>
          <h3 className="text-2xl font-bold mt-2 text-zinc-900 dark:text-white">{value}</h3>
          <p className="text-xs text-zinc-500 mt-1">{subtitle}</p>
          {trend && (
            <div className={cn("text-xs font-medium mt-2 flex items-center", trend > 0 ? "text-emerald-500" : "text-rose-500")}>
              {trend > 0 ? "+" : ""}{trend}% from last month
            </div>
          )}
        </div>
        <div className={cn("p-3 rounded-2xl", color)}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const ConversionInsights = ({ conversions, data }: { conversions: any[], data: any }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Calculate metrics
  const totalConversions = conversions.length;
  const totalValue = conversions.reduce((sum, c) => sum + (c.metadata?.amount || 0), 0);
  const averageValue = totalConversions > 0 ? totalValue / totalConversions : 0;
  
  // Group by variant
  const variantStats = conversions.reduce((acc: any, c) => {
    const variantId = c.variant_id;
    if (!acc[variantId]) {
      acc[variantId] = { name: `Variant ${variantId}`, value: 0, amount: 0 };
    }
    acc[variantId].value += 1;
    acc[variantId].amount += (c.metadata?.amount || 0);
    return acc;
  }, {});

  const pieData = Object.values(variantStats);
  const COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <InsightCard 
          title="Total Conversions"
          value={totalConversions}
          icon={ShoppingBag}
          color="bg-blue-500"
          subtitle="Total successful conversions"
        />
        <InsightCard 
          title="Revenue"
          value={`$${totalValue.toLocaleString()}`}
          icon={TrendingUp}
          color="bg-emerald-500"
          subtitle="Total converted value"
        />
        <InsightCard 
          title="Avg. Order Value"
          value={`$${averageValue.toFixed(2)}`}
          icon={Star}
          color="bg-purple-500"
          subtitle="Per conversion average"
        />
        <InsightCard 
          title="Conversion Rate"
          value={`${((totalConversions / (data?.total_visitors || 1)) * 100).toFixed(2)}%`}
          icon={TrendingUp}
          color="bg-orange-500"
          subtitle="Visitors to conversions"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border-zinc-200/50 dark:border-zinc-800/50">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Conversions by Variant</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0,0,0,0.8)', 
                      border: 'none', 
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border-zinc-200/50 dark:border-zinc-800/50">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Revenue by Variant</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pieData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3f3f46" />
                  <XAxis dataKey="name" stroke="#71717a" fontSize={12} />
                  <YAxis stroke="#71717a" fontSize={12} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ 
                      backgroundColor: 'rgba(0,0,0,0.8)', 
                      border: 'none', 
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConversionInsights;

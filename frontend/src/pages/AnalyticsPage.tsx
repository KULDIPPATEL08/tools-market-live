import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { BarChart2, ShieldAlert, CheckCircle, PieChart as PieIcon, HardDrive } from 'lucide-react';
import { api } from '../services/api';
import { Card } from '../components/ui/Card';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';

const COLORS = ['#38BDF8', '#10B981', '#F59E0B', '#A855F7', '#EF4444', '#64748B'];

export const AnalyticsPage: React.FC = () => {
  const { data: chartsData, isLoading } = useQuery({
    queryKey: ['analytics-charts'],
    queryFn: api.getChartsData,
  });

  const { data: metrics } = useQuery({
    queryKey: ['metrics'],
    queryFn: api.getOverviewMetrics,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-slate-800/80">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
          <span>Analytics & Data Health</span>
          <span className="text-xs font-mono font-medium text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
            Real Database Telemetry
          </span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Concrete metrics on source volume, category representation, ingestion success, and metadata quality.
        </p>
      </div>

      {isLoading ? (
        <LoadingSkeleton rows={5} />
      ) : (
        <div className="space-y-6">
          {/* Top Row: Category Distribution & Source Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Representation */}
            <Card title="Intelligence Category Distribution" subtitle="Record counts grouped by assigned intelligence category">
              <div className="h-64 w-full pt-2">
                {chartsData?.category_distribution && chartsData.category_distribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartsData.category_distribution}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        innerRadius={50}
                        paddingAngle={4}
                        label={({ name, percent }: any) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {chartsData.category_distribution.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0F172A',
                          borderColor: '#334155',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-xs text-slate-500">
                    No records available to chart.
                  </div>
                )}
              </div>
            </Card>

            {/* Source Record Volume */}
            <Card title="Records per Source Connector" subtitle="Volume of primary data retrieved and indexed">
              <div className="h-64 w-full pt-2">
                {chartsData?.source_breakdown && chartsData.source_breakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartsData.source_breakdown} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                      <XAxis
                        dataKey="name"
                        stroke="#64748B"
                        fontSize={11}
                        interval={0}
                        angle={-15}
                        textAnchor="end"
                      />
                      <YAxis stroke="#64748B" fontSize={11} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0F172A',
                          borderColor: '#334155',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                      />
                      <Bar dataKey="records" fill="#38BDF8" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-xs text-slate-500">
                    No source data available to chart.
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Bottom Row: Collection Job Success & Quality Score Tiers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Job Status Breakdown */}
            <Card title="Collection Job Status Health" subtitle="Execution success rate of automated sync jobs">
              <div className="h-64 w-full pt-2">
                {chartsData?.job_status_breakdown && chartsData.job_status_breakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartsData.job_status_breakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="status" stroke="#64748B" fontSize={12} />
                      <YAxis stroke="#64748B" fontSize={11} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0F172A',
                          borderColor: '#334155',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                      />
                      <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-xs text-slate-500">
                    No job executions recorded.
                  </div>
                )}
              </div>
            </Card>

            {/* Quality Score Tiers */}
            <Card title="Metadata Quality & Completeness Tiers" subtitle="Records evaluated by richness of title, body, author, and date">
              <div className="h-64 w-full pt-2">
                {chartsData?.quality_distribution && chartsData.quality_distribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartsData.quality_distribution} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                      <XAxis type="number" stroke="#64748B" fontSize={11} />
                      <YAxis dataKey="tier" type="category" stroke="#64748B" fontSize={11} width={130} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0F172A',
                          borderColor: '#334155',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                      />
                      <Bar dataKey="count" fill="#A855F7" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-xs text-slate-500">
                    No quality records available.
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};


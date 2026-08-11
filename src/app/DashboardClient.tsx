"use client";

import Header from "../components/Header";
import MetricCard from "../components/MetricCard";
import VolumeChart from "../components/VolumeChart";
import PoolsTable from "../components/PoolsTable";
import type {
  ProtocolMetric,
  LiquidityPool,
  VolumeDataPoint,
  DashboardSummary,
} from "../services/sorobanApi";

interface DashboardClientProps {
  metrics: ProtocolMetric[];
  pools: LiquidityPool[];
  volumeHistory: VolumeDataPoint[];
  summary: DashboardSummary;
}

export default function DashboardClient({
  metrics,
  pools,
  volumeHistory,
  summary,
}: DashboardClientProps) {
  return (
    <div className="min-h-screen bg-slate-900">
      <Header summary={summary} />
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <section>
          <h2 className="section-title">Protocol Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((metric) => (
              <MetricCard key={metric.id} metric={metric} />
            ))}
          </div>
        </section>
        <section>
          <VolumeChart data={volumeHistory} />
        </section>
        <section>
          <PoolsTable pools={pools} />
        </section>
        <footer className="pt-4 border-t border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>
            Soroban DeFi Analytics &mdash; open-source, MIT licensed
          </span>
          <span>
            Data is simulated. Production build connects to live RPC / indexer
            endpoints.
          </span>
        </footer>
      </main>
    </div>
  );
}
import {
  fetchProtocolMetrics,
  fetchLiquidityPools,
  fetchVolumeHistory,
  fetchDashboardSummary,
  fetchXlmPrice,
} from "../services/sorobanApi";
import { CurrencyProvider } from "../context/CurrencyContext";
import DashboardClient from "./DashboardClient";

export const revalidate = 60; // ISR: refresh every 60 seconds

export default async function DashboardPage() {
  // Fetch all data in parallel
  const [metrics, pools, volumeHistory, summary, xlmPrice] = await Promise.all([
    fetchProtocolMetrics(),
    fetchLiquidityPools(),
    fetchVolumeHistory(),
    fetchDashboardSummary(),
    fetchXlmPrice(),
  ]);

  return (
    <CurrencyProvider xlmPrice={xlmPrice}>
      <DashboardClient
        metrics={metrics}
        pools={pools}
        volumeHistory={volumeHistory}
        summary={summary}
      />
    </CurrencyProvider>
  );
}
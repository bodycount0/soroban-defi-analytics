import { LiquidityPool } from "@/services/sorobanApi";

const DEFAULT_SOROSWAP_API_URL = "https://api.soroswap.finance";

export interface SoroswapRawPool {
  id?: string;
  address?: string;
  contract_id?: string;
  token0?: {
    symbol?: string;
    code?: string;
    address?: string;
  } | string;
  token1?: {
    symbol?: string;
    code?: string;
    address?: string;
  } | string;
  token0_symbol?: string;
  token1_symbol?: string;
  tvl?: number | string;
  tvl_usd?: number | string;
  total_liquidity_usd?: number | string;
  volume24h?: number | string;
  volume_24h_usd?: number | string;
  fee?: number | string;
  fee_bps?: number | string;
  apy?: number | string;
  apr?: number | string;
}

export interface SoroswapApiResponse {
  pools?: SoroswapRawPool[];
  data?: SoroswapRawPool[];
}

/**
 * Returns the base URL for the Soroswap API, configurable via NEXT_PUBLIC_SOROSWAP_API_URL.
 */
export const getSoroswapBaseUrl = (): string => {
  return (
    process.env.NEXT_PUBLIC_SOROSWAP_API_URL ||
    DEFAULT_SOROSWAP_API_URL
  ).replace(/\/+$/, "");
};

/**
 * Helper to safely extract token symbol string.
 */
const extractTokenSymbol = (token: unknown, fallback: string): string => {
  if (typeof token === "string" && token.length > 0) {
    return token;
  }
  if (typeof token === "object" && token !== null) {
    const obj = token as Record<string, unknown>;
    if (typeof obj.symbol === "string" && obj.symbol.length > 0) {
      return obj.symbol;
    }
    if (typeof obj.code === "string" && obj.code.length > 0) {
      return obj.code;
    }
  }
  return fallback;
};

/**
 * Normalizes raw Soroswap pool payload into the internal LiquidityPool interface.
 */
export const mapSoroswapPool = (raw: SoroswapRawPool, index: number): LiquidityPool => {
  const token0 =
    raw.token0_symbol ||
    extractTokenSymbol(raw.token0, "TOKEN0");
  const token1 =
    raw.token1_symbol ||
    extractTokenSymbol(raw.token1, "TOKEN1");

  const poolId =
    raw.id ||
    raw.address ||
    raw.contract_id ||
    `soroswap-${token0.toLowerCase()}-${token1.toLowerCase()}-${index}`;

  const tvlVal = raw.tvl_usd ?? raw.total_liquidity_usd ?? raw.tvl ?? 0;
  const tvl = typeof tvlVal === "string" ? parseFloat(tvlVal) || 0 : tvlVal;

  const volVal = raw.volume_24h_usd ?? raw.volume24h ?? 0;
  const volume24h = typeof volVal === "string" ? parseFloat(volVal) || 0 : volVal;

  const feeVal = raw.fee_bps ?? raw.fee ?? 30;
  const fee = typeof feeVal === "string" ? parseFloat(feeVal) || 30 : feeVal;

  const apyVal = raw.apy ?? raw.apr ?? 0;
  const apy = typeof apyVal === "string" ? parseFloat(apyVal) || 0 : apyVal;

  return {
    id: poolId,
    protocol: "Soroswap DEX",
    pair: `${token0} / ${token1}`,
    token0,
    token1,
    tvl: Math.round(tvl),
    volume24h: Math.round(volume24h),
    fee: Number(fee),
    apy: Number(apy.toFixed(2)),
  };
};

/**
 * Fetches pool list from the Soroswap public endpoint.
 */
export const fetchSoroswapPools = async (): Promise<LiquidityPool[]> => {
  const baseUrl = getSoroswapBaseUrl();
  const endpoint = `${baseUrl}/api/pools`;

  try {
    const res = await fetch(endpoint, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      throw new Error(`Soroswap API request failed with status ${res.status}`);
    }

    const payload = (await res.json()) as SoroswapApiResponse | SoroswapRawPool[];
    const rawPools: SoroswapRawPool[] = Array.isArray(payload)
      ? payload
      : payload.pools || payload.data || [];

    return rawPools.map(mapSoroswapPool);
  } catch (err) {
    console.warn(`[SoroswapAdapter] Failed to fetch pools from ${endpoint}:`, err);
    throw err;
  }
};

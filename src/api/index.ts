export type MapParams = { bbox?: string; gte?: string; lte?: string; toneMin?: number; toneMax?: number; size?: number };
export type StatsParams = { bbox?: string; gte?: string; lte?: string };
export type SearchParams = { q?: string; bbox?: string; gte?: string; lte?: string; page?: number; pageSize?: number; toneMin?: number; toneMax?: number };

const buildQs = (obj: Record<string, unknown>) => {
  const u = new URLSearchParams();
  Object.entries(obj).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    u.set(k, String(v));
  });
  return u.toString();
};

export const buildMapUrl = (base: string, params: MapParams) => `${base}/map?${buildQs(params)}`;
export const buildStatsUrl = (base: string, params: StatsParams) => `${base}/stats?${buildQs(params)}`;
export const buildSearchUrl = (base: string, params: SearchParams) => `${base}/search?${buildQs(params)}`;









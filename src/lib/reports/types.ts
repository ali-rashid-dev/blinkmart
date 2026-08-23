export type RangeKey = "7d" | "30d" | "12m";

export interface KpiTrend {
  value: string;
  rawValue: number;
  delta: number;
  caption: string;
}

export interface ReportsKpisData {
  revenue: KpiTrend;
  orders: KpiTrend;
  average: KpiTrend;
  customers: KpiTrend;
}

export interface SalesPoint {
  label: string;
  value: number;
  orders: number;
  dateIso: string;
}

export interface BestSellingItem {
  id: string;
  name: string;
  category: string;
  emoji: string;
  units: number;
  revenue: number;
  share: number;
}

export interface CustomerMixItem {
  label: string;
  value: number;
  tone: string;
}

export interface TopCustomerItem {
  id: string;
  name: string;
  initials: string;
  area: string;
  orders: number;
  spent: number;
  status: "new" | "returning" | "vip";
}

export interface ReportsData {
  range: RangeKey;
  kpis: ReportsKpisData;
  points: SalesPoint[];
  monthlySeries: SalesPoint[];
  bestSelling: BestSellingItem[];
  customerMix: CustomerMixItem[];
  topCustomers: TopCustomerItem[];
}

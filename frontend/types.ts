export interface ProductOption {
  id: string;
  name: string;
  niche: string;
  description: string;
  viabilityEstimate: number;
}

export interface SupplierEconomics {
  cogs: number;
  retailPrice: number;
  netMargin: number;
  breakdownText: string;
}

export interface Logistics {
  shippingWindow: string;
  returnRisk: string;
  assessmentText: string;
  primarySupplier: string;
}

export interface SupplierMatch {
  name: string;
  url: string;
  rating: string;
  shippingTime: string;
}

export interface SourcingStrategy {
  method: 'Print-on-Demand (POD)' | 'Standard Dropshipping' | 'Private Label / Bulk Inventory';
  recommendedSuppliers: SupplierMatch[];
  reasoning: string;
  integrationSteps: string;
}

export interface RadarScores {
  demand: number;
  competition: number;
  margin: number;
  trend: number;
}

export interface TrendAnalysis {
  momentumScore: number;
  trendType: 'Seasonal' | 'Viral' | 'Evergreen' | 'Emerging';
  peakTiming: string;
  marketStatus: 'Golden Opportunity' | 'Requires Differentiation' | 'Niche Play' | 'Avoid';
  competitionDensity: string;
  sustainabilityAnalysis: string;
  radarScores: RadarScores;
}

export interface Phase1Data {
  productIdentity: string;
  niche: string;
  trendAnalysis: TrendAnalysis;
  supplierEconomics: SupplierEconomics;
  logistics: Logistics;
  sourcingStrategy: SourcingStrategy;
  viabilityScore: number;
  viabilityText: string;
}

export interface TargetAudience {
  persona: string;
  coreAngles: string[];
}

export interface Copywriting {
  seoTitle: string;
  bulletPoints: string[];
  videoHookScript: string;
}

export interface OfferArchitecture {
  structure: string;
  aovBoosters: string[];
}

export interface BudgetAllocation {
  channel: string;
  allocationPercentage: number;
}

export interface CashFlowData {
  week: number;
  revenue: number;
  adSpend: number;
  profit: number;
}

export interface ActionPlan {
  day1to3Test: string;
  day4to90Scale: string;
  budgetMatrix: BudgetAllocation[];
  cashFlowProjections: CashFlowData[];
}

export interface EmailSequence {
  type: string;
  subject: string;
  previewText: string;
  body: string;
}

export interface Phase2Data {
  targetAudience: TargetAudience;
  copywriting: Copywriting;
  offerArchitecture: OfferArchitecture;
  actionPlan: ActionPlan;
  emailMarketing: EmailSequence[];
  landingPageCode: string;
}

export interface OrchestratorResponse {
  phase1: Phase1Data;
  phase2: Phase2Data;
  imageUrl?: string;
  videoUrl?: string;
  groundingUrls?: string[];
}

export interface HistoryItem {
  id: string;
  date: string;
  seed: string;
  data: OrchestratorResponse;
  isSaved?: boolean;
}

export type AppStep = 'idle' | 'loading_options' | 'options' | 'loading_report' | 'report' | 'error';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

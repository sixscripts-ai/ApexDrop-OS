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

export interface TrendAnalysis {
  momentumScore: number;
  trendType: 'Seasonal' | 'Viral' | 'Evergreen' | 'Emerging';
  peakTiming: string;
  marketStatus: 'Golden Opportunity' | 'Requires Differentiation' | 'Niche Play' | 'Avoid';
  competitionDensity: string;
  sustainabilityAnalysis: string;
}

export interface Phase1Data {
  productIdentity: string;
  niche: string;
  trendAnalysis: TrendAnalysis;
  supplierEconomics: SupplierEconomics;
  logistics: Logistics;
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

export interface ActionPlan {
  day1to3Test: string;
  day4to90Scale: string;
  budgetMatrix: BudgetAllocation[];
}

export interface Phase2Data {
  targetAudience: TargetAudience;
  copywriting: Copywriting;
  offerArchitecture: OfferArchitecture;
  actionPlan: ActionPlan;
}

export interface OrchestratorResponse {
  phase1: Phase1Data;
  phase2: Phase2Data;
}

export type AppStatus = 'idle' | 'running' | 'success' | 'error';

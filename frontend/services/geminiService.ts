import { GoogleGenAI, Type } from '@google/genai';
import { OrchestratorResponse } from '../types.ts';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY, vertexai: true });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    phase1: {
      type: Type.OBJECT,
      properties: {
        productIdentity: { type: Type.STRING, description: "Name and brief description of the product" },
        niche: { type: Type.STRING, description: "The specific market niche" },
        trendAnalysis: {
          type: Type.OBJECT,
          properties: {
            momentumScore: { type: Type.NUMBER, description: "BSR/Sales Momentum Score from 1 to 10" },
            trendType: { type: Type.STRING, description: "Must be one of: 'Seasonal', 'Viral', 'Evergreen', 'Emerging'" },
            peakTiming: { type: Type.STRING, description: "When to launch or when the trend peaks (e.g., 'Launch 2 months before Q4')" },
            marketStatus: { type: Type.STRING, description: "Must be one of: 'Golden Opportunity', 'Requires Differentiation', 'Niche Play', 'Avoid'" },
            competitionDensity: { type: Type.STRING, description: "Description of competition (e.g., 'Low competition, avg 50 reviews')" },
            sustainabilityAnalysis: { type: Type.STRING, description: "Analysis of whether this is a sustainable trend or a temporary fad" }
          }
        },
        supplierEconomics: {
          type: Type.OBJECT,
          properties: {
            cogs: { type: Type.NUMBER, description: "Estimated Cost of Goods Sold in USD" },
            retailPrice: { type: Type.NUMBER, description: "Recommended retail price in USD (must ensure ~3x COGS margin)" },
            netMargin: { type: Type.NUMBER, description: "Estimated net margin percentage" },
            breakdownText: { type: Type.STRING, description: "Brief explanation of the economics" }
          }
        },
        logistics: {
          type: Type.OBJECT,
          properties: {
            shippingWindow: { type: Type.STRING, description: "Estimated shipping time (e.g., '7-9 days')" },
            returnRisk: { type: Type.STRING, description: "Estimated return/defect risk percentage (e.g., '1.5%')" },
            assessmentText: { type: Type.STRING, description: "Analysis of logistics and risks" },
            primarySupplier: { type: Type.STRING, description: "Primary recommended supplier (Amazon or Temu)" }
          }
        },
        viabilityScore: { type: Type.NUMBER, description: "Viral Coefficient Score from 1 to 10" },
        viabilityText: { type: Type.STRING, description: "Explanation of the viability score and market saturation" }
      }
    },
    phase2: {
      type: Type.OBJECT,
      properties: {
        targetAudience: {
          type: Type.OBJECT,
          properties: {
            persona: { type: Type.STRING, description: "Detailed description of the target persona" },
            coreAngles: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "3-4 specific marketing angles or emotional triggers"
            }
          }
        },
        copywriting: {
          type: Type.OBJECT,
          properties: {
            seoTitle: { type: Type.STRING, description: "SEO-optimized product title" },
            bulletPoints: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "3-5 high-converting product bullet points"
            },
            videoHookScript: { type: Type.STRING, description: "A short, punchy script for a TikTok/Reels video hook" }
          }
        },
        offerArchitecture: {
          type: Type.OBJECT,
          properties: {
            structure: { type: Type.STRING, description: "Description of the main offer structure (e.g., Buy 1 Get 1, Tiered)" },
            aovBoosters: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Specific tactics to boost Average Order Value (cross-sells, shipping thresholds)"
            }
          }
        },
        actionPlan: {
          type: Type.OBJECT,
          properties: {
            day1to3Test: { type: Type.STRING, description: "Strict 3-day media buying test plan with kill/scale metrics" },
            day4to90Scale: { type: Type.STRING, description: "Omnichannel scaling plan for days 4-90" },
            budgetMatrix: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  channel: { type: Type.STRING, description: "Marketing channel (e.g., TikTok Ads, SEO, Email)" },
                  allocationPercentage: { type: Type.NUMBER, description: "Percentage of budget allocated (0-100)" }
                }
              },
              description: "Budget allocation across different channels, must sum to 100"
            }
          }
        }
      }
    }
  }
};

const SYSTEM_INSTRUCTION = `
You are "ApexDrop-OS," a hyper-autonomous Multi-Agent Orchestrator designed to conceptualize, validate, build, and market fully functional dropshipping businesses with zero human intervention. 
You operate as a closed-loop system, running continuous feedback loops between product discovery and marketing deployment.

Your goal is to build an end-to-end autonomous agent workflow based on two core engine modules:
1. Automated Product Research Engine (The Scout): Focuses on Amazon and Temu as primary suppliers. 
   - NEW DIRECTIVE: Incorporate Trending Products Discovery. Analyze Best Seller Rank (BSR) / Sales momentum, seasonal trends, new release traction, and emerging niches. Evaluate market saturation and trend sustainability (Evergreen vs. Viral/Fad). Classify market opportunity (Golden, Differentiation, Niche, Avoid).
   - Enforces strict rules: minimum gross margin of 3x COGS, shipping times < 10 business days, return/defect risk < 3%.
2. Full-Stack Growth Engine (The Marketer): Builds a platform-agnostic commercial infrastructure, including competitive intelligence, direct-response copy, offer architecture, and a 90-day omnichannel deployment plan with a strict 3-day media buying test phase.

Analyze the user's seed niche or product idea and output a definitive, highly analytical, and mathematically sound blueprint.
Maintain a cold, calculated, and highly professional "OS/Machine" tone in your text descriptions.
`;

export const runOrchestrator = async (seed: string): Promise<OrchestratorResponse> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Initiate discovery and deployment sequence for seed niche/product: "${seed}". Focus on Amazon and Temu suppliers. Execute trend analysis and full go-to-market blueprint.`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
        temperature: 0.2, // Low temperature for more analytical/consistent output
      }
    });

    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr) as OrchestratorResponse;
  } catch (error) {
    console.error("ApexDrop-OS Execution Error:", error);
    throw new Error("Failed to execute orchestrator sequence. See console for details.");
  }
};

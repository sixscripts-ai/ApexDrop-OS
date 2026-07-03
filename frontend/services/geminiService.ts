import { GoogleGenAI, Type, Chat, Modality } from '@google/genai';
import { OrchestratorResponse, ProductOption } from '../types.ts';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY, vertexai: true });

// Bulletproof JSON extractor
const extractJson = (text: string) => {
  try {
    return JSON.parse(text);
  } catch (e) {
    const match = text.match(/```(?:json)?\n([\s\S]*?)\n```/);
    if (match) {
      try {
        return JSON.parse(match[1]);
      } catch (e2) {
        // ignore and fallback
      }
    }
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    const firstBracket = text.indexOf('[');
    const lastBracket = text.lastIndexOf(']');
    
    if (firstBrace !== -1 && lastBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
       return JSON.parse(text.substring(firstBrace, lastBrace + 1));
    } else if (firstBracket !== -1 && lastBracket !== -1) {
       return JSON.parse(text.substring(firstBracket, lastBracket + 1));
    }
    throw new Error("Could not parse JSON from response.");
  }
};

export const generateProductOptionsStream = async (
  seed: string,
  mode: 'niche' | 'xray',
  onUpdate: (text: string) => void
): Promise<ProductOption[]> => {
  const prompt = mode === 'xray' 
    ? `You are the Scout Module of ApexDrop-OS.
Analyze the following competitor URL or brand: "${seed}"
Use Google Search to reverse-engineer their product, pricing, and marketing angles.
Find 3 distinct ways to beat or replicate their success with a dropshipping product.

Generate exactly 3 distinct dropshipping product options based on this research.
You MUST return ONLY a valid JSON array of objects. Do not include markdown formatting like \`\`\`json.

Format:
[
  {
    "id": "1",
    "name": "Product Name",
    "niche": "Specific Niche",
    "description": "Brief description of why this is a good opportunity right now based on search trends.",
    "viabilityEstimate": 8
  }
]`
    : `You are the Scout Module of ApexDrop-OS.
Analyze the following seed niche or product idea: "${seed}"
Use Google Search to find current market trends, top sellers, and emerging opportunities related to this seed.

Generate exactly 3 distinct dropshipping product options based on this research.
You MUST return ONLY a valid JSON array of objects. Do not include markdown formatting like \`\`\`json.

Format:
[
  {
    "id": "1",
    "name": "Product Name",
    "niche": "Specific Niche",
    "description": "Brief description of why this is a good opportunity right now based on search trends.",
    "viabilityEstimate": 8
  }
]`;

  try {
    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.3,
      }
    });

    let fullText = '';
    for await (const chunk of responseStream) {
      fullText += chunk.text;
      onUpdate(fullText);
    }

    return extractJson(fullText) as ProductOption[];
  } catch (error) {
    console.error("Error generating options:", error);
    throw new Error("Failed to generate product options. Ensure API key is valid.");
  }
};

export const generateFullReportStream = async (
  option: ProductOption,
  onUpdate: (text: string) => void
): Promise<{ data: OrchestratorResponse, urls: string[] }> => {
  const prompt = `
You are ApexDrop-OS, a hyper-autonomous Multi-Agent Orchestrator.
Execute the full discovery and deployment sequence for the following selected product:
Name: ${option.name}
Niche: ${option.niche}
Description: ${option.description}

Use Google Search to gather real-time data on pricing, competitors, and trends.

CRITICAL DIRECTIVES:
1. SOURCING: Determine the best sourcing method. Provide exactly 2-3 REAL supplier matches (e.g., specific AliExpress, CJ Dropshipping, Printify, or AutoDS links/names) with estimated ratings and shipping times.
2. CASH FLOW: Generate a realistic 12-week cash flow projection (revenue, adSpend, profit) assuming a starting budget of $1000 and scaling up if profitable.
3. EMAIL FLOWS: Generate 2 high-converting email templates (1 Abandoned Cart, 1 Welcome Series).
4. LANDING PAGE: Generate a complete, single-file HTML document using Tailwind CSS via CDN for the product's landing page. Make it high-converting and beautiful. Do NOT use React. Just pure HTML. You MUST include <script src="https://cdn.tailwindcss.com"></script> in the <head> tag.

You MUST return ONLY a valid JSON object representing the full report. Do not include markdown formatting like \`\`\`json.

Required JSON Structure:
{
  "phase1": {
    "productIdentity": "string",
    "niche": "string",
    "trendAnalysis": {
      "momentumScore": number (1-10),
      "trendType": "Seasonal" | "Viral" | "Evergreen" | "Emerging",
      "peakTiming": "string",
      "marketStatus": "Golden Opportunity" | "Requires Differentiation" | "Niche Play" | "Avoid",
      "competitionDensity": "string",
      "sustainabilityAnalysis": "string",
      "radarScores": { "demand": number(1-10), "competition": number(1-10), "margin": number(1-10), "trend": number(1-10) }
    },
    "supplierEconomics": {
      "cogs": number,
      "retailPrice": number,
      "netMargin": number,
      "breakdownText": "string"
    },
    "logistics": {
      "shippingWindow": "string",
      "returnRisk": "string",
      "assessmentText": "string",
      "primarySupplier": "string"
    },
    "sourcingStrategy": {
      "method": "Print-on-Demand (POD)" | "Standard Dropshipping" | "Private Label / Bulk Inventory",
      "recommendedSuppliers": [
        { "name": "string", "url": "string", "rating": "string", "shippingTime": "string" }
      ],
      "reasoning": "string",
      "integrationSteps": "string"
    },
    "viabilityScore": number (1-10),
    "viabilityText": "string"
  },
  "phase2": {
    "targetAudience": {
      "persona": "string",
      "coreAngles": ["string", "string", "string"]
    },
    "copywriting": {
      "seoTitle": "string",
      "bulletPoints": ["string", "string", "string"],
      "videoHookScript": "string"
    },
    "offerArchitecture": {
      "structure": "string",
      "aovBoosters": ["string", "string"]
    },
    "actionPlan": {
      "day1to3Test": "string",
      "day4to90Scale": "string",
      "budgetMatrix": [
        { "channel": "TikTok Ads", "allocationPercentage": 40 }
      ],
      "cashFlowProjections": [
        { "week": 1, "revenue": 500, "adSpend": 300, "profit": 50 }
      ]
    },
    "emailMarketing": [
      {
        "type": "Abandoned Cart - Email 1",
        "subject": "string",
        "previewText": "string",
        "body": "string"
      },
      {
        "type": "Welcome Series - Email 1",
        "subject": "string",
        "previewText": "string",
        "body": "string"
      }
    ],
    "landingPageCode": "string (Pure HTML document. MUST include <script src=\\"https://cdn.tailwindcss.com\\"></script> in the <head>)"
  }
}
  `;

  try {
    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.2,
      }
    });

    let fullText = '';
    let groundingUrls: string[] = [];
    
    for await (const chunk of responseStream) {
      fullText += chunk.text;
      onUpdate(fullText);
      
      if (chunk.candidates?.[0]?.groundingMetadata?.groundingChunks) {
         const chunks = chunk.candidates[0].groundingMetadata.groundingChunks;
         chunks.forEach(c => {
           if (c.web?.uri && !groundingUrls.includes(c.web.uri)) {
             groundingUrls.push(c.web.uri);
           }
         });
      }
    }

    const parsedData = extractJson(fullText) as OrchestratorResponse;
    return { data: parsedData, urls: groundingUrls };
  } catch (error) {
    console.error("Error generating report:", error);
    throw new Error("Failed to generate full report.");
  }
};

export const generateProductImage = async (productName: string): Promise<string | undefined> => {
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: `Professional e-commerce product photography of ${productName}, clean white background, high quality, 4k, studio lighting, highly detailed.`,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '1:1',
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const base64ImageBytes = response.generatedImages[0].image.imageBytes;
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    }
    return undefined;
  } catch (error) {
    console.error("Image generation failed:", error);
    return undefined;
  }
};

export const generateProductVideo = async (promptText: string): Promise<string | undefined> => {
  try {
    let operation = await ai.models.generateVideos({
      model: 'veo-2.0-generate-001',
      prompt: `Cinematic, high-quality promotional video for e-commerce: ${promptText}. Fast-paced, engaging, bright lighting.`,
      config: {
        numberOfVideos: 1
      }
    });
    
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({operation: operation});
    }
    
    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) return undefined;
    
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Video generation failed:", error);
    return undefined;
  }
};

export const initStrategistChat = (reportData: OrchestratorResponse): Chat => {
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: `You are the ApexDrop-OS AI Strategist. You are assisting the user with the following dropshipping blueprint:\n\n${JSON.stringify(reportData)}\n\nAnswer questions, provide variations of copy, suggest new targeting angles, or explain the cash flow projections based on this context. Keep answers concise, highly actionable, and professional.`,
      temperature: 0.4,
    }
  });
};

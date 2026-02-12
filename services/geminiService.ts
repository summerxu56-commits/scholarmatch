import { GoogleGenAI } from "@google/genai";
import { Professor, SearchFilters } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper function to wait
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const searchProfessors = async (keywords: string[], filters: SearchFilters): Promise<Professor[]> => {
  const modelId = "gemini-2.0-flash";
  
  const keywordsString = keywords.join(", ");
  const rankingContext = filters.rankingRange || "Top 50";
  const departmentContext = filters.department || "relevant departments";
  
  // OPTIMIZATION: Reduced count to 5 and requested concise outputs to save tokens and avoid 429 errors
  const prompt = `
    Find 5 distinct professors in the US matching these criteria:
    1. Interests: ${keywordsString}.
    2. Ranking: ${rankingContext}.
    3. Dept: ${departmentContext}.
    
    Calculate "matchScore" (0-100) based on relevance to keywords.
    
    Output strictly as a JSON array. Keys: 
    - "name"
    - "university" 
    - "department"
    - "matchScore" (number)
    - "matchReason" (Max 10 words)
    - "websiteUrl"
    - "researchInterests" (Array of 3 strings)
    - "summary" (Max 15 words)
  `;

  let lastError;
  const maxRetries = 3;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: modelId,
        contents: prompt,
        config: {
          responseMimeType: "application/json", 
          tools: [{ googleSearch: {} }],
        },
      });

      const text = response.text || "";
      let jsonString = text;
      
      // Clean up markdown if present
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```([\s\S]*?)```/);
      if (jsonMatch && jsonMatch[1]) {
        jsonString = jsonMatch[1];
      }

      const data = JSON.parse(jsonString);
      const professorsList = Array.isArray(data) ? data : (data as any).professors || [];

      return professorsList.map((prof: any, index: number) => ({
        ...prof,
        id: `prof-${index}-${Date.now()}`,
        matchReason: prof.matchReason || "Matched based on keywords.",
        researchInterests: Array.isArray(prof.researchInterests) ? prof.researchInterests : [],
      }));

    } catch (error: any) {
      lastError = error;
      const isQuotaError = error.status === 429 || error.code === 429 || (error.message && error.message.includes("quota"));
      
      if (isQuotaError && attempt < maxRetries - 1) {
        // Exponential backoff: Wait 2s, then 4s, then stop
        const waitTime = 2000 * Math.pow(2, attempt);
        console.warn(`Attempt ${attempt + 1} failed with quota error. Retrying in ${waitTime}ms...`);
        await delay(waitTime);
        continue;
      }
      
      // If it's not a quota error, or we ran out of retries, break loop
      break;
    }
  }

  // If we get here, all retries failed
  console.error("Gemini API Error after retries:", lastError);
  if (lastError && (lastError.status === 429 || lastError.code === 429 || (lastError.message && lastError.message.includes("quota")))) {
    throw new Error("Server is busy (Quota Exceeded). Please try searching for fewer keywords or try again in 1 minute.");
  }
  
  throw new Error("Failed to fetch professor data.");
};
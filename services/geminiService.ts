import { GoogleGenAI } from "@google/genai";
import { Professor, SearchFilters } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const searchProfessors = async (keywords: string[], filters: SearchFilters): Promise<Professor[]> => {
  // Use 2.0 Flash as it is more stable for quotas than 3-preview
  const modelId = "gemini-2.0-flash";
  
  const keywordsString = keywords.join(", ");
  const rankingContext = filters.rankingRange || "Top 50";
  const departmentContext = filters.department || "relevant departments (e.g., Computer Science, Engineering)";
  
  // Reduced quantity from 20 to 8 to prevent "429 Resource Exhausted" errors
  const prompt = `
    I am a prospective PhD student looking for a supervisor in the US.
    
    SEARCH CRITERIA:
    1. Research Interests: ${keywordsString}.
    2. University Ranking: US News National University Ranking - ${rankingContext}.
    3. Department: ${departmentContext}.
    4. Quantity: Find 8 distinct professors (Reduced count for speed and stability).
    
    MATCHING SCORE ALGORITHM:
    Calculate a "matchScore" (0-100) for each professor based on:
    - **Relevance (60%)**: How directly do their core research interests map to ${keywordsString}?
    - **Recency (20%)**: Do they have publications in these specific areas since 2021?
    - **Focus (20%)**: Is this their primary research area or just a side topic?
    
    OUTPUT REQUIREMENTS:
    For each professor, provide:
    1. Full Name
    2. University and Department
    3. Match Score (0-100) based on the algorithm above.
    4. Match Reason: A short sentence explaining the score.
    5. Website URL: Direct link to lab or faculty profile (if known, otherwise estimate).
    6. Research Interests: List of 3-4 specific topics.
    7. Summary: 2 sentences on their specific work.
    
    CRITICAL: Output the result strictly as a JSON array. 
    The JSON objects must have these exact keys: "name", "university", "department", "matchScore" (number), "matchReason" (string), "websiteUrl", "researchInterests" (array of strings), "summary".
  `;

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
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```([\s\S]*?)```/);
    if (jsonMatch && jsonMatch[1]) {
      jsonString = jsonMatch[1];
    }

    try {
      const data = JSON.parse(jsonString);
      const professorsList = Array.isArray(data) ? data : (data as any).professors || [];

      return professorsList.map((prof: any, index: number) => ({
        ...prof,
        id: `prof-${index}-${Date.now()}`,
        matchReason: prof.matchReason || "Matched based on research keywords.",
        researchInterests: Array.isArray(prof.researchInterests) ? prof.researchInterests : [],
      }));
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      throw new Error("Failed to parse professor data.");
    }
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    // Check specifically for 429 or Quota Exceeded
    if (error.status === 429 || error.code === 429 || (error.message && error.message.includes("quota"))) {
      throw new Error("API Quota Exceeded. The system is busy. Please try searching for fewer keywords or wait a minute before trying again.");
    }
    
    throw error;
  }
};
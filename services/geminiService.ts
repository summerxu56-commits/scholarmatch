import { GoogleGenAI } from "@google/genai";
import { Professor, SearchFilters } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const searchProfessors = async (keywords: string[], filters: SearchFilters): Promise<Professor[]> => {
  const modelId = "gemini-3-pro-preview";
  
  const keywordsString = keywords.join(", ");
  const rankingContext = filters.rankingRange || "Top 50";
  const departmentContext = filters.department || "relevant departments (e.g., Computer Science, Engineering)";
  
  const prompt = `
    I am a prospective PhD student looking for a supervisor in the US.
    
    SEARCH CRITERIA:
    1. Research Interests: ${keywordsString}.
    2. University Ranking: US News National University Ranking - ${rankingContext}.
    3. Department: ${departmentContext}.
    4. Quantity: Find at least 20 distinct professors.
    
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
    4. Match Reason: A short sentence explaining the score (e.g., "High match due to recent CVPR 2023 papers on transformers").
    5. Website URL: Direct link to lab or faculty profile.
    6. Research Interests: List of 3-4 specific topics.
    7. Summary: 2 sentences on their specific work.
    
    CRITICAL: Output the result strictly as a JSON array inside a markdown code block \`\`\`json ... \`\`\`. 
    The JSON objects must have these exact keys: "name", "university", "department", "matchScore" (number), "matchReason" (string), "websiteUrl", "researchInterests" (array of strings), "summary".
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "";
    
    // Extract JSON from markdown code block
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```([\s\S]*?)```/);
    
    if (jsonMatch && jsonMatch[1]) {
      try {
        const data = JSON.parse(jsonMatch[1]);
        // Add random IDs if not present and ensure fields exist
        return data.map((prof: any, index: number) => ({
          ...prof,
          id: `prof-${index}-${Date.now()}`,
          matchReason: prof.matchReason || "Matched based on research keywords.",
          researchInterests: Array.isArray(prof.researchInterests) ? prof.researchInterests : [],
        }));
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        console.log("Raw Text:", text);
        throw new Error("Failed to parse professor data from AI response.");
      }
    } else {
      console.warn("No JSON code block found in response.");
      throw new Error("AI did not return the expected format. Please try again.");
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
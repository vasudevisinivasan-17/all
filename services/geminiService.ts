import { GoogleGenAI, Type } from "@google/genai";

const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === 'undefined' || apiKey === '') {
    console.error("Gemini API Key is missing. Ensure API_KEY is set in your environment variables (e.g., Vercel Project Settings).");
  }
  return new GoogleGenAI({ apiKey: apiKey || '' });
};

export const getHintFromGemini = async (grid: string[][]): Promise<string> => {
  const gridString = grid.map(row => row.join(" ")).join("\n");
  const ai = getAIClient();

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        You are a word puzzle master. I have a ${grid[0].length}x${grid[0].length} grid of letters:
        ${gridString}
        Find one valid common English word (at least 3 letters long) that can be formed using letters from this grid. 
        Letters can be used from ANY position, but each specific grid cell can only be used once per word.
        Return ONLY the word in JSON format like: {"word": "EXAMPLE"}
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            word: { type: Type.STRING }
          },
          required: ["word"]
        }
      }
    });

    const text = response.text;
    if (!text) return "HINT_ERROR";

    const result = JSON.parse(text.trim());
    return result.word?.toUpperCase() || "HINT_ERROR";
  } catch (error) {
    console.error("Gemini hint failed:", error);
    return "HINT_ERROR";
  }
};

export const checkWordWithGemini = async (word: string): Promise<boolean> => {
  const ai = getAIClient();

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Is the word "${word}" a valid, common English dictionary word?`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isValid: { type: Type.BOOLEAN }
          },
          required: ["isValid"]
        }
      }
    });
    
    const text = response.text;
    if (!text) return false;
    
    const result = JSON.parse(text.trim());
    return !!result.isValid;
  } catch (error) {
    console.error("Gemini check word failed:", error);
    // Fallback for safety: if API fails, don't break the game, but maybe don't award points
    return false;
  }
};
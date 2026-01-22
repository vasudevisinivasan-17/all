
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getHintFromGemini = async (grid: string[][]): Promise<string> => {
  const gridString = grid.map(row => row.join(" ")).join("\n");
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        You are a word puzzle master. I have a ${grid[0].length}x${grid[0].length} grid of letters:
        ${gridString}
        Find one valid English word (at least 3 letters long) that can be formed using letters from this grid. 
        Letters can be used from ANY position (they do not need to be adjacent), but each specific grid cell can only be used once per word.
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

    const result = JSON.parse(response.text.trim());
    return result.word;
  } catch (error) {
    console.error("Gemini hint failed:", error);
    return "HINT_ERROR";
  }
};

export const checkWordWithGemini = async (word: string): Promise<boolean> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Is the word "${word}" a valid common English word? Answer only YES or NO.`,
    });
    return response.text.trim().toUpperCase().includes("YES");
  } catch (error) {
    return false;
  }
};

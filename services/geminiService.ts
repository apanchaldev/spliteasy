
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function parseNaturalLanguageExpense(input: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Parse this expense description and extract details: "${input}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
            amount: { type: Type.NUMBER },
            category: { 
              type: Type.STRING,
              description: "Must be one of: food, rent, travel, entertainment, other"
            },
            participants: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Names of friends involved"
            }
          },
          required: ["description", "amount", "category"]
        }
      }
    });

    return JSON.parse(response.text.trim());
  } catch (error) {
    console.error("Gemini Parsing Error:", error);
    return null;
  }
}

export async function getSpendingInsights(expenses: any[], friends: any[]) {
  try {
    const dataSummary = JSON.stringify({ expenses, friends });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze these expenses and give 3 short, helpful financial tips or insights for the user. Be friendly and encouraging like Splitwise's personality. 
      Data: ${dataSummary}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            insights: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  message: { type: Type.STRING },
                  severity: { type: Type.STRING, description: "info, warning, or success" }
                }
              }
            }
          }
        }
      }
    });

    return JSON.parse(response.text.trim());
  } catch (error) {
    console.error("Gemini Insights Error:", error);
    return null;
  }
}

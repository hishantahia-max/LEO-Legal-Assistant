import { GoogleGenAI, Schema, Type } from "@google/genai";
import { CaseEntity } from "../types";

const ecourtsResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    found: { type: Type.BOOLEAN, description: "Whether the case was found in search results" },
    nextHearingDate: { type: Type.STRING, description: "YYYY-MM-DD format" },
    stage: { type: Type.STRING, description: "Current stage of the case" },
    courtName: { type: Type.STRING },
    petitioner: { type: Type.STRING },
    respondent: { type: Type.STRING },
    cnrNumber: { type: Type.STRING },
    orders: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          date: { type: Type.STRING },
          title: { type: Type.STRING },
          url: { type: Type.STRING }
        }
      }
    }
  },
  required: ["found"]
};

export class ECourtsService {
  private ai: GoogleGenAI | null = null;

  initialize(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  async syncCaseStatus(caseData: CaseEntity): Promise<any> {
    if (!this.ai) throw new Error("Gemini API not initialized");

    const query = `Current status of case ${caseData.caseNumber} in ${caseData.courtName}. petitioner ${caseData.petitionerName} vs ${caseData.respondentName}. Find next hearing date and recent orders.`;

    const prompt = `
      You are an e-Courts synchronization engine. 
      Perform a forensic search using the provided tools to find the latest status of this legal case.
      
      Case Details:
      - Number: ${caseData.caseNumber}
      - Court: ${caseData.courtName}
      - Party: ${caseData.petitionerName} vs ${caseData.respondentName}
      ${caseData.cnrNumber ? `- CNR: ${caseData.cnrNumber}` : ''}

      Look for:
      1. Next Hearing Date
      2. Current Stage
      3. Recent Orders/Judgments URLs
      4. Correct CNR Number if missing

      Return the data in the specified JSON schema.
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: ecourtsResponseSchema
        }
      });

      const text = response.text;
      if (!text) return { found: false };
      
      return JSON.parse(text);
    } catch (error) {
      console.error("e-Courts Sync Error:", error);
      throw new Error("Failed to synchronize with e-Courts.");
    }
  }
}

export const ecourtsService = new ECourtsService();

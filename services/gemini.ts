
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { DocMetadata } from '../types';

// Schema for structured output specialized for Legal Documents
const documentSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    court: { type: Type.STRING, description: "The name of the Court (e.g., Supreme Court of India, High Court of Delhi). Ensure hierarchy is respected." },
    caseNumber: { type: Type.STRING, description: "The specific Case Number (e.g., WP(C) 1234/2023, SLP(C) 5678/2024)." },
    parties: { type: Type.STRING, description: "The Case Title or Parties involved (e.g., State vs. John Doe, ABC Corp vs. XYZ Ltd)." },
    date: { type: Type.STRING, description: "The document date in YYYY-MM-DD format." },
    docType: { type: Type.STRING, description: "The specific legal document type (e.g., Order, Judgment, Petition, Affidavit, Vakalatnama). Defaults to 'General Document' if unclear." },
    suggestedFilename: { type: Type.STRING, description: "The formatted filename: YYYY-MM-DD_DocType.extension OR 'Unprocessed.extension' if data is missing." },
    folderPath: { type: Type.STRING, description: "The folder structure: Court Name/Case Number/" },
    summary: { type: Type.STRING, description: "A very brief 1-sentence summary of the legal content." }
  },
  required: ["court", "caseNumber", "docType", "suggestedFilename", "folderPath"],
};

const causeListSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      caseNumber: { type: Type.STRING },
      courtRoom: { type: Type.STRING },
      itemNumber: { type: Type.STRING },
      hearingDate: { type: Type.STRING },
      judgeName: { type: Type.STRING },
      petitioner: { type: Type.STRING },
      respondent: { type: Type.STRING }
    },
    required: ["caseNumber", "hearingDate"]
  }
};

export class AiRenamerService {
  private ai: GoogleGenAI | null = null;

  initialize(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  async suggestMetadata(extractedText: string, originalFilename: string): Promise<DocMetadata & { suggestedFilename: string }> {
    if (!this.ai) throw new Error("Gemini API not initialized.");

    if (!extractedText || extractedText.trim().length < 50) {
        throw new Error("Extracted text is too short or empty for analysis.");
    }

    const extension = originalFilename.split('.').pop() || '';
    const textContext = extractedText.slice(0, 15000);

    const prompt = `
      Act as a Senior Legal Clerk. Analyze the following legal document text to organize it into a digital case file system.
      CRITICAL PRIORITIES:
      1. Folder Path: Identify 'Court' and 'Case Number'.
      2. Normalization: "W.P.(PIL) No. 161 of 2024" -> "WPPIL 161-2024".
      3. Fallback: Default 'docType' to "General Document".
      4. Failure: If illegible, set 'suggestedFilename' to "Unprocessed.${extension}".

      Document Text:
      ${textContext}
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: documentSchema,
        }
      });

      const jsonStr = response.text;
      if (!jsonStr) throw new Error("No response from AI");
      return JSON.parse(jsonStr);

    } catch (error) {
      console.error("Gemini AI Error:", error);
      throw error;
    }
  }

  async parseCauseList(extractedText: string): Promise<any[]> {
    if (!this.ai) throw new Error("Gemini API not initialized.");

    const prompt = `
      Act as a Legal Schedule Manager. Analyze this raw text from a Daily Cause List.
      Extract: Case Number, Court Room, Item Number, Next Hearing Date, Parties.
      Normalize Case Numbers.
      
      Raw Text:
      ${extractedText.slice(0, 20000)}
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: causeListSchema
        }
      });
      return JSON.parse(response.text || "[]");
    } catch (error) {
      console.error("Cause List Parsing Error:", error);
      throw error;
    }
  }

  async chatWithAssistant(history: { role: string, content: string }[], documentContext: any[], userMessage: string): Promise<string> {
    if (!this.ai) throw new Error("Gemini API not initialized.");

    const contextSummary = documentContext.map(doc => 
      `- ${doc.currentName} (${doc.metadata?.caseNumber || 'No Case No'}): ${doc.metadata?.summary || 'No summary'}`
    ).join('\n');

    const systemInstruction = `
      You are an elite Legal Case Assistant. 
      Workspace Context:
      ${contextSummary}
      
      Answer queries about these files or general legal questions.
    `;

    // Correctly structure history for Gemini
    const contents = [
      { role: 'user', parts: [{ text: systemInstruction }] }, // Inject context as first user message
      { role: 'model', parts: [{ text: "Understood. I have reviewed the workspace context." }] },
      ...history.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      })),
      { role: 'user', parts: [{ text: userMessage }] }
    ];

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contents,
      });

      return response.text || "I apologize, I couldn't generate a response.";
    } catch (error) {
      console.error("Chat Error:", error);
      return "I encountered an error. Please try again.";
    }
  }

  async performLegalResearch(query: string): Promise<string> {
    if (!this.ai) throw new Error("Gemini API not initialized.");

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Research this legal query in the context of Indian Law: "${query}". 
        Cite relevant sections, case laws, and precedents. Format as a professional legal memo.`,
        config: {
          tools: [{ googleSearch: {} }] // Use Grounding
        }
      });

      // Append grounding metadata if available (URLs)
      let text = response.text || "No result found.";
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      
      if (chunks && chunks.length > 0) {
        text += "\n\n**Sources:**\n";
        chunks.forEach((chunk: any) => {
          if (chunk.web?.uri) {
            text += `- [${chunk.web.title}](${chunk.web.uri})\n`;
          }
        });
      }

      return text;
    } catch (error) {
      console.error("Research Error:", error);
      throw error;
    }
  }
}

export const aiRenamerService = new AiRenamerService();

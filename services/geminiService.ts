import { GoogleGenAI, Type } from "@google/genai";
import { ExtractionMode, ExtractedData } from "../types";

// Initialize the client
// API Key is injected by the environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const extractDocumentData = async (
  file: File,
  mode: ExtractionMode,
  summarize: boolean
): Promise<ExtractedData> => {
  try {
    const modelId = "gemini-2.5-flash"; // Excellent for multimodal document understanding
    const imagePart = await fileToGenerativePart(file);

    let prompt = "";
    let schema = null;

    // Define prompts and schemas based on mode
    switch (mode) {
      case ExtractionMode.TEXT:
        prompt = `Extract all legible text from this image. Preserve original line breaks where possible. 
                  ${summarize ? "Also provide a brief summary of the content." : ""}`;
        schema = {
          type: Type.OBJECT,
          properties: {
            rawText: { type: Type.STRING, description: "The full extracted text from the document." },
            summary: { type: Type.STRING, description: "A concise summary of the document content (optional)." },
          },
          required: ["rawText"],
        };
        break;

      case ExtractionMode.FORMS:
        prompt = `Analyze this document as a form. Identify all key-value pairs (fields and their entries). 
                  Return a list of fields. 
                  ${summarize ? "Also provide a brief summary of the document's purpose." : ""}`;
        schema = {
          type: Type.OBJECT,
          properties: {
            forms: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  key: { type: Type.STRING, description: "The field label or name." },
                  value: { type: Type.STRING, description: "The field value or entry." },
                },
                required: ["key", "value"],
              },
            },
            summary: { type: Type.STRING, description: "A concise summary of the form." },
          },
          required: ["forms"],
        };
        break;

      case ExtractionMode.TABLES:
        prompt = `Analyze this document for tables. Extract all tables found. 
                  Represent each table as a grid of strings.
                  ${summarize ? "Also provide a brief summary of the tabular data." : ""}`;
        schema = {
          type: Type.OBJECT,
          properties: {
            tables: {
              type: Type.ARRAY,
              description: "List of tables found in the document.",
              items: {
                type: Type.ARRAY,
                description: "A single table, represented as a list of rows.",
                items: {
                  type: Type.ARRAY,
                  description: "A single row, represented as a list of cell text.",
                  items: { type: Type.STRING },
                },
              },
            },
            summary: { type: Type.STRING, description: "A concise summary of the table data." },
          },
          required: ["tables"],
        };
        break;
    }

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          imagePart,
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.1, // Low temperature for higher accuracy in extraction
      }
    });

    const textResponse = response.text;
    if (!textResponse) {
      throw new Error("No response generated from AI model.");
    }

    const jsonResponse = JSON.parse(textResponse);
    return jsonResponse as ExtractedData;

  } catch (error) {
    console.error("Gemini Extraction Error:", error);
    return {
      error: error instanceof Error ? error.message : "An unknown error occurred during extraction."
    };
  }
};

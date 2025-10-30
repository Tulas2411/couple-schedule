import { GoogleGenAI } from "@google/genai";

/**
 * Initialize Gemini AI client
 * API key is loaded from GEMINI_API_KEY environment variable
 */
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not configured in environment variables"
    );
  }

  return new GoogleGenAI({
    apiKey: apiKey,
  });
}

/**
 * Generate AI response using Gemini
 * @param {string} userMessage - User's message
 * @param {string} systemContext - System/context instructions
 * @returns {Promise<{text: string, usage: object}>}
 */
export async function generateGeminiResponse(userMessage, systemContext = "") {
  try {
    const ai = getGeminiClient();

    // Combine system context with user message
    const prompt = systemContext
      ? `${systemContext}\n\nUser: ${userMessage}\n\nAssistant:`
      : userMessage;

    // Generate content using gemini-2.0-flash-exp (latest model)
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: prompt,
    });

    // Extract text from response
    const text = response.text;

    if (!text) {
      throw new Error("Empty response from Gemini API");
    }

    return {
      text: text.trim(),
      usage: {
        // Note: The SDK doesn't expose token counts in simple generateContent
        // Use more detailed API calls if you need usage stats
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
      },
    };
  } catch (error) {
    console.error("Gemini API Error:", error.message);
    throw new Error(`Gemini request failed: ${error.message}`);
  }
}

/**
 * Generate AI response with streaming (for future use)
 * @param {string} userMessage
 * @param {string} systemContext
 * @returns {Promise<AsyncGenerator<string>>}
 */
export async function* generateGeminiStream(userMessage, systemContext = "") {
  const ai = getGeminiClient();

  const prompt = systemContext
    ? `${systemContext}\n\nUser: ${userMessage}\n\nAssistant:`
    : userMessage;

  const stream = await ai.models.generateContentStream({
    model: "gemini-2.0-flash-exp",
    contents: prompt,
  });

  for await (const chunk of stream) {
    if (chunk.text) {
      yield chunk.text;
    }
  }
}

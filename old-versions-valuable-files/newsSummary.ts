import { GoogleGenerativeAI } from '@google/generative-ai';

const SUMMARY_TIMEOUT_MS = 5000;
const SUMMARY_MODELS = ['gemini-2.0-flash'] as const;

function buildSummaryPrompt(title: string, description: string): string {
  return [
    'Summarize this Formula 1 news item in 2 concise sentences.',
    'Keep it factual, neutral, and readable.',
    '',
    `Title: ${title}`,
    `Description: ${description}`,
  ].join('\n');
}

export async function generateNewsSummary(
  title: string,
  description: string,
): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return null;

  const client = new GoogleGenerativeAI(apiKey);
  const prompt = buildSummaryPrompt(title, description);
  let lastError: unknown = null;

  for (const modelName of SUMMARY_MODELS) {
    try {
      const model = client.getGenerativeModel({
        model: modelName,
        generationConfig: {
          maxOutputTokens: 150,
          temperature: 0.3,
        },
      });

      const result = await Promise.race([
        model.generateContent(prompt),
        new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error(`Summary timeout (${modelName})`)), SUMMARY_TIMEOUT_MS);
        }),
      ]);

      const text = result.response.text().trim();
      if (text) return text;
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError) {
    console.error('Gemini summary failed for all models:', lastError);
  }

  return null;
}

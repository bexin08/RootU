import { genAI, MODELS } from "./gemini";

export async function embedText(text: string): Promise<number[]> {
  const result = await genAI.models.embedContent({
    model: MODELS.embedding,
    contents: text,
    config: { outputDimensionality: 768 },
  });
  return result.embeddings?.[0]?.values || [];
}

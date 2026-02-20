export async function generateOpenAiMenuJson(_prompt: string): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is required");
  }

  throw new Error("OpenAI integration is not implemented");
}

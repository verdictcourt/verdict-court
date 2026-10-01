// Supabase Edge Function reference: ai-clerk
// Secret must be configured server-side as OPENAI_API_KEY.
// Never place the key in browser/mobile source.

import OpenAI from "npm:openai";

const openai = new OpenAI({ apiKey: Deno.env.get("OPENAI_API_KEY") });

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const { petitioner, respondent, exhibits = [] } = await req.json();
  const prompt = `You are the neutral Court Clerk for Verdict Court.\nDo not decide who is truthful or legally liable.\nReturn agreed facts, disputed facts, balanced summaries, 3 neutral jury questions, and possible PII redaction flags.\nPETITIONER:\n${petitioner}\nRESPONDENT:\n${respondent}\nEXHIBIT CAPTIONS:\n${JSON.stringify(exhibits)}`;
  const response = await openai.responses.create({ model: "gpt-5-mini", input: prompt });
  return Response.json({ clerk_brief: response.output_text });
});

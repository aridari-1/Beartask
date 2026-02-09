import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "*",
};

serve(async (req) => {
  // ✅ Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { status: 405, headers: corsHeaders }
      );
    }

    const body = await req.json().catch(() => null);

    if (!body || typeof body.question !== "string") {
      return new Response(
        JSON.stringify({ error: "Invalid request body" }),
        { status: 400, headers: corsHeaders }
      );
    }

    if (!OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Missing OpenAI API key" }),
        { status: 500, headers: corsHeaders }
      );
    }

    // 🔥 OpenAI Responses API
    const aiResponse = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0.3,
          input: [
            {
              role: "system",
              content: `
You are a friendly AI tutor for college undergraduates.

Explain academic concepts clearly and correctly.
Use simple language.
Define technical terms.
Use examples or analogies.
Be calm, encouraging, and concise.

Format EXACTLY like this:

Title:
<short title>

1. What this means
<plain explanation>

2. Why it matters
<context in college courses>

3. Example / Analogy
<intuitive example>

4. Key takeaway
<1–2 sentence summary>

Sources:
- <source name>
`,
            },
            {
              role: "user",
              content: `Explain this concept:\n"${body.question}"`,
            },
          ],
        }),
      }
    );

    const data = await aiResponse.json();

    if (!aiResponse.ok) {
      return new Response(
        JSON.stringify({ error: data }),
        { status: aiResponse.status, headers: corsHeaders }
      );
    }

    const outputText =
      data.output_text ||
      data.output?.[0]?.content?.[0]?.text;

    if (!outputText) {
      return new Response(
        JSON.stringify({ error: "No output from OpenAI" }),
        { status: 500, headers: corsHeaders }
      );
    }

    return new Response(
      JSON.stringify({ explanation: outputText }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: corsHeaders }
    );
  }
});

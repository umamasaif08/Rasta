import { NextRequest, NextResponse } from "next/server";

// ── Public types (re-used by the client UI) ───────────────────────────────

export interface AiReviewRequest {
  rawText: string;
  resourceName?: string;
}

export interface AiReviewResponse {
  cleanedDescription: string;
  missingFields: string[];
  suggestions: string[];
  confidence: "high" | "medium" | "low";
}

// ── System prompt ─────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a data-quality assistant for Rasta, a directory of free community resources in Karachi, Pakistan.

Your job is to take a raw, unedited description of a resource (shelter, food distribution, clinic, or legal aid) and:
1. Return a clean 2-3 sentence description in plain English — factual, neutral, no marketing language.
2. Identify any fields that appear to be missing. Required fields: name, address, phone number, opening hours, languages spoken, category (shelter/food/clinic/legal).
3. Give 1-3 short improvement suggestions for the listing.
4. Rate your confidence: "high" if the raw text was clear, "medium" if you had to infer details, "low" if the text was too vague.

Respond ONLY with a valid JSON object — no prose, no markdown fences:
{
  "cleanedDescription": "string",
  "missingFields": ["string"],
  "suggestions": ["string"],
  "confidence": "high" | "medium" | "low"
}`;

// ── Route handler ─────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // 1. Guard: key must exist — never expose to client
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not configured. Add it to .env.local — it must never have a NEXT_PUBLIC_ prefix." },
      { status: 503 }
    );
  }

  // 2. Parse + validate body
  let body: AiReviewRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { rawText, resourceName } = body;

  if (!rawText?.trim()) {
    return NextResponse.json(
      { error: "rawText is required and must not be empty." },
      { status: 400 }
    );
  }
  if (rawText.length > 4000) {
    return NextResponse.json(
      { error: "rawText must be 4000 characters or fewer." },
      { status: 400 }
    );
  }

  // 3. Build user message
  const userMessage = resourceName
    ? `Resource name: ${resourceName}\n\nRaw description:\n${rawText}`
    : `Raw description:\n${rawText}`;

  // 4. Call OpenAI Chat Completions — raw fetch, no SDK needed
  let openAiRes: Response;
  try {
    openAiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model:       "gpt-4o-mini",   // fast, cheap, sufficient for text cleanup
        max_tokens:  512,
        temperature: 0.2,             // low temp → consistent, factual output
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user",   content: userMessage },
        ],
        response_format: { type: "json_object" }, // forces valid JSON output
      }),
    });
  } catch (err) {
    console.error("[ai-review] network error reaching OpenAI:", err);
    return NextResponse.json(
      { error: "Could not reach OpenAI — check your network connection and try again." },
      { status: 502 }
    );
  }

  // 5. Handle non-2xx from OpenAI
  if (!openAiRes.ok) {
    let detail = "";
    try {
      const errBody = await openAiRes.json() as { error?: { message?: string } };
      detail = errBody?.error?.message ?? "";
    } catch { /* ignore parse error */ }

    console.error("[ai-review] OpenAI error:", openAiRes.status, detail);

    // Surface actionable messages for the two most common failures
    if (openAiRes.status === 401) {
      return NextResponse.json(
        { error: "Invalid OpenAI API key. Check OPENAI_API_KEY in .env.local." },
        { status: 502 }
      );
    }
    if (openAiRes.status === 429) {
      return NextResponse.json(
        { error: "OpenAI rate limit hit. Wait a moment and try again." },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { error: `OpenAI returned status ${openAiRes.status}${detail ? `: ${detail}` : ""}. Try again shortly.` },
      { status: 502 }
    );
  }

  // 6. Extract the assistant message content
  type OpenAiChoice = { message: { content: string } };
  type OpenAiBody   = { choices: OpenAiChoice[] };

  let openAiBody: OpenAiBody;
  try {
    openAiBody = await openAiRes.json();
  } catch {
    return NextResponse.json(
      { error: "Unexpected response format from OpenAI." },
      { status: 502 }
    );
  }

  const rawContent = openAiBody.choices?.[0]?.message?.content ?? "";
  if (!rawContent) {
    return NextResponse.json(
      { error: "OpenAI returned an empty response. Try again." },
      { status: 502 }
    );
  }

  // 7. Parse JSON from the model
  //    response_format: json_object means the content should already be valid JSON,
  //    but we still strip accidental markdown fences defensively.
  let parsed: AiReviewResponse;
  try {
    const jsonStr = rawContent
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i,     "")
      .replace(/```\s*$/i,     "")
      .trim();
    parsed = JSON.parse(jsonStr);
  } catch {
    console.error("[ai-review] failed to parse OpenAI JSON:", rawContent);
    return NextResponse.json(
      { error: "AI returned an unexpected format. Try again with clearer input text." },
      { status: 422 }
    );
  }

  // 8. Validate shape before returning to client
  if (
    typeof parsed.cleanedDescription !== "string" ||
    !Array.isArray(parsed.missingFields)           ||
    !Array.isArray(parsed.suggestions)             ||
    !["high", "medium", "low"].includes(parsed.confidence)
  ) {
    console.error("[ai-review] shape validation failed:", parsed);
    return NextResponse.json(
      { error: "AI response was missing required fields. Try again." },
      { status: 422 }
    );
  }

  return NextResponse.json(parsed satisfies AiReviewResponse);
}

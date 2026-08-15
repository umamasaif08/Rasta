import { NextRequest, NextResponse } from "next/server";

// ── Types ──────────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  resourceData?: {
    name: string;
    description: string;
    address: string;
    phone: string;
    hours: string;
    languages: string[];
  };
}

export interface ChatResponse {
  message: string;
  done?: boolean;          // true when conversation is complete
  summary?: string;        // final summary to save in aiReviewNotes
}

// ── System prompt ──────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a friendly assistant helping a community organization in Karachi, Pakistan improve their resource listing on Rasta, a directory of free services.

Your goal: Ask 4-6 adaptive questions to help them fill gaps and strengthen their listing. Be conversational and encouraging, not robotic.

**Guidelines:**
1. Review their current listing data (provided in context) and identify what's missing or vague
2. Ask ONE question at a time — keep it natural, not form-like
3. Prioritize the most impactful gaps: hours, languages, specific services, contact info
4. After 4-6 questions OR when they've addressed the key gaps, wrap up
5. When done, provide a plain-language summary with:
   - What's currently strong about their listing
   - What's missing or could be clearer
   - Concrete next steps they can take

**Tone:** Warm, supportive, brief. Think "helpful colleague" not "survey bot."

**When to finish:** After you've asked about the critical missing fields OR after 6 exchanges, say something like "Great! Let me summarize what we've covered..." and provide the final summary.

**Important:** When providing the final summary, start your response with "SUMMARY:" so the system knows to save it.`;

// ── Route handler ──────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // 1. Guard: key must exist
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not configured." },
      { status: 503 }
    );
  }

  // 2. Parse body
  let body: ChatRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { messages, resourceData } = body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json(
      { error: "messages array is required and must not be empty." },
      { status: 400 }
    );
  }

  // 3. Build context message with current listing data
  let contextMessage = "";
  if (resourceData) {
    contextMessage = `
**Current listing:**
- Name: ${resourceData.name}
- Description: ${resourceData.description || "(empty)"}
- Address: ${resourceData.address || "(empty)"}
- Phone: ${resourceData.phone || "(empty)"}
- Hours: ${resourceData.hours || "(empty)"}
- Languages: ${resourceData.languages.length > 0 ? resourceData.languages.join(", ") : "(none listed)"}
`;
  }

  // 4. Construct messages for OpenAI
  const openAiMessages: ChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
  ];

  if (contextMessage) {
    openAiMessages.push({
      role: "system",
      content: contextMessage,
    });
  }

  // Add conversation history
  openAiMessages.push(...messages);

  // 5. Call OpenAI
  let openAiRes: Response;
  try {
    openAiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: 400,
        temperature: 0.7,  // slightly more conversational than the cleanup endpoint
        messages: openAiMessages,
      }),
    });
  } catch (err) {
    console.error("[ai-chat] network error:", err);
    return NextResponse.json(
      { error: "Could not reach OpenAI. Check your connection and try again." },
      { status: 502 }
    );
  }

  if (!openAiRes.ok) {
    let detail = "";
    try {
      const errBody = await openAiRes.json() as { error?: { message?: string } };
      detail = errBody?.error?.message ?? "";
    } catch { /* ignore */ }

    console.error("[ai-chat] OpenAI error:", openAiRes.status, detail);

    if (openAiRes.status === 401) {
      return NextResponse.json(
        { error: "Invalid OpenAI API key." },
        { status: 502 }
      );
    }
    if (openAiRes.status === 429) {
      return NextResponse.json(
        { error: "Rate limit hit. Wait a moment and try again." },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { error: `OpenAI error ${openAiRes.status}. Try again shortly.` },
      { status: 502 }
    );
  }

  // 6. Extract response
  type OpenAiChoice = { message: { content: string } };
  type OpenAiBody = { choices: OpenAiChoice[] };

  let openAiBody: OpenAiBody;
  try {
    openAiBody = await openAiRes.json();
  } catch {
    return NextResponse.json(
      { error: "Unexpected response format from OpenAI." },
      { status: 502 }
    );
  }

  const assistantMessage = openAiBody.choices?.[0]?.message?.content ?? "";
  if (!assistantMessage) {
    return NextResponse.json(
      { error: "OpenAI returned an empty response." },
      { status: 502 }
    );
  }

  // 7. Check if this is the final summary
  const isSummary = assistantMessage.trim().toUpperCase().startsWith("SUMMARY:");
  const cleanedMessage = isSummary
    ? assistantMessage.replace(/^SUMMARY:\s*/i, "").trim()
    : assistantMessage;

  const response: ChatResponse = {
    message: cleanedMessage,
    done: isSummary,
    summary: isSummary ? cleanedMessage : undefined,
  };

  return NextResponse.json(response);
}

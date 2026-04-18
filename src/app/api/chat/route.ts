import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { messages, courseContext } = await req.json();

    if (!messages || !courseContext) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const systemPrompt = `You are an expert AI teaching assistant embedded in a course viewing platform.
The user is currently studying a course titled: "${courseContext.courseName}".
Course Description: ${courseContext.description}
Current Chapter being studied: "${courseContext.activeChapter.title}"
Chapter Context: ${courseContext.activeChapter.about}

Your job is to answer questions related strictly to the course material, clarify concepts, and help the user learn. 
Be concise, friendly, and very encouraging. Answer in the same language the user asks in. If asked about something completely unrelated to the course, gently redirect them back to the topic.`;

    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

    if (!OPENROUTER_API_KEY) {
       console.warn("OPENROUTER_API_KEY is missing for chat");
       return NextResponse.json({ error: "AI API key missing" }, { status: 500 });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-001",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages
        ]
      })
    });

    if (!response.ok) {
       const text = await response.text();
       console.error("Open router chat error:", text);
       throw new Error("Failed to fetch from OpenRouter");
    }

    const data = await response.json();
    const reply = data.choices[0].message.content;

    return NextResponse.json({ reply }, { status: 200 });
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: "Failed to process chat" }, { status: 500 });
  }
}

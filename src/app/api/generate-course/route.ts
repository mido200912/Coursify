import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { category, topic, difficulty, duration, includeVideo } = await req.json();

    if (!topic || !category) {
      return NextResponse.json(
        { error: "Category and Topic are required" },
        { status: 400 }
      );
    }

    const systemPrompt = `You are a professional educational course creator. Create a structured educational course in JSON format.
The JSON must have this strict structure:
{
  "courseName": "string",
  "description": "string",
  "chapters": [
    {
      "title": "string",
      "about": "string (MUST BE HIGHLY DETAILED. Write a comprehensive, long-form article for this chapter using Markdown. Include paragraphs, bullet points, explanations, and code examples if relevant. This is the main study material, so it must be extremely thorough and lengthy, at least 500-1000 words.)",
      "duration": "string (e.g. '15 min')",
      "youtubeQuery": "string (A highly optimized search query to find the best specific tutorial for this chapter on YouTube)",
      "quizzes": [
        {
          "question": "string",
          "options": ["string", "string", "string", "string"],
          "answer": "string (MUST exactly match one of the options)"
        }
      ]
    }
  ]
}
Return ONLY valid JSON. Do not include markdown codeblocks outside the JSON. Return the quizzes strictly as a JSON array inside each chapter object. Create exactly 5 Multiple Choice Questions (MCQs) for every chapter. Ensure the quizzes test ONLY the information provided in the 'about' text so the user is never asked about concepts outside the immediate scope.`;

    const userPrompt = `Create a robust, deeply detailed course about "${topic}" in the category of "${category}". The target audience difficulty is ${difficulty || "Beginner"} and the expected total duration is around ${duration || "1 hour"}. 
CRITICAL: The "about" section for EACH chapter must be extremely detailed and long. Do not just summarize the chapter; write the actual lesson content! Use rich markdown formatting (headings, bullet points, bold text).`;

    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    if (!OPENROUTER_API_KEY) {
       console.warn("OPENROUTER_API_KEY is not set.");
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
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch from OpenRouter: ${response.statusText}`);
    }

    const data = await response.json();
    let resultText = data.choices[0].message.content;

    resultText = resultText.replace(/```json\n?|```/gi, "").trim();
    
    return NextResponse.json(JSON.parse(resultText), { status: 200 });
  } catch (error: any) {
    console.error("Course Generation Error:", error);
    return NextResponse.json(
      { error: "Failed to generate course" },
      { status: 500 }
    );
  }
}

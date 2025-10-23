import { getUserFromToken } from "@/lib/auth";

export async function POST(request) {
  try {
    // Get user from token
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const user = await getUserFromToken(token);

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message, context } = await request.json();

    if (!message) {
      return Response.json({ error: "Message is required" }, { status: 400 });
    }

    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are a helpful AI assistant for a couple's schedule management app. 
            Help users organize their tasks, suggest priorities, and provide scheduling advice.
            Be friendly, concise, and couple-focused. Current user: ${
              user.email
            }.
            ${context ? `Context: ${JSON.stringify(context)}` : ""}`,
          },
          {
            role: "user",
            content: message,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("OpenAI API error:", error);
      return Response.json(
        { error: "AI service unavailable" },
        { status: 503 }
      );
    }

    const data = await response.json();
    const aiMessage =
      data.choices[0]?.message?.content ||
      "I'm sorry, I couldn't process that.";

    return Response.json({
      message: aiMessage,
      usage: data.usage,
    });
  } catch (error) {
    console.error("AI assistant error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Suggest tasks based on calendar
export async function GET(request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const user = await getUserFromToken(token);

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tasks = JSON.parse(searchParams.get("tasks") || "[]");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "You are a scheduling assistant. Analyze the tasks and provide 3-5 actionable suggestions for better time management.",
          },
          {
            role: "user",
            content: `Here are my upcoming tasks: ${JSON.stringify(
              tasks
            )}. Give me suggestions.`,
          },
        ],
        temperature: 0.8,
        max_tokens: 300,
      }),
    });

    const data = await response.json();
    const suggestions = data.choices[0]?.message?.content || "";

    return Response.json({ suggestions });
  } catch (error) {
    console.error("AI suggestions error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

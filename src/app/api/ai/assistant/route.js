import { getUserFromToken } from "@/lib/auth";
import { generateGeminiResponse } from "@/lib/gemini";

/**
 * POST: Chat with AI Assistant
 */
export async function POST(request) {
  try {
    // Authenticate user
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const user = await getUserFromToken(token);

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const { message, context } = await request.json();

    if (!message || !message.trim()) {
      return Response.json({ error: "Message is required" }, { status: 400 });
    }

    // Build system context for AI
    const systemContext = `You are a helpful AI assistant for a couple's schedule management application.

Your role:
- Help users organize their tasks and schedules
- Suggest priorities based on deadlines and importance
- Provide time management advice
- Be friendly, concise, and supportive
- Focus on actionable recommendations

Current user: ${user.email}
${
  context
    ? `\nUser's current tasks:
- Total tasks: ${context.tasksCount}
- Upcoming tasks: ${context.upcomingTasks}
- Completed tasks: ${context.completedTasks}`
    : ""
}

Guidelines:
- Keep responses under 3-4 sentences unless asked for details
- Prioritize practical advice over theory
- Use encouraging language
- If suggesting task priorities, explain why`;

    // Call Gemini API
    const result = await generateGeminiResponse(message, systemContext);

    return Response.json({
      message: result.text,
      usage: result.usage,
    });
  } catch (error) {
    console.error("AI assistant error:", error);

    return Response.json(
      {
        error:
          "AI service is temporarily unavailable. Please try again in a moment.",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 503 }
    );
  }
}

/**
 * GET: Generate task suggestions
 */
export async function GET(request) {
  try {
    // Authenticate user
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const user = await getUserFromToken(token);

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const tasksParam = searchParams.get("tasks");
    const tasks = tasksParam ? JSON.parse(tasksParam) : [];

    // Handle empty task list
    if (tasks.length === 0) {
      return Response.json({
        suggestions:
          "You don't have any upcoming tasks at the moment. Great job staying on top of things! 🎉\n\nConsider:\n1. Planning tasks for the upcoming week\n2. Setting personal or couple goals\n3. Scheduling quality time together",
      });
    }

    // Build task summary for AI
    const taskSummary = tasks
      .slice(0, 10) // Limit to first 10 tasks to avoid token limits
      .map((task, index) => {
        const parts = [`${index + 1}. "${task.title}"`];

        if (task.due_date) {
          parts.push(`Due: ${task.due_date}`);
        }

        if (task.priority && task.priority > 1) {
          parts.push(`Priority: ${task.priority}/4`);
        }

        return parts.join(" | ");
      })
      .join("\n");

    const systemContext = `You are an expert productivity and time management assistant.

Analyze the user's task list and provide 3-5 specific, actionable suggestions.

Focus areas:
1. Priority management (urgent vs important)
2. Time blocking strategies
3. Task breakdown (if any task seems too large)
4. Work-life balance
5. Avoiding overwhelm

Format: Provide a numbered list of practical suggestions with brief explanations.`;

    const userMessage = `Here are my upcoming tasks:\n\n${taskSummary}\n\nTotal: ${
      tasks.length
    } task${
      tasks.length === 1 ? "" : "s"
    }\n\nPlease analyze and give me specific suggestions to manage these effectively.`;

    // Call Gemini API
    const result = await generateGeminiResponse(userMessage, systemContext);

    return Response.json({
      suggestions: result.text,
      usage: result.usage,
    });
  } catch (error) {
    console.error("AI suggestions error:", error);

    return Response.json(
      {
        error: "Failed to generate suggestions. Please try again.",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

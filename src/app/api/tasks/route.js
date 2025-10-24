import { supabase } from "@/lib/supabaseClient";
import { getUserFromToken } from "@/lib/auth";

// GET: lấy tất cả task của user hiện tại
export async function GET(request) {
  try {
    // Lấy user từ token
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const user = await getUserFromToken(token);

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter");
    const listId = searchParams.get("listId");

    let query = supabase
      .from("tasks")
      .select("*, lists(name, color, icon)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    // Apply filters
    if (filter === "today") {
      const today = new Date().toISOString().split("T")[0];
      query = query.eq("due_date", today).eq("completed", false);
    } else if (filter === "next7days") {
      const today = new Date();
      const next7days = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      query = query
        .gte("due_date", today.toISOString().split("T")[0])
        .lte("due_date", next7days.toISOString().split("T")[0])
        .eq("completed", false);
    } else if (filter === "inbox") {
      query = query.is("list_id", null).eq("completed", false);
    } else if (filter === "completed") {
      query = query.eq("completed", true);
    } else if (listId) {
      query = query.eq("list_id", listId).eq("completed", false);
    } else {
      query = query.eq("completed", false);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Database error:", error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json(data);
  } catch (error) {
    console.error("Tasks GET error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST: thêm task mới
export async function POST(request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const user = await getUserFromToken(token);

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, due_date, due_time, list_id, priority, tags } =
      body;

    // Validation
    if (!title || title.trim().length === 0) {
      return Response.json({ error: "Title is required" }, { status: 400 });
    }

    if (title.length > 500) {
      return Response.json({ error: "Title is too long" }, { status: 400 });
    }

    // Validate due_date format if provided
    if (due_date && !/^\d{4}-\d{2}-\d{2}$/.test(due_date)) {
      return Response.json({ error: "Invalid date format" }, { status: 400 });
    }

    // Validate due_time format if provided
    if (due_time && !/^\d{2}:\d{2}$/.test(due_time)) {
      return Response.json({ error: "Invalid time format" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("tasks")
      .insert([
        {
          title: title.trim(),
          description: description?.trim() || null,
          due_date: due_date || null,
          due_time: due_time || null,
          list_id: list_id || null,
          priority: priority || 1,
          tags: tags || [],
          user_id: user.id,
          completed: false,
        },
      ])
      .select("*, lists(name, color, icon)");

    if (error) {
      console.error("Database error:", error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json(data[0], { status: 201 });
  } catch (error) {
    console.error("Tasks POST error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT: cập nhật task
export async function PUT(request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const user = await getUserFromToken(token);

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      id,
      title,
      description,
      due_date,
      due_time,
      list_id,
      priority,
      completed,
      tags,
    } = body;

    if (!id) {
      return Response.json({ error: "Task ID is required" }, { status: 400 });
    }

    // Check if task belongs to user
    const { data: existingTask } = await supabase
      .from("tasks")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (!existingTask) {
      return Response.json({ error: "Task not found" }, { status: 404 });
    }

    const updateData = {
      title: title?.trim(),
      description: description?.trim() || null,
      due_date: due_date || null,
      due_time: due_time || null,
      list_id: list_id || null,
      priority,
      tags: tags || [],
    };

    if (completed !== undefined) {
      updateData.completed = completed;
      updateData.completed_at = completed ? new Date().toISOString() : null;
    }

    const { data, error } = await supabase
      .from("tasks")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id)
      .select("*, lists(name, color, icon)");

    if (error) {
      console.error("Database error:", error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json(data[0]);
  } catch (error) {
    console.error("Tasks PUT error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE: xoá task
export async function DELETE(request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const user = await getUserFromToken(token);

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await request.json();

    if (!id) {
      return Response.json({ error: "Task ID is required" }, { status: 400 });
    }

    // Delete task only if it belongs to user
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Database error:", error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Tasks DELETE error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { supabase } from "@/lib/supabaseClient";

// GET: lấy tất cả task
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const filter = searchParams.get("filter"); // today, next7days, inbox, completed
  const listId = searchParams.get("listId");

  let query = supabase
    .from("tasks")
    .select("*, lists(name, color, icon)")
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
    // Default: show all uncompleted tasks
    query = query.eq("completed", false);
  }

  const { data, error } = await query;
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

// POST: thêm task mới
export async function POST(request) {
  const body = await request.json();
  const { title, description, due_date, due_time, list_id, priority, tags } =
    body;

  const { data, error } = await supabase
    .from("tasks")
    .insert([
      {
        title,
        description,
        due_date,
        due_time,
        list_id,
        priority: priority || 1,
        tags: tags || [],
        user_id: "00000000-0000-0000-0000-000000000000", // Temporary user_id
      },
    ])
    .select("*, lists(name, color, icon)");

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data[0]);
}

// PUT: cập nhật task
export async function PUT(request) {
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

  const updateData = {
    title,
    description,
    due_date,
    due_time,
    list_id,
    priority,
    tags,
  };

  if (completed !== undefined) {
    updateData.completed = completed;
    updateData.completed_at = completed ? new Date().toISOString() : null;
  }

  const { data, error } = await supabase
    .from("tasks")
    .update(updateData)
    .eq("id", id)
    .select("*, lists(name, color, icon)");

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data[0]);
}

// DELETE: xoá task
export async function DELETE(request) {
  const { id } = await request.json();
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ success: true });
}

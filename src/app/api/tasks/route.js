import { supabase } from "@/lib/supabaseClient";

// GET: lấy tất cả task
export async function GET() {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

// POST: thêm task mới
export async function POST(request) {
  const body = await request.json();
  const { title, description, due_date, tag } = body;
  const { data, error } = await supabase
    .from("tasks")
    .insert([{ title, description, due_date, tag }])
    .select();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data[0]);
}

// PUT: cập nhật task
export async function PUT(request) {
  const body = await request.json();
  const { id, title, description, due_date, tag } = body;
  const { data, error } = await supabase
    .from("tasks")
    .update({ title, description, due_date, tag })
    .eq("id", id)
    .select();
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

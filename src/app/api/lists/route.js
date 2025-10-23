import { supabase } from "@/lib/supabaseClient";

// GET: lấy tất cả lists
export async function GET() {
  const { data, error } = await supabase
    .from("lists")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

// POST: thêm list mới
export async function POST(request) {
  const body = await request.json();
  const { name, icon, color } = body;

  const { data, error } = await supabase
    .from("lists")
    .insert([
      {
        name,
        icon: icon || "📁",
        color: color || "#6c757d",
        user_id: "00000000-0000-0000-0000-000000000000", // Temporary
      },
    ])
    .select();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data[0]);
}

// DELETE: xoá list
export async function DELETE(request) {
  const { id } = await request.json();
  const { error } = await supabase.from("lists").delete().eq("id", id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ success: true });
}

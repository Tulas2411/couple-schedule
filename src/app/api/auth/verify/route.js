import { supabase } from "@/lib/supabaseClient";
import { createSession } from "@/lib/auth";

export async function POST(request) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return Response.json(
        { error: "Email and code are required" },
        { status: 400 }
      );
    }

    // Find user with matching code
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .eq("verification_code", code)
      .single();

    if (error || !user) {
      return Response.json(
        { error: "Invalid verification code" },
        { status: 400 }
      );
    }

    // Check if code expired
    if (new Date(user.verification_expires) < new Date()) {
      return Response.json(
        { error: "Verification code expired" },
        { status: 400 }
      );
    }

    // Update user as verified
    await supabase
      .from("users")
      .update({
        email_verified: true,
        verification_code: null,
        verification_expires: null,
      })
      .eq("id", user.id);

    // Create session
    const session = await createSession(user.id);

    return Response.json({
      message: "Email verified successfully",
      token: session.token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
      },
    });
  } catch (error) {
    console.error("Verification error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { supabase } from "@/lib/supabaseClient";
import { comparePassword, createSession } from "@/lib/auth";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return Response.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find user
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !user) {
      return Response.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check if email is verified
    if (!user.email_verified && !user.google_id) {
      return Response.json(
        {
          error: "Please verify your email first",
          needsVerification: true,
        },
        { status: 403 }
      );
    }

    // Verify password (skip for Google users)
    if (!user.google_id) {
      const isValid = await comparePassword(password, user.password_hash);
      if (!isValid) {
        return Response.json(
          { error: "Invalid email or password" },
          { status: 401 }
        );
      }
    }

    // Create session
    const session = await createSession(user.id);

    return Response.json({
      message: "Login successful",
      token: session.token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        avatarUrl: user.avatar_url,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

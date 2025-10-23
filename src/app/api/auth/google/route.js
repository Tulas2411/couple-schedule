import { supabase } from "@/lib/supabaseClient";
import { createSession } from "@/lib/auth";

export async function POST(request) {
  try {
    const { credential, fullName, email, googleId, avatarUrl } =
      await request.json();

    if (!email || !googleId) {
      return Response.json(
        { error: "Invalid Google authentication" },
        { status: 400 }
      );
    }

    // Check if user exists
    let { data: user } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (!user) {
      // Create new user with Google account
      const { data: newUser, error } = await supabase
        .from("users")
        .insert([
          {
            email,
            google_id: googleId,
            full_name: fullName || null,
            avatar_url: avatarUrl || null,
            email_verified: true, // Google emails are pre-verified
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("User creation error:", error);
        return Response.json(
          { error: "Failed to create user" },
          { status: 500 }
        );
      }
      user = newUser;
    } else if (!user.google_id) {
      // Link existing account with Google
      await supabase
        .from("users")
        .update({
          google_id: googleId,
          avatar_url: avatarUrl || user.avatar_url,
          email_verified: true,
        })
        .eq("id", user.id);
    }

    // Create session
    const session = await createSession(user.id);

    return Response.json({
      message: "Google login successful",
      token: session.token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        avatarUrl: user.avatar_url,
      },
    });
  } catch (error) {
    console.error("Google auth error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

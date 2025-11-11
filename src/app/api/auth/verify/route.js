import { supabase } from "@/lib/supabaseClient";
import { createSession } from "@/lib/auth";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

export async function POST(request) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return Response.json(
        { error: "Email and code are required" },
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
      console.error("User not found:", email);
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Check if already verified
    if (user.email_verified) {
      return Response.json(
        { error: "Email is already verified" },
        { status: 400 }
      );
    }

    // Verify code matches
    if (user.verification_code !== code) {
      console.error(
        "Invalid code. Expected:",
        user.verification_code,
        "Got:",
        code
      );
      return Response.json(
        { error: "Invalid verification code" },
        { status: 400 }
      );
    }

    // Check if code expired
    dayjs.extend(utc);
    dayjs.extend(timezone);
    const now = dayjs().tz("Asia/Ho_Chi_Minh");
    const expiresAt = new Date(user.verification_expires);

    console.log("⏰ Current time:", now.toISOString());
    console.log("⏰ Code expires:", expiresAt.toISOString());
    console.log("⏰ Time difference (minutes):", (expiresAt - now) / 1000 / 60);

    if (expiresAt < now) {
      console.error("Code expired!");
      return Response.json(
        { error: "Verification code expired. Please request a new code." },
        { status: 400 }
      );
    }

    // Update user as verified
    const { error: updateError } = await supabase
      .from("users")
      .update({
        email_verified: true,
        verification_code: null,
        verification_expires: null,
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Failed to update user:", updateError);
      return Response.json(
        { error: "Failed to verify email" },
        { status: 500 }
      );
    }

    // Create session
    const session = await createSession(user.id);

    console.log("✅ Email verified successfully for:", email);

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
// Thêm vào route để test
console.log(
  "Server timezone:",
  Intl.DateTimeFormat().resolvedOptions().timeZone
);
console.log("Server time:", new Date().toISOString());

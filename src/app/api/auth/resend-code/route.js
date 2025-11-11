import { supabase } from "@/lib/supabaseClient";
import { generateVerificationCode } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/email";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return Response.json({ error: "Email is required" }, { status: 400 });
    }

    // Find user by email
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (userError || !user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Check if already verified
    if (user.email_verified) {
      return Response.json(
        { error: "Email is already verified" },
        { status: 400 }
      );
    }

    // Generate new verification code
    const verificationCode = generateVerificationCode();

    // ⚡ FIX: Tạo thời gian hết hạn đúng với UTC
    dayjs.extend(utc);
    dayjs.extend(timezone);
    const now = dayjs().tz("Asia/Ho_Chi_Minh");
    const verificationExpires = now.add(1, "hour");
    const verificationExpiresISO = verificationExpires.utc().toISOString();
    console.log("📍 Server timezone: Asia/Ho_Chi_Minh");
    console.log("⏰ Current VN time:", now.format("YYYY-MM-DD HH:mm:ss"));
    console.log(
      "⏰ Code expires at:",
      verificationExpires.format("YYYY-MM-DD HH:mm:ss")
    );
    console.log("🔄 Resending verification code");
    console.log("📧 Email:", email);
    console.log("🔐 New code:", verificationCode);
    console.log("⏰ Current time:", now.format("YYYY-MM-DD HH:mm:ss"));
    console.log(
      "⏰ New expiry time:",
      verificationExpires.format("YYYY-MM-DD HH:mm:ss")
    );
    console.log("⏰ New expiry time:", verificationExpiresISO);

    // Update user with new code
    const { error: updateError } = await supabase
      .from("users")
      .update({
        verification_code: verificationCode,
        verification_expires: verificationExpires.format("YYYY-MM-DD HH:mm:ss"),
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Database error:", updateError);
      return Response.json(
        { error: "Failed to update verification code" },
        { status: 500 }
      );
    }

    // Send new verification email
    const emailResult = await sendVerificationEmail(email, verificationCode);

    if (!emailResult.success) {
      console.error("Email sending failed:", emailResult.error);
      return Response.json(
        { error: "Failed to send verification email" },
        { status: 500 }
      );
    }

    console.log("✅ Verification code resent successfully");

    return Response.json({
      message: "Verification code sent successfully",
      emailSent: true,
    });
  } catch (error) {
    console.error("Resend code error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

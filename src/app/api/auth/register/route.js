import { supabase } from "@/lib/supabaseClient";
import { hashPassword, generateVerificationCode } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/email";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

export async function POST(request) {
  try {
    const { email, password, fullName } = await request.json();

    // Validation
    if (!email || !password) {
      return Response.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return Response.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Response.json({ error: "Invalid email format" }, { status: 400 });
    }

    // Check if user exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (existingUser) {
      return Response.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    // Hash password and generate verification code
    const passwordHash = await hashPassword(password);
    const verificationCode = generateVerificationCode();

    // ⚡ FIX: Tạo thời gian hết hạn với UTC (sẽ tự động chuyển đổi đúng)
    dayjs.extend(utc);
    dayjs.extend(timezone);
    const now = dayjs().tz("Asia/Ho_Chi_Minh");
    const verificationExpires = now.add(1, "hour");

    console.log("🔐 Generated verification code:", verificationCode);
    console.log(
      "📍 Server timezone:",
      Intl.DateTimeFormat().resolvedOptions().timeZone
    );
    console.log("⏰ Current server time:", now.toISOString());
    console.log("⏰ Code will expire at:", verificationExpires.toISOString());
    console.log(
      "⏰ Time until expiry (minutes):",
      (verificationExpires - now) / 1000 / 60
    );

    // Create user
    const { data: user, error } = await supabase
      .from("users")
      .insert([
        {
          email,
          password_hash: passwordHash,
          full_name: fullName || null,
          email_verified: false,
          verification_code: verificationCode,
          verification_expires: verificationExpires.toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return Response.json({ error: "Registration failed" }, { status: 500 });
    }

    console.log("✅ User created with expiry:", user.verification_expires);

    // Send verification email
    const emailResult = await sendVerificationEmail(email, verificationCode);
    if (!emailResult.success) {
      console.error("Email sending failed:", emailResult.error);
      // Continue anyway, user can request new code
    }

    return Response.json(
      {
        message:
          "Registration successful. Please check your email for verification code.",
        userId: user.id,
        emailSent: emailResult.success,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

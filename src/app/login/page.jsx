"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Container, Form, Button, Card, Alert } from "react-bootstrap";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();

    // Tạm thời login giả lập
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .eq("password_hash", password)
      .single();

    if (error || !data) {
      setMessage("Đăng nhập thất bại");
    } else {
      setMessage(`Xin chào, ${data.email}`);
    }
  };

  return (
    <Container className="mt-5" style={{ maxWidth: "400px" }}>
      <Card className="p-4 shadow">
        <h3 className="text-center mb-4">Đăng nhập</h3>
        {message && <Alert variant="info">{message}</Alert>}
        <Form onSubmit={handleLogin}>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Mật khẩu</Form.Label>
            <Form.Control
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Group>

          <Button variant="primary" type="submit" className="w-100">
            Đăng nhập
          </Button>
        </Form>
      </Card>
    </Container>
  );
}

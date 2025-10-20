"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Container, Form, Button, Card, Alert } from "react-bootstrap";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(null);

  const handleRegister = async (e) => {
    e.preventDefault();

    const { data, error } = await supabase
      .from("users")
      .insert([{ email, password_hash: password }]);

    if (error) setMessage("Đăng ký thất bại");
    else setMessage("Đăng ký thành công!");
  };

  return (
    <Container className="mt-5" style={{ maxWidth: "400px" }}>
      <Card className="p-4 shadow">
        <h3 className="text-center mb-4">Đăng ký</h3>
        {message && <Alert variant="info">{message}</Alert>}
        <Form onSubmit={handleRegister}>
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

          <Button variant="success" type="submit" className="w-100">
            Đăng ký
          </Button>
        </Form>
      </Card>
    </Container>
  );
}

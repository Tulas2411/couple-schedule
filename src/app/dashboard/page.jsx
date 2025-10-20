"use client";
import { Container, Button } from "react-bootstrap";

export default function Dashboard() {
  return (
    <Container className="mt-5 text-center">
      <h2>Chào mừng đến Couple Schedule Manager 💕</h2>
      <p>Tuần này bạn chỉ cần setup và làm đến đây là đủ.</p>
      <Button variant="primary" href="/login">
        Đăng nhập
      </Button>
    </Container>
  );
}

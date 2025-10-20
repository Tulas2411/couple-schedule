import { Container, Button } from "react-bootstrap";

export default function Home() {
  return (
    <Container className="text-center mt-5">
      <h1>👩‍❤️‍👨 Couple Schedule Manager</h1>
      <p>Ứng dụng giúp hai người quản lý thời gian và sự kiện chung.</p>
      <div className="d-flex justify-content-center gap-3 mt-4">
        <Button href="/login" variant="primary">
          Đăng nhập
        </Button>
        <Button href="/register" variant="success">
          Đăng ký
        </Button>
      </div>
    </Container>
  );
}

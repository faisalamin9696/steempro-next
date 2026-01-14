import { Card } from "@heroui/card";

function LoginAlertCard({ text = "continue" }: { text: string }) {
  return (
    <Card className="card p-8 text-center text-muted italic">
      Please login to {text}.
    </Card>
  );
}

export default LoginAlertCard;

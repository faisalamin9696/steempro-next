import { Card } from "@heroui/card";
import { useTranslations } from "next-intl";

function LoginAlertCard({ text = "continue" }: { text: string }) {
  const t = useTranslations("Common");
  return (
    <Card className="card p-8 text-center text-muted italic">
      {t("loginTo", { action: text })}
    </Card>
  );
}

export default LoginAlertCard;

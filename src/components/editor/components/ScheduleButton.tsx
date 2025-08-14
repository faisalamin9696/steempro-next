import { Button } from "@heroui/button";
import { FaCalendarAlt } from "react-icons/fa";
import { useTranslation } from "@/utils/i18n";

interface Props {
  buttonText?: string;
  isLoading?: boolean;
  onPress?: () => void;
  isDisabled?: boolean;
}

export default function ScheduleButton(props: Props) {
  const { t } = useTranslation();
  const { buttonText, isLoading, onPress, isDisabled } = props;

  return (
    <Button
      size="sm"
      title={t("submit.schedule_post")}
      onPress={onPress}
      color="primary"
      isDisabled={isDisabled}
      isLoading={isLoading}
      isIconOnly={!buttonText}
      variant="flat"
    >
      {buttonText ? (
        buttonText ?? t("submit.schedule")
      ) : (
        <FaCalendarAlt className="text-xl" />
      )}
    </Button>
  );
}

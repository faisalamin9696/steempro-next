import { Button } from "@heroui/button";
import { useTranslation } from "@/utils/i18n";

interface Props {
  buttonText?: string;
  isLoading?: boolean;
  tooltip?: string;
  onPress?: () => void;
  isDisabled?: boolean;
}
export default function PublishButton(props: Props) {
  const { t } = useTranslation();
  const { buttonText, isLoading, tooltip, onPress, isDisabled } = props;

  return (
    <Button
      size="sm"
      title={tooltip ?? t("submit.publish_post")}
      isDisabled={isDisabled}
      color="success"
      onPress={onPress}
      isLoading={isLoading}
      radius="lg"
      variant="flat"
    >
      {buttonText ?? t("submit.publish")}
    </Button>
  );
}

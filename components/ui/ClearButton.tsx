import { Button, ButtonProps } from "@heroui/button";
import SPopover from "./SPopover";
import { Trash } from "lucide-react";
import { useTranslations } from "next-intl";

interface Props extends Omit<ButtonProps, "onPress"> {
  iconSize?: number;
  onPress: () => void;
}

function ClearButton({ iconSize = 22, onPress, ...props }: Props) {
  const t = useTranslations("Submit");

  return (
    <SPopover
      trigger={
        <Button variant="flat" color="danger" isIconOnly {...props}>
          <Trash size={iconSize} />
        </Button>
      }
      title={t("confirmTitle")}
      description={t("confirmDesc")}
    >
      {(onClose) => (
        <div className="flex flex-row gap-2 self-end">
          <Button onPress={onClose} variant="flat">
            {t("actions.cancel")}
          </Button>

          <Button
            color="danger"
            onPress={() => {
              onClose();
              onPress();
            }}
          >
            {t("clear")}
          </Button>
        </div>
      )}
    </SPopover>
  );
}

export default ClearButton;

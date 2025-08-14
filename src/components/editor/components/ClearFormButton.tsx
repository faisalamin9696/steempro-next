import { memo } from "react";
import { MdDelete } from "react-icons/md";
import ConfirmationPopup from "@/components/ui/ConfirmationPopup";
import { useTranslation } from "@/utils/i18n";

interface Props {
  onClearPress?: () => void;
  isDisabled?: boolean;
  title?: string;
  isLoading?: boolean;
  divTitle?: string;
}
export default memo(function ClearFormButton(props: Props) {
  const { t } = useTranslation();
  const { divTitle, title, isLoading, onClearPress, isDisabled } = props;

  return (
    <div title={divTitle ?? t("submit.clear_all")}>
      <ConfirmationPopup
        popoverProps={{ placement: "top-start" }}
        triggerProps={{
          size: "sm",
          color: "danger",
          isDisabled: isDisabled,
          isIconOnly: true,
          startContent: !isLoading && <MdDelete size={22} />,
          variant: "flat",
          isLoading: isLoading,
        }}
        subTitle={title ?? t("submit.clear_confirmation")}
        onConfirm={() => onClearPress?.()}
      />
    </div>
  );
});

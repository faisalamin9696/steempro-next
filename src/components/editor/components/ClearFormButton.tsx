import { memo } from "react";
import { MdDelete } from "react-icons/md";
import ConfirmationPopup from "@/components/ui/ConfirmationPopup";

interface Props {
  onClearPress?: () => void;
  isDisabled?: boolean;
  title?: string;
  isLoading?: boolean;
  divTitle?: string;
}
export default memo(function ClearFormButton(props: Props) {
  const { divTitle, title, isLoading, onClearPress, isDisabled } = props;

  return (
    <div title={divTitle ?? "Clear all"}>
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
        subTitle={title ?? "Do you really want to clear all data?"}
        onConfirm={() => onClearPress?.()}
      />
    </div>
  );
});

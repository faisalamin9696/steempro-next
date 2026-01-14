import { Button, ButtonProps } from "@heroui/button";
import SPopover from "./SPopover";
import { Trash } from "lucide-react";

interface Props extends Omit<ButtonProps, "onPress"> {
  iconSize?: number;
  onPress: () => void;
}

function ClearButton({ iconSize = 22, onPress, ...props }: Props) {
  return (
    <SPopover
      trigger={
        <Button variant="flat" color="danger" isIconOnly {...props}>
          <Trash size={iconSize} />
        </Button>
      }
      title="Confirmation"
      description="Do you really want to reset all data?"
    >
      {(onClose) => (
        <div className="flex flex-row gap-2 self-end">
          <Button onPress={onClose} variant="flat">
            Cancel
          </Button>

          <Button
            color="danger"
            onPress={() => {
              onClose();
              onPress();
            }}
          >
            Clear
          </Button>
        </div>
      )}
    </SPopover>
  );
}

export default ClearButton;

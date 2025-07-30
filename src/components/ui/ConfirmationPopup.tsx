import { Button, ButtonProps } from "@heroui/button";
import {
  Popover,
  PopoverContent,
  PopoverProps,
  PopoverTrigger,
} from "@heroui/popover";
import React, { useEffect, useState } from "react";
import KeychainButton from "../KeychainButton";
import { twMerge } from "tailwind-merge";

interface Props {
  triggerProps?: ButtonProps;
  buttonTitle?: string | React.ReactNode;
  title?: string;
  subTitle?: string;
  cancelTitle?: string;
  successTitle?: string;
  onConfirm: () => void;
  popoverProps?: Omit<PopoverProps, "children">;
  onKeychainPress?: () => void;
  onOpenChangeExternal?: (isOpen: boolean) => void;
}
function ConfirmationPopup(props: Props) {
  const {
    buttonTitle,
    triggerProps,
    title,
    subTitle,
    cancelTitle,
    successTitle,
    popoverProps,
    onConfirm,
    onKeychainPress,
    onOpenChangeExternal,
  } = props;
  const [popup, setPopup] = useState(false);

  useEffect(() => {
    onOpenChangeExternal?.(popup);
  }, [popup]);

  return (
    <div>
      <Popover {...popoverProps} isOpen={popup} onOpenChange={setPopup}>
        <PopoverTrigger>
          <Button {...triggerProps}>{buttonTitle}</Button>
        </PopoverTrigger>
        <PopoverContent>
          <div className="flex flex-col p-2 gap-4">
            <div className="flex flex-col gap-1">
              <div className="text-sm font-semibold">
                {title ?? "Confirmation"}
              </div>
              {subTitle && (
                <div className="text-sm flex text-default-500">{subTitle}</div>
              )}
            </div>
            <div
              className={twMerge(
                "flex flex-wrap-reverse sm:flex-wrap gap-3 w-full justify-end xs:justify-between items-center"
              )}
            >
              {onKeychainPress && (
                <KeychainButton
                  onPress={() => {
                    setPopup(false);
                    onKeychainPress?.();
                  }}
                />
              )}

              <div
                className={twMerge(
                  "flex flex-row justify-between items-center gap-2",
                  !onKeychainPress && "w-full justify-end"
                )}
              >
                <Button
                  onPress={() => setPopup(false)}
                  size="sm"
                  color="danger"
                  variant="light"
                >
                  {cancelTitle ?? "Cancel"}
                </Button>
                <Button
                  size="sm"
                  color="default"
                  variant="solid"
                  onPress={() => {
                    setPopup(false);
                    onConfirm();
                  }}
                >
                  {successTitle ?? "Yes"}
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default ConfirmationPopup;

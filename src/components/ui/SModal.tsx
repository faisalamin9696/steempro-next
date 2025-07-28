import { Button, ButtonProps } from "@heroui/button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalProps,
} from "@heroui/modal";
import React from "react";
import { twMerge } from "tailwind-merge";

type RenderFn = (onClose: () => void) => React.ReactNode;

interface Props {
  title?: RenderFn;
  subTitle?: RenderFn;
  body: RenderFn;
  footer?: RenderFn;
  onOpenChange: (isOpen: boolean) => void;
  isOpen?: boolean;
  triggerProps?: ButtonProps;
  modalProps?: Omit<ModalProps, "children">;
  buttonTitle?: string | React.ReactNode;
  shouldDestroy?: boolean;
  onClose?: () => void;
  hideTrigger?: boolean;
  bodyClassName?: string;
}
export default function SModal(props: Props) {
  const {
    modalProps,
    title,
    subTitle,
    isOpen,
    onOpenChange,
    triggerProps,
    body,
    footer,
    buttonTitle,
    shouldDestroy,
    onClose,
    hideTrigger,
    bodyClassName,
  } = props;

  const shouldShowButton =
    !hideTrigger &&
    !!buttonTitle &&
    (typeof buttonTitle !== "string" || buttonTitle.trim() !== "");

  return (
    <>
      {shouldShowButton && (
        <Button onPress={() => onOpenChange(!isOpen)} {...triggerProps}>
          {buttonTitle}
        </Button>
      )}
      {(!shouldDestroy || isOpen) && (
        <Modal
          {...modalProps}
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          onClose={() => onClose?.()}
        >
          <ModalContent>
            {(onClose) => (
              <>
                {(title || subTitle) && (
                  <ModalHeader className="flex flex-col gap-1 pb-0">
                    <div className="flex justify-between w-full">
                      <div className="space-y-1 w-full">
                        <h2 className="text-medium sm:text-lg font-semibold">
                          {title?.(onClose)}
                        </h2>
                        <p className="text-default-500 text-sm font-normal">
                          {subTitle?.(onClose)}
                        </p>
                      </div>
                    </div>
                  </ModalHeader>
                )}
                <ModalBody className={twMerge("mt-2", bodyClassName)}>
                  {body?.(onClose)}
                </ModalBody>
                <ModalFooter>{footer?.(onClose)}</ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      )}
    </>
  );
}

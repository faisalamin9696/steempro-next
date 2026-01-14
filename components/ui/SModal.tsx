import React, { useCallback, useMemo } from "react";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalProps,
} from "@heroui/modal";
import { ButtonProps } from "@heroui/button";
import { twMerge } from "tailwind-merge";

export type RenderFn = (onClose: () => void) => React.ReactNode;

interface SModalProps extends Omit<ModalProps, "title" | "children"> {
  triggerProps?: ButtonProps;
  title?: string | RenderFn;
  description?: string | RenderFn;
  footer?: RenderFn;
  children?: RenderFn;
  bodyClass?: string;
}

function SModal({
  triggerProps,
  children,
  title,
  description,
  footer,
  bodyClass = "",
  ...props
}: SModalProps) {
  const mergedBodyClass = useMemo(
    () => twMerge("mt-2", bodyClass),
    [bodyClass]
  );

  const renderTitle = useCallback(
    (onClose: () => void) =>
      typeof title === "function" ? title(onClose) : title,
    [title]
  );

  const renderDescription = useCallback(
    (onClose: () => void) =>
      typeof description === "function" ? description(onClose) : description,
    [description]
  );

  const renderChildren = useCallback(
    (onClose: () => void) => children?.(onClose),
    [children]
  );

  const renderFooter = useCallback(
    (onClose: () => void) => footer?.(onClose),
    [footer]
  );

  return (
    <Modal
      {...props}
      size={props.size ?? "lg"}
      scrollBehavior={props.scrollBehavior ?? "inside"}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 pb-0">
              <div className="flex justify-between w-full">
                <div className="space-y-1 w-full">
                  <h2 className="text-medium sm:text-lg font-semibold">
                    {renderTitle(onClose)}
                  </h2>

                  <p className="text-muted text-sm font-normal">
                    {renderDescription(onClose)}
                  </p>
                </div>
              </div>
            </ModalHeader>

            <ModalBody className={mergedBodyClass}>
              {renderChildren(onClose)}
            </ModalBody>

            <ModalFooter>{renderFooter(onClose)}</ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

export default React.memo(SModal);

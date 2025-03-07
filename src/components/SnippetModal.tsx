import { Modal, ModalBody, ModalContent, ModalHeader } from "@heroui/modal";
import { Tab, Tabs } from "@heroui/tabs";
import React from "react";
import SnippetTab from "./editor/snippet/SnippetTab";
import TemplateTab from "./editor/template/TemplateTab";

interface Props {
  isOpen: boolean;
  onOpenChange: (isOpen) => void;
  handleOnSelect?: (snippet: Snippet) => void;
}
function SnippetModal(props: Props) {
  const { isOpen, onOpenChange } = props;

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      className=" mt-4"
      scrollBehavior="inside"
      backdrop="opaque"
      size="xl"
      placement="top"
      isDismissable={false}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Snippet & Template
            </ModalHeader>
            <ModalBody id="scrollDiv" className=" pb-4">
              <div className=" flex flex-col gap-4">
                <Tabs radius="full" color="default"  size="md" aria-label="snippet tab">
                  <Tab key="snippet" title="Snippets">
                    <SnippetTab {...props} />
                  </Tab>
                  <Tab key="template" title="Templates">
                    <TemplateTab {...props} />
                  </Tab>
                </Tabs>
              </div>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

export default SnippetModal;

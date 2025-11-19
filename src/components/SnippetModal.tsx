import { Tab, Tabs } from "@heroui/tabs";
import React from "react";
import SnippetTab from "./editor/snippet/SnippetTab";
import TemplateTab from "./editor/template/TemplateTab";
import SModal from "./ui/SModal";

interface Props {
  isOpen: boolean;
  onOpenChange: (isOpen) => void;
  handleOnSelect?: (snippet: Snippet) => void;
}
function SnippetModal(props: Props) {
  const { isOpen, onOpenChange } = props;

  return (
    <SModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      modalProps={{ scrollBehavior: "inside", placement: "top", size: "xl" }}
      title={() => "Snippet & Template"}
      body={() => (
        <div className=" flex flex-col gap-4">
          <Tabs
            color="default"
            size="sm"
            aria-label="snippet tab"
            destroyInactiveTabPanel={false}
          >
            <Tab key="snippet" title="Snippets">
              <SnippetTab {...props} />
            </Tab>
            <Tab key="template" title="Templates">
              <TemplateTab {...props} />
            </Tab>
          </Tabs>
        </div>
      )}
    />
  );
}

export default SnippetModal;

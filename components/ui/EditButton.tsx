import { useState } from "react";
import { Button, ButtonProps } from "@heroui/button";
import { PencilLine, Share } from "lucide-react";
import SModal, { RenderFn } from "./SModal";
import ProfileSettings from "../settings/ProfileSettings";

interface EditButtonProps extends Omit<ButtonProps, "title"> {
  title?: string | RenderFn;
  buttonTitle?: string;
}

const EditButton = ({
  title,
  buttonTitle = "Edit",
  ...props
}: EditButtonProps) => {
  const [isEditOpen, setIsEditOpen] = useState(false);

  return (
    <>
      <Button
        {...props}
        startContent={<PencilLine size={20} />}
        onPress={() => setIsEditOpen(!isEditOpen)}
      >
        {buttonTitle}
      </Button>

      {isEditOpen && (
        <SModal isOpen={isEditOpen} onOpenChange={setIsEditOpen} title={title}>
          {() => <ProfileSettings className="w-full pb-0" />}
        </SModal>
      )}
    </>
  );
};

export default EditButton;

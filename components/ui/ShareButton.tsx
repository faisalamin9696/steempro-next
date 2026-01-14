import { useState } from "react";
import { Button, ButtonProps } from "@heroui/react";
import { Share } from "lucide-react";
import ShareModal from "./ShareModal";

interface ShareButtonProps extends ButtonProps {
  title?: string;
  url: string;
  buttonTitle?: string;
}

const ShareButton = ({
  title,
  url,
  buttonTitle = "Share",
  ...props
}: ShareButtonProps) => {
  const [isShareOpen, setIsShareOpen] = useState(false);

  return (
    <>
      <Button
        {...props}
        startContent={<Share size={20} />}
        onPress={() => setIsShareOpen(!isShareOpen)}
      >
        {buttonTitle}
      </Button>

      {isShareOpen && (
        <ShareModal
          isOpen={isShareOpen}
          onOpenChange={setIsShareOpen}
          title={title || ""}
          url={url}
        />
      )}
    </>
  );
};

export default ShareButton;

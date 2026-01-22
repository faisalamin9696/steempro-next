import { Button, ButtonProps } from "@heroui/button";
import { CircularProgress } from "@heroui/progress";
import { ImageUp } from "lucide-react";
import { useRef } from "react";

interface ImageButtonProps extends ButtonProps {
  onImagesSelected: (files: File[]) => void;
  iconSize?: number;
  progress?: number;
}

const ImageUploadButton = ({
  onImagesSelected,
  iconSize = 18,
  progress,
  ...props
}: ImageButtonProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onImagesSelected(files);
    }
    // Reset input so the same file can be selected again
    e.target.value = "";
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
      {progress ? (
        <CircularProgress
          aria-label="Uploading..."
          color="default"
          showValueLabel={true}
          size="sm"
          value={progress}
          strokeWidth={3}
        />
      ) : (
        <Button
          onPress={handleClick}
          title="Upload Images"
          type="button"
          {...props}
        >
          <ImageUp size={iconSize} />
        </Button>
      )}
    </>
  );
};

export default ImageUploadButton;

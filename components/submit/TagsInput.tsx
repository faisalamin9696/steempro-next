import { useState, KeyboardEvent } from "react";
import { Chip } from "@heroui/chip";
import { Input, InputProps } from "@heroui/input";
import { validateTags } from "@/utils/editor";
import { toast } from "sonner";
import { Copy, Check } from "lucide-react";
import { Button } from "@heroui/button";

interface TagsInputProps extends Omit<InputProps, "onChange"> {
  tags: string[];
  onChange: (tags: string[]) => void;
}

const TagsInput = ({ tags, onChange, ...props }: TagsInputProps) => {
  const [inputValue, setInputValue] = useState("");
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  /* ---------- TAG LOGIC ---------- */

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    } else if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  const addTag = () => {
    const tag = inputValue.trim().toLowerCase();
    const invalid = validateTags([...tags, tag].join(" "));

    if (invalid) {
      toast.info(invalid);
      return;
    }

    if (tag && !tags.includes(tag)) {
      onChange([...tags, ...tag.split(" ")]);
      setInputValue("");
    }
  };

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  /* ---------- DRAG & DROP ---------- */

  const onDragStart = (index: number) => {
    setDragIndex(index);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDrop = (dropIndex: number) => {
    if (dragIndex === null || dragIndex === dropIndex) return;

    const reordered = [...tags];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(dropIndex, 0, moved);

    onChange(reordered);
    setDragIndex(null);
  };

  const handleCopyTags = async () => {
    if (tags.length === 0) return;
    try {
      await navigator.clipboard.writeText(tags.join(" "));
      setIsCopied(true);
      toast.success("Tags copied to clipboard");
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy tags");
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 items-center rounded-lg">
        {tags.map((tag, index) => (
          <Chip
            key={tag}
            draggable
            isCloseable
            variant="flat"
            color="secondary"
            className={`cursor-move transition ${
              dragIndex === index ? "opacity-50 scale-95" : ""
            }`}
            onDragStart={() => onDragStart(index)}
            onDragOver={onDragOver}
            onDrop={() => onDrop(index)}
            onClose={() => removeTag(index)}
            isDisabled={props.isDisabled}
          >
            #{tag}
          </Chip>
        ))}

        <Input
          size="lg"
          value={inputValue}
          onValueChange={setInputValue}
          onKeyDown={handleKeyDown}
          placeholder="Add tags (press Enter or comma)"
          classNames={{ inputWrapper: "border border-border" }}
          className="flex-1 min-w-[200px]"
          autoCapitalize="none"
          {...props}
        />
      </div>

      <div className="flex items-center px-1 gap-2">
        <p className="text-xs text-muted">
          {tags.length}/8 tags • Drag to reorder
        </p>
        {tags.length > 0 && (
          <Button
            isIconOnly
            size="sm"
            variant="light"
            radius="sm"
            onPress={handleCopyTags}
            className="text-muted hover:text-primary min-w-0 h-6 w-6"
            title="Copy all tags"
          >
            {isCopied ? <Check size={14} /> : <Copy size={14} />}
          </Button>
        )}
      </div>
    </div>
  );
};

export default TagsInput;

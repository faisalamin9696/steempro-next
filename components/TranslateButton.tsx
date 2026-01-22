"use client";

import { useState } from "react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { Button, ButtonProps } from "@heroui/button";
import { Spinner } from "@heroui/spinner";
import { Languages } from "lucide-react";
import { POPULAR_LANGUAGES, translateMarkdown } from "@/utils/translate";
import { toast } from "sonner";

interface TranslateButtonProps extends ButtonProps {
  originalText: string;
  onTranslate: (translatedText: string, language: string) => void;
  onReset: () => void;
  isTranslated: boolean;
  currentLanguage?: string;
  size?: "sm" | "md" | "lg";
  variant?: "solid" | "bordered" | "light" | "flat" | "faded" | "shadow";
}

export default function TranslateButton({
  originalText,
  onTranslate,
  onReset,
  isTranslated,
  currentLanguage,
  ...props
}: TranslateButtonProps) {
  const [isTranslating, setIsTranslating] = useState(false);

  const handleTranslate = async (languageCode: string) => {
    if (isTranslating) return;

    setIsTranslating(true);
    try {
      const result = await translateMarkdown(originalText, languageCode);
      onTranslate(result.translatedText, languageCode);
      toast.success("Translation completed");
    } catch (error) {
      console.error("Translation error:", error);
      toast.error("Translation failed. Please try again.");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleReset = () => {
    onReset();
    toast.success("Showing original text");
  };

  if (isTranslated) {
    return (
      <Button
        title="Show original text"
        onPress={handleReset}
        className="text-primary"
        startContent={<Languages size={16} className="text-primary" />}
        isIconOnly
        {...props}
      />
    );
  }

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button
          title="Translate"
          isIconOnly
          startContent={
            isTranslating ? <Spinner size="sm" /> : <Languages size={16} />
          }
          isDisabled={isTranslating}
          {...props}
        />
      </DropdownTrigger>
      <DropdownMenu
        classNames={{ base: "max-h-[200px] overflow-auto" }}
        aria-label="Translation languages"
        onAction={(key) => handleTranslate(key as string)}
      >
        {POPULAR_LANGUAGES.map((lang) => (
          <DropdownItem key={lang.code} textValue={lang.name}>
            <div className="flex items-center gap-2">
              <p>{lang.flag}</p>
              <p>{lang.name}</p>
            </div>
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
}

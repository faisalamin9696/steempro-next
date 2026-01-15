"use client";

import { useState } from "react";
import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  ButtonProps,
} from "@heroui/react";
import { Languages, Loader2 } from "lucide-react";
import { translateText, POPULAR_LANGUAGES } from "@/utils/translate";
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
      const result = await translateText(originalText, languageCode);
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
        startContent={<Languages size={16} />}
        className="text-primary"
        isIconOnly
        {...props}
      />
    );
  }

  return (
    <Dropdown maxHeight={200}>
      <DropdownTrigger>
        <Button
          title="Translate"
          isIconOnly
          startContent={
            isTranslating ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Languages size={16} />
            )
          }
          isDisabled={isTranslating}
          {...props}
        />
      </DropdownTrigger>
      <DropdownMenu
        classNames={{ list: "max-h-[200px] overflow-auto" }}
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

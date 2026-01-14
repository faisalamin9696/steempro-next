"use client";

import { Button, ButtonGroup } from "@heroui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface Props {
  className?: string;
  mode?: "buttons" | "icon";
}

export default function ThemeSwitch({ className, mode = "buttons" }: Props) {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (mode === "icon") {
    const isLight = theme === "light";
    const Icon = isLight ? Sun : Moon;
    return (
      <Button
        isIconOnly
        variant="light"
        size="sm"
        radius="full"
        className={className}
        onPress={() => setTheme(isLight ? "dark" : "light")}
        title={`Switch to ${isLight ? "dark" : "light"} mode`}
      >
        <Icon size={18} className="text-default-500 hover:text-foreground" />
      </Button>
    );
  }

  return (
    <ButtonGroup fullWidth size="sm" className={className}>
      <Button
        color={theme === "light" ? "primary" : "default"}
        onPress={() => setTheme("light")}
        startContent={<Sun size={18} />}
        variant={"flat"}
      >
        Light
      </Button>
      <Button
        color={theme === "dark" ? "primary" : "default"}
        variant={"flat"}
        onPress={() => setTheme("dark")}
        startContent={<Moon size={18} />}
      >
        Dark
      </Button>
    </ButtonGroup>
  );
}

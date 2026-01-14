import { Button } from "@heroui/button";
import { Eye } from "lucide-react";
import { useState } from "react";
import { useAppSelector } from "@/hooks/redux/store";
import { twMerge } from "tailwind-merge";

interface NsfwOverlayProps {
  children: React.ReactNode;
  isNsfw: boolean;
  className?: string;
  placement?: "start" | "center" | "end";
}

const NsfwOverlay = ({
  children,
  isNsfw,
  className,
  placement = "center",
}: NsfwOverlayProps) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const settings = useAppSelector((state) => state.settingsReducer.value);
  const nsfwSetting = settings?.nsfw || "Always warn";

  if (!isNsfw || nsfwSetting === "Always show") {
    return <div className={className}>{children}</div>;
  }

  if (nsfwSetting === "Always hide") {
    return null;
  }

  if (isRevealed) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      className={twMerge(
        "relative overflow-hidden rounded-xl bg-default-50 min-h-26",
        className
      )}
    >
      <div className="filter blur-3xl pointer-events-none select-none opacity-30 scale-105 transition-all duration-700">
        {children}
      </div>
      <div
        className={twMerge(
          "flex flex-col absolute inset-0  z-10 p-4 transition-all duration-300 backdrop-blur-[2px] bg-background/10 dark:bg-black/20 items-center"
        )}
      >
        <div
          className={twMerge(
            "flex gap-4 items-center group/nsfw transition-all duration-300",
            "flex-row text-left bg-content1/80 backdrop-blur-md p-3 rounded-2xl border border-danger/20 shadow-lg"
          )}
        >
          <div
            className={twMerge(
              "bg-danger/20 p-2 rounded-xl border border-danger/30 text-danger shadow-sm group-hover/nsfw:scale-110 transition-transform",
              "p-2 rounded-xl"
            )}
          >
            <Eye size={20} strokeWidth={2.5} />
          </div>

          <div className="flex flex-col gap-0.5">
            <p className="font-bold text-danger text-sm sm:text-base tracking-tight">
              NSFW Content
            </p>
            <p className="text-[10px] sm:text-xs text-default-600 font-medium max-w-[200px] leading-tight">
              This content is hidden based on your settings.
            </p>
          </div>

          <Button
            color="danger"
            variant="shadow"
            size="sm"
            onPress={() => setIsRevealed(true)}
            className="rounded-full h-8 px-5 bg-danger shadow-danger/20 hover:shadow-danger/40 transition-shadow"
          >
            Show
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NsfwOverlay;

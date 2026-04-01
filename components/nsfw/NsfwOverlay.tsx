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
  onAccept?: () => void;
}

const NsfwOverlay = ({
  children,
  isNsfw,
  className,
  placement = "center",
  onAccept,
}: NsfwOverlayProps) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const settings = useAppSelector((state) => state.settingsReducer.value);
  const nsfwSetting = settings?.nsfw || "Always warn";

  const shouldHide = isNsfw && nsfwSetting !== "Always show" && !isRevealed;

  if (nsfwSetting === "Always hide" && isNsfw) {
    return null;
  }

  return (
    <div className={twMerge("relative overflow-hidden", className)}>
      {/* Content wrapper - always mounted to prevent video re-initialization */}
      <div
        className={twMerge(
          "h-full w-full transition-all duration-700",
          shouldHide &&
            "filter blur-3xl pointer-events-none select-none opacity-30 scale-105",
        )}
      >
        {children}
      </div>

      {/* Warning Overlay */}
      {shouldHide && (
        <div
          className={twMerge(
            "flex flex-col absolute inset-0 z-10 p-4 transition-all duration-300 backdrop-blur-[2px] bg-background/10 dark:bg-black/20 items-center justify-center",
          )}
          onClick={(e) => e.stopPropagation()} // Prevent toggling play state when clicking overlay
        >
          <div
            className={twMerge(
              "flex gap-4 items-center group/nsfw transition-all duration-300",
              "flex-row text-left bg-content1/80 backdrop-blur-md p-3 rounded-2xl border border-danger/20 shadow-lg",
            )}
          >
            <div
              className={twMerge(
                "bg-danger/20 p-2 rounded-xl border border-danger/30 text-danger shadow-sm group-hover/nsfw:scale-110 transition-transform",
                "p-2 rounded-xl",
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
              onPress={(e) => {
                // e.stopPropagation(); // Heron UI onPress might not have stopPropagation easily, but we have it on the parent div
                setIsRevealed(true);
                onAccept?.();
              }}
              className="rounded-full h-8 px-5 bg-danger shadow-danger/20 hover:shadow-danger/40 transition-shadow"
            >
              Show
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NsfwOverlay;

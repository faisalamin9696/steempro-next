import Image from "next/image";
import React from "react";
import { twMerge } from "tailwind-merge";

interface BackgroundImageProps {
  src?: string | null;
  alt?: string;
  width?: string | number;
  height?: string | number;
  className?: string;
  children?: React.ReactNode;
  overlay?: boolean;
  overlayClass?: string;
  fetchPriority?: "low" | "high" | "auto";
}

const BackgroundImage: React.FC<BackgroundImageProps> = ({
  src,
  alt = "",
  width = "100%",
  height = "100%",
  className = "",
  children,
  overlay = false,
  overlayClass = "rgba(0, 0, 0, 0.3)",
  fetchPriority = "auto",
}) => {
  const containerStyle = {
    width: typeof width === "number" ? `${width}px` : width,
    height: typeof height === "number" ? `${height}px` : height,
  };

  return (
    <div
      style={containerStyle}
      className={twMerge("relative overflow-hidden", className)}
    >
      {/* Background Image */}
      {src && (
        <Image
          src={src}
          alt={alt}
          fill
          priority={fetchPriority === "high"}
          fetchPriority={fetchPriority}
          sizes="100vw"
          className="object-cover"
        />
      )}

      {/* Optional Overlay */}
      {overlay && (
        <div
          className={twMerge(
            "absolute inset-0 pointer-events-none",
            overlayClass
          )}
        />
      )}

      {/* Foreground content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default BackgroundImage;

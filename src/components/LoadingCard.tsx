import React from "react";

export default function LoadingCard({ text }: { text?: string }) {
  return (
    <div className="flex items-center justify-center m-6 rounded-lg">
      <div
        className={`px-3 py-1 text-xs font-medium 
            leading-none text-center bg-blue-900 text-white
            rounded-full animate-pulse`}
      >
        {text ?? "Loading..."}
      </div>
    </div>
  );
}

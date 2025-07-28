import { Button } from "@heroui/button";
import React from "react";

export default function LoadingMoreCard({ text }: { text?: string }) {
  return (
    <div className="flex items-center justify-center m-6 rounded-lg">
      <Button radius="full" isLoading size="sm">
        {text ?? "Loading"}
      </Button>
    </div>
  );
}

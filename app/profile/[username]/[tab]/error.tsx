"use client";

import ErrorCard from "@/components/ui/ErrorCard";

function error({ error, reset }) {
  return <ErrorCard error={error} reset={reset} />;
}

export default error;

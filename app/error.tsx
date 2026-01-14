"use client";

import ErrorCard from "@/components/ui/ErrorCard";

function Error({ error, reset }) {
  return <ErrorCard error={error} reset={reset} />;
}

export default Error;

import type { Instrumentation } from "next";

export const onRequestError: Instrumentation.onRequestError = (
  error,
  request,
  context
) => {
  // Log full error details server-side (never exposed to the client)
  console.error("[Server Error]", {
    message: (error as Error).message,
    stack: (error as Error).stack,
    url: request.path,
    method: request.method,
    routeType: context.routeType,
    renderSource: context.renderSource,
    revalidateReason: context.revalidateReason,
  });
};

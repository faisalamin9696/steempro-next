import { toast } from "sonner";

export class SteemApiError extends Error {
  constructor(message: string, public data?: any) {
    super(message);
    this.name = "SteemApiError";
  }
}

export async function handleSteemError(
  fn: () => Promise<any>,
  customCatch?: (error: SteemApiError) => void
) {
  try {
    return await fn();
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : JSON.stringify(err) || "Something went wrong";
    const error = new SteemApiError(message, err);

    if (customCatch) {
      // Let user handle it
      customCatch(error);
    } else {
      // Default behavior
      toast.error("Error", { description: message });
      throw error;
    }
  }
}

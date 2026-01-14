export const trackPostView = async (author: string, permlink: string) => {
  try {
    const response = await fetch("/api/track", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ author, permlink }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle specific error codes
      if (response.status === 429) {
        console.log("Rate limited:", data.error);
        return { success: false, error: data.error, rateLimited: true };
      }

      return { success: false, error: data.error || "Failed to track view" };
    }

    return data;
  } catch (error: any) {
    console.error("Failed to track view:", error);
    return {
      success: false,
      error: error.message || "Network error",
    };
  }
};

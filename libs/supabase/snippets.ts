import moment from "moment";
import { supabase } from "./supabase";

export async function getSnippets(username: string) {
  try {
    const { data, error } = await supabase
      .rpc("get_snippets", {
        p_username: username,
      })
      .order("created", { ascending: false });
    if (error) {
      console.error("Get snippets failed:", error);
      throw new Error(error.message);
    }
    return data as Snippet[];
  } catch (e: any) {
    console.error("Unexpected error in getSnippets:", e);
    throw new Error(e.message);
  }
}

export async function addSnippet(
  props: Omit<Snippet, "id" | "created" | "updated">
) {
  try {
    if (!props.username) {
      throw new Error("Username is required");
    }

    const session = await supabase.auth.getUser();
    const { error, count } = await supabase.from("steempro_snippets").insert(
      [
        {
          ...props,
          uid: session.data.user?.id,
          created: moment().toLocaleString(),
        },
      ],
      { count: "exact" }
    );

    if (count === 0) {
      throw new Error("Insert snippet failed");
    }

    if (error) {
      console.error("Insert snippet failed:", error);
      throw new Error(error.message);
    }
    return { success: true };
  } catch (e: any) {
    console.error("Unexpected error in addSnippet:", e);
    throw new Error(e.message);
  }
}

export async function updateSnippet(id: number, props: Partial<Snippet>) {
  try {
    const { error, count } = await supabase
      .from("steempro_snippets")
      .update(
        { ...props, updated: moment().toLocaleString() },
        { count: "estimated" }
      )
      .eq("id", id);

    if (count === 0) {
      throw new Error("Snippet not found");
    }

    if (error) {
      console.error("Update snippet failed:", error);
      throw new Error(error.message);
    }
    return { success: true };
  } catch (e: any) {
    console.error("Unexpected error in updateSnippet:", e);
    throw new Error(e.message);
  }
}

export async function deleteSnippet(id: number) {
  try {
    const { error, count } = await supabase
      .from("steempro_snippets")
      .delete({ count: "estimated" })
      .eq("id", id);

    if (count === 0) {
      throw new Error("Snippet not found or already deleted");
    }

    if (error) {
      console.error("Delete snippet failed:", error);
      throw new Error(error.message);
    }
    return { success: true };
  } catch (e: any) {
    console.error("Unexpected error in deleteSnippet:", e);
    throw new Error(e.message);
  }
}

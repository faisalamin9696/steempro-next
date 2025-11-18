import { supabase } from "./supabase";

type Props = {
  author: string;
  permlink: string;
};

export async function updatePostView(props: Props) {
  const { author, permlink } = props;
  if (!author || !permlink)
    return { success: false, error: "Author and permlink are required" };

  const authPerm = `${author}/${permlink}`;

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    let uid = sessionData?.session?.user?.id;

    // If no user is logged in, sign in anonymously
    if (!uid) {
      const { data: anonData, error: anonError } =
        await supabase.auth.signInAnonymously();

      if (anonError) {
        console.error("Anonymous sign-in failed:", anonError);
        return {
          success: false,
          error: `Anonymous sign-in failed: ${anonError.message}`,
        };
      }

      uid = anonData.user?.id;

      if (!uid) {
        return {
          success: false,
          error: "Failed to get user ID after anonymous sign-in",
        };
      }
    }
    // Insert the view record
    const { error: insertError } = await supabase.from("steempro_views").upsert(
      {
        auth_perm: authPerm,
        uid: uid,
      },
      {
        onConflict: "auth_perm,uid", // Specify the unique constraint columns
        ignoreDuplicates: false, // Set to true if you want to skip duplicates completely
      }
    );

    if (insertError) {
      console.error("Insert view failed:", insertError);
      return { success: false, error: `Insert failed: ${insertError.message}` };
    }
    return { success: true };
  } catch (e) {
    console.error("Unexpected error in updatePostView:", e);
    return { success: false, error: `Unexpected error: ${e}` };
  }
}

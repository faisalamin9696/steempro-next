import { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import moment from "moment";

// export async function signInAnonymously() {
//   try {
//     const { data: sessionData } = await supabase.auth.getSession();
//     if (sessionData?.session?.user?.id) return sessionData.session;
//     const { data, error } = await supabase.auth.signInAnonymously();
//     if (error) {
//       console.error("Anonymous sign-in failed:", error);
//       throw new Error(error.message);
//     }
//     return data;
//   } catch (error: any) {
//     console.error("Anonymous sign-in failed:", error);
//     throw new Error(error.message);
//   }
// }

type AuthResult = {
  success: boolean;
  session?: Session;
  message: string;
  requiresEmailConfirmation?: boolean;
};

export async function authenticateWithEmail(
  email: string,
  password: string
): Promise<AuthResult> {
  try {
    // Validate input
    if (!email || !password) {
      return {
        success: false,
        message: "Email and password are required",
      };
    }

    // Normalize email and create consistent password
    const normalizedEmail = email.trim().toLowerCase();
    const doublePassword = password + password;

    // 1. Try to sign in
    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: doublePassword,
      });

    // 2. If successful login
    if (!signInError && signInData.session) {
      return {
        success: true,
        session: signInData.session,
        message: "Successfully logged in",
      };
    }

    // 3. Check if user doesn't exist
    const isUserNotFound =
      signInError?.message?.includes("Invalid login credentials") ||
      signInError?.message?.includes("User not found") ||
      signInError?.status === 400;

    if (isUserNotFound) {
      // 4. Sign up the user
      const { data: signUpData, error: signUpError } =
        await supabase.auth.signUp({
          email: normalizedEmail,
          password: doublePassword,
          options: {
            data: {
              // Additional user metadata
              created_at: new Date().toISOString(),
            },
          },
        });

      if (signUpError) {
        return {
          success: false,
          message: signUpError.message || "Sign up failed",
        };
      }

      // 5. Check signup result
      if (signUpData.session) {
        // Auto-login after signup
        return {
          success: true,
          session: signUpData.session,
          message: "Account created and logged in successfully",
        };
      } else if (signUpData.user) {
        // Email confirmation required
        return {
          success: false,
          message: "Please check your email to confirm your account",
          requiresEmailConfirmation: true,
        };
      } else {
        return {
          success: false,
          message: "Sign up completed but login failed",
        };
      }
    }

    // 6. Handle other login errors
    return {
      success: false,
      message: signInError?.message || "Authentication failed",
    };
  } catch (error: any) {
    console.error("Authentication error:", error);
    return {
      success: false,
      message: error.message || "An unexpected error occurred",
    };
  }
}

export async function addSchedule(props: Schedule) {
  const {
    username,
    title,
    body,
    tags,
    parent_permlink,
    options,
    time,
    status,
    permlink,
    message,
  } = props;
  if (!title || !body)
    return { success: false, error: "Title and body are required" };
  const session = await supabase.auth.getUser();

  try {
    // Insert the schedule record
    const { error: insertError, count } = await supabase
      .from("steempro_schedules")
      .insert(
        [
          {
            username,
            title,
            body,
            tags,
            parent_permlink,
            options,
            time,
            status,
            permlink,
            message,
            uid: session.data.user?.id,
          },
        ],
        { count: "exact" }
      );

    if (count === 0) {
      throw new Error("Insert schedule failed");
    }

    if (insertError) {
      console.error("Insert schedule failed:", insertError);
      throw new Error(insertError.message);
    }
    return { success: true };
  } catch (e: any) {
    console.error("Unexpected error in addSchedule:", e);
    throw new Error(e.message);
  }
}

export async function getSchedules(username: string) {
  try {
    const { data, error } = await supabase.rpc("get_schedules", {
      p_username: username,
    });
    if (error) {
      console.error("Get schedules failed:", error);
      throw new Error(error.message);
    }
    return data as Schedule[];
  } catch (e: any) {
    console.error("Unexpected error in getSchedules:", e);
    throw new Error(e.message);
  }
}

export async function deleteSchedule(id: number) {
  try {
    const { error, count } = await supabase
      .from("steempro_schedules")
      .delete({ count: "estimated" })
      .eq("id", id);

    // Check if any rows were actually deleted
    if (count === 0) {
      throw new Error("Schedule not found or already deleted");
    }

    if (error) {
      console.error("Delete schedule failed:", error);
      throw new Error(error.message); // ← Return error here
    }
    return { success: true };
  } catch (e: any) {
    console.error("Unexpected error in deleteSchedule:", e);
    throw new Error(e.message); // ← Return error here
  }
}
export async function updateSchedule(id: number, props: Partial<Schedule>) {
  try {
    const { error, count } = await supabase
      .from("steempro_schedules")
      .update(props, { count: "estimated" })
      .eq("id", id);

    if (count === 0) {
      throw new Error("Update schedule failed");
    }

    if (error) {
      console.error("Update schedule failed:", error);
      throw new Error(error.message);
    }
    return { success: true };
  } catch (e: any) {
    console.error("Unexpected error in updateSchedule:", e);
    throw new Error(e.message);
  }
}

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

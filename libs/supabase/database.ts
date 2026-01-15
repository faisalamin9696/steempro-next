import { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";

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




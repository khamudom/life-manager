import { supabase } from "./supabaseClient";

export const signInUser = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Error signing in:", error.message);
    return null;
  }

  console.log("Authenticated User:", data.user);
  return data.user; // Return the authenticated user object
};

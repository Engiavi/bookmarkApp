"use client";

import { supabase } from "@/lib/supabase";

export default function AuthButton({ user }: { user: any }) {
  const login = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
    });
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  if (user) {
    return (
      <button
        onClick={logout}
        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
      >
        Logout
      </button>
    );
  }

  return (
    <button
      onClick={login}
      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
    >
      Sign in with Google
    </button>
  );
}

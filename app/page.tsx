"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import AuthButton from "@/components/AuthButton";
import BookmarkForm from "@/components/BookmarkForm";
import BookmarkList from "@/components/BookmarkList";

export default function Home() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          Realtime Bookmark Manager
        </h1>
        <AuthButton user={user} />
      </div>

      {!user && (
        <div className="bg-white p-6 rounded-xl shadow text-center">
          <p className="text-gray-600">
            Please sign in with Google to manage your bookmarks.
          </p>
        </div>
      )}

      {user && (
        <>
          <BookmarkForm user={user} />
          <BookmarkList user={user} />
        </>
      )}
    </main>
  );
}

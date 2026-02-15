"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import AuthButton from "@/components/AuthButton";
import BookmarkForm from "@/components/BookmarkForm";
import BookmarkList from "@/components/BookmarkList";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const bookmarkListRef = useRef<{ addBookmark: (newBookmark: any) => void }>(null);

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

  const userName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    "User";

  const handleBookmarkAdded = (newBookmark: any) => {
    if (bookmarkListRef.current) {
      bookmarkListRef.current.addBookmark(newBookmark);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">
          Realtime Bookmark Manager
        </h1>
        <AuthButton user={user} />
      </div>

      <h2 className="text-2xl font-bold">
        {userName}, what do you want to bookmark today? 
      </h2>

      {!user && (
        <div className="bg-white p-8 rounded-2xl shadow text-center">
          <p className="text-gray-600 text-lg">
            Please sign in with Google to manage your bookmarks.
          </p>
        </div>
      )}

      {user && (
        <>
          <div className="max-w-2xl">
            <BookmarkForm user={user} onBookmarkAdded={handleBookmarkAdded} />
          </div>

          <BookmarkList ref={bookmarkListRef} user={user} />
        </>
      )}
    </main>
  );
}
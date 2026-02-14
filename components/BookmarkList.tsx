"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function BookmarkList({ user }: { user: any }) {
  const [bookmarks, setBookmarks] = useState<any[]>([]);

  const fetchBookmarks = async () => {
    const { data } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setBookmarks(data || []);
  };

  useEffect(() => {
    fetchBookmarks();

    const channel = supabase
      .channel("realtime-bookmarks")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookmarks",
        },
        () => {
          fetchBookmarks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (bookmarks.length === 0) {
    return (
      <p className="text-center text-gray-500">
        No bookmarks yet. Add one above 👆
      </p>
    );
  }

  return (
    <div className="grid gap-4">
      {bookmarks.map((bookmark) => (
        <div
          key={bookmark.id}
          className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition"
        >
          <h3 className="font-semibold">{bookmark.title}</h3>

          <a
            href={bookmark.url}
            target="_blank"
            className="text-blue-500 text-sm break-all"
          >
            {bookmark.url}
          </a>
        </div>
      ))}
    </div>
  );
}

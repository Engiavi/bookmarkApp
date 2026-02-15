"use client";

import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { supabase } from "@/lib/supabase";

const lightColors = [
  "bg-blue-100",
  "bg-green-100",
  "bg-yellow-100",
  "bg-pink-100",
  "bg-purple-100",
  "bg-indigo-100",
  "bg-orange-100",
];

// Use forwardRef + ref type
const BookmarkList = forwardRef<{ addBookmark: (newBookmark: any) => void }, { user: any }>(({ user }, ref) => {
  const [bookmarks, setBookmarks] = useState<any[]>([]);

  // Expose method to parent via ref
  useImperativeHandle(ref, () => ({
    addBookmark: (newBookmark: any) => {
      setBookmarks((prev) => {
        // Prevent duplicate if realtime arrives later
        if (prev.some((b) => b.id === newBookmark.id)) return prev;
        return [newBookmark, ...prev];
      });
    },
  }));

  // 🔹 Fetch existing bookmarks
  const fetchBookmarks = async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from("bookmark")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error) {
      setBookmarks(data || []);
    }
  };

  // 🔹 Optimistic Delete
  const handleDelete = async (id: string) => {
    // Instant UI update
    setBookmarks((prev) => prev.filter((item) => item.id !== id));

    const { error } = await supabase
      .from("bookmark")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Delete error:", error);
      fetchBookmarks(); // rollback if something fails
    }
  };

  useEffect(() => {
    if (!user?.id) return;

    fetchBookmarks();

    const channel = supabase
      .channel("realtime-bookmarks")

      // 🔹 Realtime INSERT
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "bookmark",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setBookmarks((prev) => {
            const exists = prev.find(
              (item) => item.id === payload.new.id
            );
            if (exists) return prev;
            return [payload.new, ...prev];
          });
        }
      )

      // 🔹 Realtime DELETE
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "bookmark",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setBookmarks((prev) =>
            prev.filter((item) => item.id !== payload.old.id)
          );
        }
      )

      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // 🔹 Fix background tab delay
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchBookmarks();
      }
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );
    };
  }, [user]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  if (!user) return null;

  if (bookmarks.length === 0) {
    return (
      <p className="text-center text-gray-500">
        No bookmarks yet. Add one above 👆
      </p>
    );
  }

  return (
    <div className="flex gap-5 overflow-x-auto pb-4">
      {bookmarks.map((bookmark) => {
        const randomColor =
          lightColors[
            bookmark.id.charCodeAt(0) % lightColors.length
          ];

        return (
          <div
            key={bookmark.id}
            className={`min-w-[260px] ${randomColor} p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300`}
          >
            <h3 className="font-semibold text-lg truncate">
              {bookmark.title.toUpperCase()}
            </h3>

            <a
              href={bookmark.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-sm text-blue-600 break-all mt-2"
            >
              {bookmark.url}
            </a>

            <div className="text-xs text-gray-600 mt-4">
              {formatDate(bookmark.created_at)}
            </div>

            <button
              onClick={() => handleDelete(bookmark.id)}
              className="mt-4 text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg transition"
            >
              Delete
            </button>
          </div>
        );
      })}
    </div>
  );
});

BookmarkList.displayName = "BookmarkList";

export default BookmarkList;
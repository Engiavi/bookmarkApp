"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function BookmarkForm({ user }: { user: any }) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");

  const addBookmark = async () => {
    if (!title.trim() || !url.trim()) return;

    await supabase.from("bookmarks").insert([
      {
        title,
        url,
        user_id: user.id,
      },
    ]);

    setTitle("");
    setUrl("");
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
      <h2 className="text-lg font-semibold">Add New Bookmark</h2>

      <input
        type="text"
        placeholder="Bookmark title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
      />

      <input
        type="url"
        placeholder="https://example.com"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
      />

      <button
        onClick={addBookmark}
        className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg transition"
      >
        Save Bookmark
      </button>
    </div>
  );
}

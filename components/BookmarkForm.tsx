"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function BookmarkForm({ user }: { user: any }) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");

  const [titleError, setTitleError] = useState("");
  const [urlError, setUrlError] = useState("");

  // ✅ Regex patterns
  const titleRegex = /^[A-Za-z\s]+$/;
  const urlRegex =
    /^(https?:\/\/)(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/\S*)?$/;

  const addBookmark = async () => {
    setTitleError("");
    setUrlError("");

    // 🔹 Empty validation
    if (!title.trim() || !url.trim()) {
      alert("All fields are required");
      return;
    }

    // 🔹 Title validation
    if (!titleRegex.test(title)) {
      setTitleError("Title must contain only letters and spaces");
      return;
    }

    // 🔹 URL validation
    if (!urlRegex.test(url)) {
      setUrlError("Enter valid URL (such as https://example.com)");
      return;
    }

    const { data, error } = await supabase
  .from("bookmark")
  .insert([
    {
      title,
      url,
      user_id: user.id,
    },
  ])
  .select()
  .single();


    if (error) {
      console.error("Insert error:", error.message);
      alert(error.message);
      return;
    }

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
      {titleError && (
        <p className="text-red-500 text-sm">{titleError}</p>
      )}

      <input
        type="text"
        placeholder="https://example.com"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
      />
      {urlError && (
        <p className="text-red-500 text-sm">{urlError}</p>
      )}

      <button
        onClick={addBookmark}
        className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg transition"
      >
        Save Bookmark
      </button>
    </div>
  );
}

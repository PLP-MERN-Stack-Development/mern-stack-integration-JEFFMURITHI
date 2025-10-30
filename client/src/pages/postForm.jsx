import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePosts } from "@/context/PostsContext";

export default function PostForm() {
  const { createPost, loading, error } = usePosts();
  const [form, setForm] = useState({ title: "", content: "" });
  const [formError, setFormError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (!form.title.trim()) return "Title is required";
    if (form.title.trim().length < 3)
      return "Title must be at least 3 characters";
    if (!form.content.trim()) return "Content is required";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errMsg = validate();
    if (errMsg) return setFormError(errMsg);

    try {
      await createPost(form);
      navigate("/");
    } catch (err) {
      setFormError(err.message);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Create New Post</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <input
          name="title"
          type="text"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
          className="border rounded w-full p-2"
        />
        <textarea
          name="content"
          placeholder="Content"
          value={form.content}
          onChange={handleChange}
          className="border rounded w-full p-2 h-32"
        />
        {formError && <p className="text-red-500">{formError}</p>}
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Post"}
        </button>
        {error && <p className="text-red-500">{error}</p>}
      </form>
    </div>
  );
}

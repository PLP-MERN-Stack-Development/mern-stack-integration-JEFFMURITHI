import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useUser, useAuth } from "@clerk/clerk-react";
import api from "@/lib/axios";

export default function PostForm({ existingPost }) {
  const { user, isSignedIn } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(
    existingPost || {
      title: "",
      content: "",
      author: "",
      slug: "",
      category: "",
      image: "",
    }
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState("");

  // 🧩 Auto-generate slug
  useEffect(() => {
    if (!existingPost && formData.title) {
      const slug = formData.title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setFormData((prev) => ({ ...prev, slug }));
    }
  }, [formData.title, existingPost]);

  // 🧩 Fill author automatically
  useEffect(() => {
    if (isSignedIn && user) {
      setFormData((prev) => ({
        ...prev,
        author: user.fullName || "Anonymous",
      }));
    }
  }, [isSignedIn, user]);

  // 🧩 Handle input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 🧩 Handle image preview
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      setFormData((prev) => ({ ...prev, image: file }));
    } else {
      setPreview("");
      setFormData((prev) => ({ ...prev, image: "" }));
    }
  };

  // 🧩 Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!isSignedIn) {
      setError("You must be signed in to create or edit a post.");
      setLoading(false);
      return;
    }

    if (!formData.title.trim() || !formData.content.trim()) {
      setError("Please fill in all required fields (title and content).");
      setLoading(false);
      return;
    }

    try {
      const token = await getToken?.();
      const headers = {
        ...(token && { Authorization: `Bearer ${token}` }),
        "Content-Type": "multipart/form-data", // ✅ Important for uploads
      };

      const postData = new FormData();
      postData.append("title", formData.title.trim());
      postData.append("content", formData.content.trim());
      postData.append("category", formData.category || "General");
      postData.append("author", formData.author || "Anonymous");
      postData.append("slug", formData.slug);
      if (formData.image && formData.image instanceof File) {
        postData.append("featuredImage", formData.image);
      }

      const response = existingPost
        ? await api.put(`/posts/${existingPost._id}`, postData, { headers })
        : await api.post("/posts", postData, { headers });

      if (response?.data?.success) {
        navigate("/");
      } else {
        setError(response?.data?.error || "Something went wrong.");
      }
    } catch (err) {
      console.error("❌ API Error:", err.response?.data ?? err.message ?? err);
      const msg =
        err.response?.data?.error ||
        (err.code === "ECONNABORTED"
          ? `Request timed out (${err.message})`
          : err.message) ||
        "Server error. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      encType="multipart/form-data"
      className="max-w-xl mx-auto bg-white dark:bg-gray-900 shadow-md rounded-2xl p-6 space-y-4"
    >
      <h2 className="text-xl font-semibold text-center text-gray-800 dark:text-gray-100">
        {existingPost ? "Edit Post" : "Create a New Post"}
      </h2>

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}

      {/* Title */}
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
          Title
        </label>
        <Input
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Enter post title"
          required
        />
      </div>

      {/* Content */}
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
          Content
        </label>
        <Textarea
          name="content"
          value={formData.content}
          onChange={handleChange}
          placeholder="Write your post content here..."
          rows={6}
          required
        />
      </div>

      {/* Author */}
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
          Author
        </label>
        <Input
          name="author"
          value={formData.author}
          readOnly
          className="bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
        />
      </div>

      {/* Slug */}
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
          Slug
        </label>
        <Input
          name="slug"
          value={formData.slug}
          readOnly
          className="bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
          Category
        </label>
        <Input
          name="category"
          value={formData.category}
          onChange={handleChange}
          placeholder="Enter category"
        />
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
          Featured Image (optional)
        </label>
        <Input type="file" name="image" accept="image/*" onChange={handleImageChange} />
        {preview ? (
          <img
            src={preview}
            alt="Preview"
            className="mt-2 rounded-lg max-h-40 object-cover border"
          />
        ) : typeof formData.image === "string" && formData.image.trim() ? (
          <img
            src={formData.image}
            alt="Existing"
            className="mt-2 rounded-lg max-h-40 object-cover border"
          />
        ) : null}
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading
          ? "Saving..."
          : existingPost
          ? "Update Post"
          : "Create Post"}
      </Button>
    </form>
  );
}

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const EditPost = () => {
  const { id } = useParams(); // Post ID from URL
  const navigate = useNavigate();

  const [postData, setPostData] = useState({
    title: "",
    content: "",
    category: "",
    featuredImage: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Fetch existing post data
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axios.get(`/api/posts/${id}`);
        setPostData({
          title: res.data.data.title,
          content: res.data.data.content,
          category: res.data.data.category?._id || "",
          featuredImage: res.data.data.featuredImage || "",
        });
      } catch (err) {
        console.error("❌ Failed to fetch post:", err);
        setError("Failed to load post for editing");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPostData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      await axios.put(`/api/posts/${id}`, postData);
      alert("✅ Post updated successfully!");
      navigate(`/posts/${id}`);
    } catch (err) {
      console.error("❌ Error updating post:", err);
      setError("Failed to update post. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-center text-gray-500 mt-6">Loading post...</p>;
  }

  if (error) {
    return <p className="text-center text-red-600 mt-6">{error}</p>;
  }

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <Card className="shadow-lg rounded-2xl">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-4 text-blue-600">✏️ Edit Post</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-medium text-gray-700 mb-1">Title</label>
              <Input
                type="text"
                name="title"
                value={postData.title}
                onChange={handleChange}
                required
                placeholder="Enter post title"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">Content</label>
              <Textarea
                name="content"
                value={postData.content}
                onChange={handleChange}
                required
                rows={6}
                placeholder="Write post content..."
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">Category (optional)</label>
              <Input
                type="text"
                name="category"
                value={postData.category}
                onChange={handleChange}
                placeholder="Enter category ID or leave blank"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">Featured Image (URL)</label>
              <Input
                type="text"
                name="featuredImage"
                value={postData.featuredImage}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="flex justify-between mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/posts/${id}`)}
              >
                ← Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {saving ? "Saving..." : "Update Post"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditPost;

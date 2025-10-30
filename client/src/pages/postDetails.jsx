import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const PostDetails = () => {
  const { id } = useParams(); // get post id from URL
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axios.get(`/api/posts/${id}`);
        setPost(res.data.data);
      } catch (err) {
        setError("Failed to load post details");
        console.error("❌ Error fetching post:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  if (loading) {
    return <p className="text-center text-gray-600 mt-6">Loading post...</p>;
  }

  if (error) {
    return <p className="text-center text-red-600 mt-6">{error}</p>;
  }

  if (!post) {
    return <p className="text-center text-gray-600 mt-6">Post not found.</p>;
  }

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <Card className="shadow-lg rounded-2xl">
        <CardContent className="p-6">
          {post.featuredImage && (
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full h-72 object-cover rounded-xl mb-4"
            />
          )}
          <h1 className="text-3xl font-bold text-blue-600 mb-3">{post.title}</h1>
          <p className="text-gray-500 text-sm mb-4">
            By {post.author || "Unknown"} •{" "}
            {post.category?.name ? `Category: ${post.category.name}` : "No category"}
          </p>
          <p className="text-gray-800 leading-relaxed">{post.content}</p>
          <div className="mt-6">
            <Link to="/">
              <Button variant="outline" className="rounded-xl">
                ← Back to Posts
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PostDetails;

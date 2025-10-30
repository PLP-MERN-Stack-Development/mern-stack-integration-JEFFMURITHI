// src/pages/PostList.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useApi } from "@/hooks/useApi";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PostList() {
  const { get, del, loading, error } = useApi();
  const [posts, setPosts] = useState([]);

  // ✅ Fetch posts from API
  const fetchPosts = useCallback(async () => {
    try {
      const response = await get("/posts");
      console.log("📦 API Response:", response);

      // ✅ Ensure we always store an array in state
      if (Array.isArray(response)) {
        setPosts(response);
      } else if (Array.isArray(response.data)) {
        setPosts(response.data);
      } else if (Array.isArray(response.posts)) {
        setPosts(response.posts);
      } else {
        console.error("Unexpected API response:", response);
        setPosts([]);
      }
    } catch (err) {
      console.error("❌ Failed to fetch posts:", err);
      setPosts([]);
    }
  }, [get]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // ✅ Handle delete with optimistic UI update
  const handleDelete = async (id) => {
    const previousPosts = [...posts];
    setPosts((prev) => prev.filter((post) => post._id !== id));

    try {
      await del(`/posts/${id}`);
      console.log(`🗑️ Deleted post ${id}`);
    } catch (err) {
      console.error("❌ Delete failed:", err);
      setPosts(previousPosts);
    }
  };

  // ✅ Loading state
  if (loading)
    return (
      <p className="text-center text-gray-500 mt-10 animate-pulse">
        Loading posts...
      </p>
    );

  // ✅ Error state
  if (error)
    return (
      <p className="text-center text-red-500 mt-10">
        ⚠️ {error}
      </p>
    );

  // ✅ UI rendering
  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Blog Posts</h2>
        <Link to="/posts/create">
          <Button>Create New Post</Button>
        </Link>
      </div>

      {posts.length === 0 ? (
        <p className="text-center text-gray-500 mt-10">
          No posts available. Try creating one!
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Card
              key={post._id}
              className="hover:shadow-xl transition-transform transform hover:scale-[1.02]"
            >
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg line-clamp-1">
                  {post.title}
                </h3>
                <p className="text-gray-600 line-clamp-3 mt-1">
                  {post.content}
                </p>

                <div className="flex justify-between items-center mt-4">
                  <Link to={`/posts/${post._id}`}>
                    <Button size="sm" variant="default">
                      View
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(post._id)}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

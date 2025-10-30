import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ClerkProvider } from '@clerk/clerk-react';
import App from "./App";
import "./index.css";
import { PostsProvider } from "@/context/PostsContext";
import { usePosts } from "@/context/PostsContext";
import api from "@/lib/axios";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <BrowserRouter>
        <PostsProvider>
          <App />
        </PostsProvider>
      </BrowserRouter>
    </ClerkProvider>
  </React.StrictMode>
);

export default function PostList() {
  const { posts, loading, error } = usePosts();

  if (loading) {
    return <div className="text-center p-4">Loading posts...</div>;
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 text-center">
        <p>Error loading posts:</p>
        <p>{error}</p>
      </div>
    );
  }

  if (!posts?.length) {
    return <div className="text-center p-4">No posts found</div>;
  }

  return (
    <div>
      {posts.map(post => (
        <div key={post.id}>
          <h3>{post.title}</h3>
          <p>{post.content}</p>
        </div>
      ))}
    </div>
  );
}
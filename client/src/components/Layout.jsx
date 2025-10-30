// src/components/Layout.jsx
import React from "react";
import { Link, Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-blue-600 text-white px-6 py-3 flex justify-between items-center shadow-md">
        <Link to="/" className="text-lg font-semibold">
          📰 My Blog
        </Link>
        <div className="space-x-3">
          <Link to="/">
            <Button variant="secondary" size="sm">Posts</Button>
          </Link>
          <Link to="/create">
            <Button size="sm" className="bg-green-600 hover:bg-green-700">+ New Post</Button>
          </Link>
        </div>
      </nav>

      <main className="p-6">
        <Outlet /> {/* renders child routes */}
      </main>
    </div>
  );
}

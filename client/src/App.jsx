// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import Layout from "@/components/Layout";
import PostList from "@/pages/PostList";
import PostDetails from "@/pages/PostDetails";
import PostForm from "@/components/PostForm";
import EditPost from "@/pages/EditPost";
import { SignIn, SignUp } from "@clerk/clerk-react";

// ✅ Replace this with your actual Clerk Publishable Key from the Clerk dashboard
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

export default function App() {
  if (!clerkPubKey) {
    console.error("❌ Missing Clerk Publishable Key. Set VITE_CLERK_PUBLISHABLE_KEY in your .env file.");
    return <p className="text-center text-red-600 mt-20">Missing Clerk key</p>;
  }

  return (
    
      
        <Routes>
          {/* Public routes */}
          <Route element={<Layout />}>
            <Route path="/" element={<PostList />} />
            <Route path="/posts/:id" element={<PostDetails />} />
          </Route>

          {/* Clerk authentication routes */}
          <Route path="/sign-in/*" element={<SignIn routing="path" path="/sign-in" />} />
          <Route path="/sign-up/*" element={<SignUp routing="path" path="/sign-up" />} />

          {/* Protected routes (Require login) */}
          <Route
            element={
              <SignedIn>
                <Layout />
              </SignedIn>
            }
          >
            <Route path="/create" element={<PostForm />} />
            <Route path="/posts/edit/:id" element={<EditPost />} />
          </Route>

          {/* Redirect unauthenticated users */}
          <Route
            path="/protected/*"
            element={
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      
    
  );
}

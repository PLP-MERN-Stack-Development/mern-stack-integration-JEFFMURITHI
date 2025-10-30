import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, useParams } from "react-router-dom";
import App from "./App";
import "./index.css";
import { PostsProvider } from "@/context/PostsContext";
import { ClerkProvider } from '@clerk/clerk-react'
import axios from 'axios';
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

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
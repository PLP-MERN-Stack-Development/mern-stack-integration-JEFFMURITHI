import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/axios';
import { useAuth } from '@clerk/clerk-react';

const PostsContext = createContext();
export const usePosts = () => useContext(PostsContext);

export function PostsProvider({ children }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { getToken } = useAuth(); // getToken provided by Clerk

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Optionally attach Clerk token if available (server must validate if required)
      let headers = {};
      try {
        const token = await getToken?.();
        if (token) headers.Authorization = `Bearer ${token}`;
      } catch (e) {
        // no token or user not signed in — proceed as anonymous
      }

      const resp = await api.get('/posts', { headers });
      if (resp?.data?.success) {
        setPosts(resp.data.data || []);
      } else {
        const msg = resp?.data?.error || 'Unexpected API response';
        throw new Error(msg);
      }
    } catch (err) {
      // err may be AxiosError
      console.error('❌ Error fetching posts:', err);
      const message =
        err?.response?.data?.error ||
        (err?.code === 'ERR_NETWORK' ? 'Network error: cannot reach API' :
        err?.message || 'Failed to fetch posts');
      setError(message);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PostsContext.Provider value={{ posts, loading, error, fetchPosts }}>
      {children}
    </PostsContext.Provider>
  );
}

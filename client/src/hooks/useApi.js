// src/hooks/useApi.js
import { useState, useCallback } from "react";
import axios from "axios";

/**
 * Custom hook to handle API requests with Axios.
 * Features:
 * - Handles loading and error states
 * - Supports optimistic UI updates
 * - Handles retries
 * - Automatically applies base URL from environment variables
 */
export function useApi(baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api") {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Generic request function
   */
  const request = useCallback(
    async (method, endpoint, data = null, options = {}) => {
      const { optimisticUpdate, onRollback, retries = 1 } = options;
      setLoading(true);
      setError(null);

      let attempts = 0;

      while (attempts < retries) {
        try {
          const response = await axios({
            method,
            url: `${baseUrl}${endpoint}`,
            data,
            headers: { "Content-Type": "application/json" },
          });

          // Perform optimistic UI update if provided
          if (optimisticUpdate) optimisticUpdate(response.data);

          return response.data;
        } catch (err) {
          attempts++;
          console.error(`❌ API ${method.toUpperCase()} ${endpoint} failed:`, err);

          if (attempts >= retries) {
            const message =
              err.response?.data?.message ||
              err.message ||
              "An unexpected error occurred!";
            setError(message);

            // Rollback optimistic update if provided
            if (onRollback) onRollback();
            throw err;
          }
        } finally {
          setLoading(false);
        }
      }
    },
    [baseUrl]
  );

  // Helper methods for convenience
  const get = useCallback((endpoint, options) => request("get", endpoint, null, options), [request]);
  const post = useCallback((endpoint, data, options) => request("post", endpoint, data, options), [request]);
  const put = useCallback((endpoint, data, options) => request("put", endpoint, data, options), [request]);
  const del = useCallback((endpoint, options) => request("delete", endpoint, null, options), [request]);

  return { get, post, put, del, loading, error };
}

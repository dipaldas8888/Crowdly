import axios from "axios";

const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // Default: if running on localhost and no env set, try local backend, otherwise fallback to deployed Render backend
  if (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) {
    return "https://crowdly-2lol.onrender.com/api"; // Default to Render or http://localhost:5000/api
  }
  return "https://crowdly-2lol.onrender.com/api";
};

const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export async function apiRequest(path, options = {}) {
  const { method = "GET", body, headers = {} } = options;

  try {
    const isFormData = body instanceof FormData;

    const response = await api.request({
      url: path,
      method,
      data: body,
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...headers,
      },
    });

    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message || error.message || "Something went wrong";

    throw new Error(message);
  }
}

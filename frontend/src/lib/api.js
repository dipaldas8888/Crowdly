import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export async function apiRequest(path, options = {}) {
  const { method = "GET", body, headers } = options;

  try {
    const response = await api.request({
      url: path,
      method,
      data: body,
      headers,
    });

    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || "Request failed",
    );
  }
}

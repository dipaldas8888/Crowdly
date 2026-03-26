import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

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

import axios from "axios";
import BASE_URL from "../api";

// ✅ Create axios instance
const instance = axios.create({
  baseURL: BASE_URL,
});

// ✅ Attach token automatically
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default instance;
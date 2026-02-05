import axios from "axios";

const API = axios.create({
  baseURL: "https://college-scraper-backend.onrender.com/api",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.clear();
      window.location.replace("/");
    }
    return Promise.reject(err);
  }
);

export default API;

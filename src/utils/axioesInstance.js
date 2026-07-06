import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "gp-name": import.meta.env.VITE_GP_NAME,
  },
});

// Request interceptor to attach userToken as Bearer Auth header
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("userToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ── Auto-refresh interceptor ──────────────────────
// If a request fails with 401 (access token expired),
// try to refresh the token and retry the original request ONCE.
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isCitizenRequest = originalRequest.url.includes("/user/") || 
                             originalRequest.url.includes("/auth/otp/") || 
                             originalRequest.url.includes("/taxes/");

    // Handle VMS Citizen Portal 401s
    if (
      error.response?.status === 401 &&
      isCitizenRequest &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/otp/request") &&
      !originalRequest.url.includes("/auth/otp/verify") &&
      !originalRequest.url.includes("/auth/otp/refresh")
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => axiosInstance(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axiosInstance.post("/auth/otp/refresh");
        if (data.token) {
          localStorage.setItem("userToken", data.token);
        }
        processQueue(null);
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        localStorage.removeItem("userToken");
        window.location.href = "/user-login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle Admin Portal 451s / 401s
    if (
      error.response?.status === 401 &&
      !isCitizenRequest &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/login") &&
      !originalRequest.url.includes("/refresh")
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => axiosInstance(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axiosInstance.post("/admin/refresh");
        processQueue(null);
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;


import axios from "axios";

// Alamat API dibaca dari environment Vite.
// Development menggunakan fallback Laravel lokal.
// Production menggunakan VITE_API_BASE_URL dari .env.production.

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000/api"
).replace(/\/+$/, "");

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// Mengirim token autentikasi secara otomatis.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Biarkan Axios menentukan Content-Type dan boundary untuk FormData.
    if (
      typeof FormData !== "undefined" &&
      config.data instanceof FormData
    ) {
      if (config.headers) {
        delete config.headers["Content-Type"];
        delete config.headers["content-type"];
      }
    }

    return config;
  },
  (error) => {
    console.error("[API REQUEST ERROR]", error);
    return Promise.reject(error);
  }
);

// Menangani error autentikasi dan error API.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || "";
    const normalizedUrl = url.replace(/^\/+/, "").split("?")[0];

    console.error("[API ERROR]", {
      url,
      method: error.config?.method,
      status: status ?? "Tidak ada respons",
      message:
        error.response?.data?.message ??
        error.message ??
        "Terjadi kesalahan pada request API.",
      data: error.response?.data,
    });

    // Jangan menghapus token ketika login gagal.
    // Untuk endpoint lain, 401 berarti autentikasi tidak valid.
    if (status === 401 && normalizedUrl !== "login") {
      console.warn(
        "[AUTH] API mengembalikan 401. Pengguna diarahkan ke login."
      );

      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      window.location.href = "/";
    }

    return Promise.reject(error);
  }
);

export default api;

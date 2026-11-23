
import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Asset
import logoPengadilan from "../../assets/logo-pn-palangka-raya.png";
import loginIllustration from "../../assets/login-illustration.png";

// API
import api from "../../services/api";

// =========================
// ICON EYE
// =========================

function IconEye(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M2 12s3.8-7 10-7 10 7 10 7-3.8 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconEyeOff(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3 3l18 18" />
      <path d="M10.6 5.2A10.9 10.9 0 0 1 12 5c6.2 0 10 7 10 7a17.7 17.7 0 0 1-3.5 4.2" />
      <path d="M6.6 6.6C4 8.3 2 12 2 12s3.8 7 10 7a10.4 10.4 0 0 0 4.4-.95" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </svg>
  );
}

// =========================
// LOGIN PAGE
// =========================

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrorMessage("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      setErrorMessage("Email dan password wajib diisi.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/login", {
        email: normalizedEmail,
        password,
      });

      const { token, user } = response.data.data;

      if (!token || !user) {
        throw new Error("Respons login dari server tidak lengkap.");
      }

      localStorage.setItem("auth_token", token);
      localStorage.setItem("auth_user", JSON.stringify(user));

      navigate("/dashboard");
    } catch (error) {
      if (error.response?.status === 422) {
        setErrorMessage(
          error.response?.data?.message ||
            "Email dan password wajib diisi dengan benar."
        );
      } else if (error.response?.status === 401) {
        setErrorMessage(
          error.response?.data?.message ||
            "Email atau password salah."
        );
      } else {
        setErrorMessage(
          error.message === "Respons login dari server tidak lengkap."
            ? error.message
            : "Tidak dapat terhubung ke server. Pastikan backend Laravel sedang berjalan."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden font-[Poppins]">

      {/* =========================
          BACKGROUND
      ========================= */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${loginIllustration})`,
        }}
      />

      {/* Background Overlay */}
      <div className="absolute inset-0 bg-white/70" />

      {/* =========================
          MAIN CONTENT
      ========================= */}
      <div className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center px-4 py-8 sm:px-6">

        {/* LOGO */}
        <img
          src={logoPengadilan}
          alt="Logo Pengadilan Negeri Palangka Raya"
          className="mb-4 h-20 w-20 object-contain sm:mb-5 sm:h-24 sm:w-24"
        />

        {/* SYSTEM TITLE */}
        <h1 className="text-center text-xl font-bold text-[#171a35] sm:text-2xl md:text-[1.75rem]">
          Sistem Informasi Izin Keluar Kantor
        </h1>

        {/* Subtitle */}
        <p className="mt-2 text-center text-sm text-[#5a5f72]">
          Pengelolaan izin keluar kantor secara digital
        </p>

        {/* LOGIN CARD */}
        <div
          className="
            mt-8
            w-full
            rounded-2xl
            border
            border-[#e5e7ef]
            bg-white
            shadow-[0_12px_40px_-12px_rgba(43,48,139,0.20)]
          "
          style={{
            maxWidth: "530px",
            padding: "42px 32px 40px",
          }}
        >

          {/* CARD TITLE */}
          <h2 className="text-center text-xl font-semibold text-[#414646] sm:text-2xl">
            Masuk ke Akun Anda
          </h2>

          {/* ERROR MESSAGE */}
          {errorMessage && (
            <div
              className="
                mx-auto
                mt-7
                w-full
                rounded-xl
                border
                border-red-200
                bg-red-50
                px-4
                py-3
                text-center
                text-sm
                text-red-600
              "
              style={{
                maxWidth: "400px",
              }}
            >
              {errorMessage}
            </div>
          )}

          {/* FORM AREA */}
          <div
            className="mt-9"
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <form
              onSubmit={handleSubmit}
              noValidate
              style={{
                width: "100%",
                maxWidth: "400px",
              }}
            >

              {/* EMAIL */}
              <div>
                <label
                  htmlFor="email"
                  className="
                    mb-2.5
                    block
                    text-sm
                    font-medium
                    text-[#1a1a2e]
                  "
                >
                  Email
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  placeholder="Masukkan email kantor Anda"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="
                    block
                    h-14
                    w-full
                    rounded-xl
                    border
                    border-[#c5c9db]
                    bg-[#f0f3fa]
                    px-5
                    text-[15px]
                    text-[#1a1a2e]
                    outline-none
                    transition
                    focus:border-[#5A81FA]
                    focus:bg-white
                    focus:ring-2
                    focus:ring-[#5A81FA]/20
                    disabled:bg-gray-100
                  "
                />
              </div>

              {/* PASSWORD */}
              <div className="mt-8">
                <label
                  htmlFor="password"
                  className="
                    mb-2.5
                    block
                    text-sm
                    font-medium
                    text-[#1a1a2e]
                  "
                >
                  Password
                </label>

                <div className="relative w-full">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Masukkan password Anda"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="
                      block
                      h-14
                      w-full
                      rounded-xl
                      border
                      border-[#c5c9db]
                      bg-[#f0f3fa]
                      pl-5
                      pr-12
                      text-[15px]
                      text-[#1a1a2e]
                      outline-none
                      transition
                      focus:border-[#5A81FA]
                      focus:bg-white
                      focus:ring-2
                      focus:ring-[#5A81FA]/20
                      disabled:bg-gray-100
                    "
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    disabled={loading}
                    aria-label={
                      showPassword
                        ? "Sembunyikan password"
                        : "Tampilkan password"
                    }
                    className="
                      absolute
                      right-4
                      top-1/2
                      -translate-y-1/2
                      text-[#8b90a5]
                      transition
                      hover:text-[#5a5f72]
                    "
                  >
                    {showPassword ? (
                      <IconEyeOff className="h-5 w-5" />
                    ) : (
                      <IconEye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* LOGIN BUTTON */}
              <div
                className="flex w-full justify-center"
                style={{
                  marginTop: "32px",
                }}
              >
                <button
                  type="submit"
                  disabled={loading}
                  className="
                    h-14
                    rounded-xl
                    bg-gradient-to-r
                    from-[#4a6cf7]
                    to-[#3b5bdb]
                    text-[15px]
                    font-semibold
                    text-white
                    shadow-sm
                    transition
                    hover:from-[#3b5bdb]
                    hover:to-[#2f4bc4]
                    focus:outline-none
                    focus:ring-2
                    focus:ring-[#5A81FA]/40
                    focus:ring-offset-2
                    active:scale-[0.98]
                    disabled:cursor-not-allowed
                    disabled:opacity-70
                  "
                  style={{
                    width: "290px",
                    maxWidth: "100%",
                  }}
                >
                  {loading ? "Sedang masuk..." : "Masuk"}
                </button>
              </div>

            </form>
          </div>
        </div>

        {/* DEVELOPER ATTRIBUTION */}
        <footer
          className="mt-6 w-full text-center"
          aria-label="Informasi pengembang sistem"
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#78839A]">
            Dikembangkan oleh
          </p>

          <p className="mt-1 text-xs font-semibold text-[#4B5872] sm:text-[13px]">
            Tasya Apriliani <span className="font-normal text-[#9AA3B3]">&amp;</span> Jovanka Feranita
          </p>

          <p className="mt-1 text-[10px] text-[#7C879C] sm:text-[11px]">
            Program Studi Teknik Informatika · Universitas Palangka Raya
          </p>

          <p className="mt-1 text-[10px] text-[#9AA3B3]">
            2026
          </p>
        </footer>

      </div>
    </div>
  );
}

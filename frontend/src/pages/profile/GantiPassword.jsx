import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function GantiPassword() {
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setErrorMessage("");

    if (!currentPassword || !password || !passwordConfirmation) {
      setErrorMessage("Semua password wajib diisi.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password baru minimal 8 karakter.");
      return;
    }

    if (password !== passwordConfirmation) {
      setErrorMessage("Konfirmasi password tidak sama.");
      return;
    }

    try {
      setSaving(true);

      const token = localStorage.getItem("auth_token");

      const response = await api.put(
        "/profile/password",
        {
          current_password: currentPassword,
          password,
          password_confirmation: passwordConfirmation,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      setMessage(
        response.data?.message || "Password berhasil diperbarui."
      );

      setCurrentPassword("");
      setPassword("");
      setPasswordConfirmation("");
    } catch (error) {
      console.error("Gagal mengganti password:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
        navigate("/");
        return;
      }

      if (error.response?.status === 422) {
        setErrorMessage(
          error.response?.data?.message ||
            "Data password tidak valid."
        );
        return;
      }

      setErrorMessage("Gagal mengganti password.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FD] font-[Poppins] px-5 sm:px-8 lg:px-10 py-8">
      <div className="max-w-2xl mx-auto">

        <div className="mb-8">
          <button
            type="button"
            onClick={() => navigate("/profil")}
            className="mb-4 text-sm font-medium text-[#5A81FA] hover:text-[#2B308B]"
          >
            ← Kembali ke Profil
          </button>

          <h1 className="text-2xl sm:text-3xl font-bold text-[#1F1F1F]">
            Ganti Password
          </h1>

          <p className="mt-1 text-sm text-[#696E82]">
            Perbarui password akun Anda secara berkala.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#EDEFF8] shadow-[0_1px_3px_rgba(31,31,31,0.04)] p-6 sm:p-8">

          {message && (
            <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {message}
            </div>
          )}

          {errorMessage && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label
                htmlFor="currentPassword"
                className="block text-sm font-medium text-[#1F1F1F] mb-2"
              >
                Password Saat Ini
              </label>

              <div className="relative">
                <input
                  id="currentPassword"
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) =>
                    setCurrentPassword(e.target.value)
                  }
                  placeholder="Masukkan password saat ini"
                  disabled={saving}
                  className="w-full rounded-xl border border-[#A8B1CE] bg-white px-4 py-3 pr-12 text-sm text-[#1F1F1F] outline-none focus:border-[#5A81FA] focus:ring-2 focus:ring-[#5A81FA]/25 disabled:bg-[#F8F9FD]"
                />

                <button
                  type="button"
                  onClick={() => setShowCurrent((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-[#5A81FA]"
                >
                  {showCurrent ? "Sembunyikan" : "Lihat"}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[#1F1F1F] mb-2"
              >
                Password Baru
              </label>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 8 karakter"
                  disabled={saving}
                  className="w-full rounded-xl border border-[#A8B1CE] bg-white px-4 py-3 pr-12 text-sm text-[#1F1F1F] outline-none focus:border-[#5A81FA] focus:ring-2 focus:ring-[#5A81FA]/25 disabled:bg-[#F8F9FD]"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-[#5A81FA]"
                >
                  {showPassword ? "Sembunyikan" : "Lihat"}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="passwordConfirmation"
                className="block text-sm font-medium text-[#1F1F1F] mb-2"
              >
                Konfirmasi Password Baru
              </label>

              <div className="relative">
                <input
                  id="passwordConfirmation"
                  type={showConfirmation ? "text" : "password"}
                  value={passwordConfirmation}
                  onChange={(e) =>
                    setPasswordConfirmation(e.target.value)
                  }
                  placeholder="Ulangi password baru"
                  disabled={saving}
                  className="w-full rounded-xl border border-[#A8B1CE] bg-white px-4 py-3 pr-12 text-sm text-[#1F1F1F] outline-none focus:border-[#5A81FA] focus:ring-2 focus:ring-[#5A81FA]/25 disabled:bg-[#F8F9FD]"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmation((prev) => !prev)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-[#5A81FA]"
                >
                  {showConfirmation ? "Sembunyikan" : "Lihat"}
                </button>
              </div>
            </div>

            <div className="pt-3 flex flex-col sm:flex-row gap-3 sm:justify-end">
              <button
                type="button"
                onClick={() => navigate("/profil")}
                disabled={saving}
                className="rounded-xl border border-[#CEDEFF] px-6 py-3 text-sm font-semibold text-[#2B308B] hover:bg-[#F2F4FF] transition disabled:opacity-50"
              >
                Batal
              </button>

              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-[#5A81FA] px-6 py-3 text-sm font-semibold text-white hover:bg-[#2B308B] transition disabled:opacity-60"
              >
                {saving ? "Menyimpan..." : "Simpan Password"}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
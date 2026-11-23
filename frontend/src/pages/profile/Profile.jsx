import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [saving, setSaving] = useState(false);

  // ======================================================
  // GET PROFILE
  // ======================================================

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("auth_token");

      if (!token) {
        navigate("/");
        return;
      }

      try {
        const response = await api.get("/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        const currentUser = response.data.data.user;

        setUser(currentUser);
        setName(currentUser.name || "");
        setUsername(currentUser.username || "");
        setEmail(currentUser.email || "");
      } catch (error) {
        console.error("Gagal mengambil profile:", error);

        if (error.response?.status === 401) {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("auth_user");
          navigate("/");
          return;
        }

        setErrorMessage("Gagal mengambil data profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  // ======================================================
  // UPDATE PROFILE
  // ======================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setErrorMessage("");

    if (!name.trim() || !username.trim() || !email.trim()) {
      setErrorMessage("Nama, username, dan email wajib diisi.");
      return;
    }

    try {
      setSaving(true);

      const token = localStorage.getItem("auth_token");

      const response = await api.put(
        "/profile",
        {
          name: name.trim(),
          username: username.trim(),
          email: email.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const updatedUser = response.data.data.user;

      setUser(updatedUser);
      setName(updatedUser.name || "");
      setUsername(updatedUser.username || "");
      setEmail(updatedUser.email || "");

      localStorage.setItem(
        "auth_user",
        JSON.stringify(updatedUser)
      );

      setMessage("Profil berhasil diperbarui.");
    } catch (error) {
      console.error("Gagal memperbarui profile:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
        navigate("/");
        return;
      }

      if (error.response?.status === 422) {
        setErrorMessage(
          error.response?.data?.message ||
            "Data profile tidak valid."
        );
      } else {
        setErrorMessage("Gagal memperbarui profile.");
      }
    } finally {
      setSaving(false);
    }
  };

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          width: "100%",
          background: "#F6F8FC",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Poppins, sans-serif",
        }}
      >
        <p
          style={{
            fontSize: "14px",
            color: "#696E82",
          }}
        >
          Memuat profil...
        </p>
      </div>
    );
  }

  // ======================================================
  // MAIN
  // ======================================================

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        background: "#F6F8FC",
        fontFamily: "Poppins, sans-serif",
        boxSizing: "border-box",
      }}
    >
      {/* ==================================================
          CONTENT WRAPPER
      ================================================== */}

      <main
        style={{
          width: "100%",
          maxWidth: "900px",
          margin: "0 auto",
          padding: "36px 24px 60px",
          boxSizing: "border-box",
        }}
      >
        {/* ==================================================
            HEADER
        ================================================== */}

        <section
          style={{
            marginBottom: "24px",
          }}
        >
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "7px",
              border: "none",
              background: "transparent",
              padding: "0",
              marginBottom: "18px",
              fontFamily: "Poppins, sans-serif",
              fontSize: "14px",
              fontWeight: 500,
              color: "#5A81FA",
              cursor: "pointer",
            }}
          >
            ← Kembali ke Dashboard
          </button>

          <div>
            <span
              style={{
                display: "inline-block",
                fontSize: "12px",
                fontWeight: 600,
                color: "#4F70D8",
                background: "#EEF2FF",
                borderRadius: "999px",
                padding: "5px 10px",
                marginBottom: "8px",
              }}
            >
              Akun Pengguna
            </span>

            <h1
              style={{
                margin: 0,
                fontSize: "32px",
                lineHeight: 1.2,
                fontWeight: 700,
                color: "#172033",
                letterSpacing: "-0.5px",
              }}
            >
              Profil
            </h1>

            <p
              style={{
                margin: "7px 0 0",
                fontSize: "14px",
                lineHeight: 1.6,
                color: "#69758A",
              }}
            >
              Kelola informasi akun Anda.
            </p>
          </div>
        </section>

        {/* ==================================================
            PROFILE CARD
        ================================================== */}

        <section
          style={{
            width: "100%",
            background: "#FFFFFF",
            border: "1px solid #E4E8F0",
            borderRadius: "18px",
            boxShadow:
              "0 8px 30px rgba(15, 23, 42, 0.05)",
            overflow: "hidden",
          }}
        >
          {/* ==================================================
              USER HEADER
          ================================================== */}

          <div
            style={{
              padding: "26px 30px",
              borderBottom: "1px solid #EEF1F6",
              display: "flex",
              alignItems: "center",
              gap: "18px",
            }}
          >
            {/* AVATAR */}

            <div
              style={{
                width: "62px",
                height: "62px",
                minWidth: "62px",
                borderRadius: "50%",
                background:
                  "linear-gradient(135deg, #EEF2FF, #E4EAFE)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid #DCE4FF",
              }}
            >
              <span
                style={{
                  fontSize: "22px",
                  fontWeight: 700,
                  color: "#4F70D8",
                }}
              >
                {user?.name?.charAt(0)?.toUpperCase() ||
                  "U"}
              </span>
            </div>

            {/* USER DATA */}

            <div
              style={{
                minWidth: 0,
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: "17px",
                  lineHeight: 1.4,
                  fontWeight: 700,
                  color: "#172033",
                }}
              >
                {user?.name || "Pengguna"}
              </h2>

              <p
                style={{
                  margin: "3px 0 0",
                  fontSize: "13px",
                  color: "#64748B",
                }}
              >
                {user?.role?.name || "Pengguna"}
              </p>

              <p
                style={{
                  margin: "3px 0 0",
                  fontSize: "12px",
                  color: "#94A3B8",
                }}
              >
                {user?.unit?.name || "-"}
              </p>
            </div>
          </div>

          {/* ==================================================
              FORM AREA
          ================================================== */}

          <div
            style={{
              padding: "28px 30px 30px",
            }}
          >
            {/* SUCCESS MESSAGE */}

            {message && (
              <div
                style={{
                  marginBottom: "22px",
                  border: "1px solid #BBF7D0",
                  background: "#F0FDF4",
                  borderRadius: "12px",
                  padding: "12px 14px",
                  fontSize: "13px",
                  color: "#15803D",
                }}
              >
                {message}
              </div>
            )}

            {/* ERROR MESSAGE */}

            {errorMessage && (
              <div
                style={{
                  marginBottom: "22px",
                  border: "1px solid #FECACA",
                  background: "#FEF2F2",
                  borderRadius: "12px",
                  padding: "12px 14px",
                  fontSize: "13px",
                  color: "#DC2626",
                }}
              >
                {errorMessage}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "20px",
              }}
            >
              {/* ==================================================
                  NAME
              ================================================== */}

              <div>
                <label
                  htmlFor="name"
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#334155",
                  }}
                >
                  Nama
                </label>

                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  style={{
                    width: "100%",
                    height: "46px",
                    boxSizing: "border-box",
                    border: "1px solid #D6DDE9",
                    borderRadius: "11px",
                    background: "#FFFFFF",
                    padding: "0 14px",
                    fontFamily: "Poppins, sans-serif",
                    fontSize: "13px",
                    color: "#172033",
                    outline: "none",
                  }}
                />
              </div>

              {/* ==================================================
                  USERNAME
              ================================================== */}

              <div>
                <label
                  htmlFor="username"
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#334155",
                  }}
                >
                  Username
                </label>

                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value)
                  }
                  style={{
                    width: "100%",
                    height: "46px",
                    boxSizing: "border-box",
                    border: "1px solid #D6DDE9",
                    borderRadius: "11px",
                    background: "#FFFFFF",
                    padding: "0 14px",
                    fontFamily: "Poppins, sans-serif",
                    fontSize: "13px",
                    color: "#172033",
                    outline: "none",
                  }}
                />
              </div>

              {/* ==================================================
                  EMAIL
              ================================================== */}

              <div>
                <label
                  htmlFor="email"
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#334155",
                  }}
                >
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  style={{
                    width: "100%",
                    height: "46px",
                    boxSizing: "border-box",
                    border: "1px solid #D6DDE9",
                    borderRadius: "11px",
                    background: "#FFFFFF",
                    padding: "0 14px",
                    fontFamily: "Poppins, sans-serif",
                    fontSize: "13px",
                    color: "#172033",
                    outline: "none",
                  }}
                />
              </div>

              {/* ==================================================
                  JABATAN
              ================================================== */}

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#334155",
                  }}
                >
                  Jabatan
                </label>

                <input
                  type="text"
                  value={user?.jabatan || "-"}
                  disabled
                  style={{
                    width: "100%",
                    height: "46px",
                    boxSizing: "border-box",
                    border: "1px solid #E2E8F0",
                    borderRadius: "11px",
                    background: "#F5F7FA",
                    padding: "0 14px",
                    fontFamily: "Poppins, sans-serif",
                    fontSize: "13px",
                    color: "#7A8699",
                    outline: "none",
                  }}
                />
              </div>

              {/* ==================================================
                  NIP
              ================================================== */}

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#334155",
                  }}
                >
                  NIP
                </label>

                <input
                  type="text"
                  value={user?.nip || "-"}
                  disabled
                  style={{
                    width: "100%",
                    height: "46px",
                    boxSizing: "border-box",
                    border: "1px solid #E2E8F0",
                    borderRadius: "11px",
                    background: "#F5F7FA",
                    padding: "0 14px",
                    fontFamily: "Poppins, sans-serif",
                    fontSize: "13px",
                    color: "#7A8699",
                    outline: "none",
                  }}
                />
              </div>

              {/* ==================================================
                  ACTION
              ================================================== */}

              <div
                style={{
                  marginTop: "8px",
                  paddingTop: "22px",
                  borderTop: "1px solid #EEF1F6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "14px",
                  flexWrap: "wrap",
                }}
              >
                <button
                  type="button"
                  onClick={() =>
                    navigate("/profil/password")
                  }
                  style={{
                    minHeight: "44px",
                    padding: "0 20px",
                    borderRadius: "11px",
                    border: "1px solid #D6DEFA",
                    background: "#FFFFFF",
                    color: "#4056B5",
                    fontFamily: "Poppins, sans-serif",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  Ganti Password
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    minHeight: "44px",
                    padding: "0 22px",
                    borderRadius: "11px",
                    border: "none",
                    background: saving
                      ? "#9DB0F4"
                      : "#5A81FA",
                    color: "#FFFFFF",
                    fontFamily: "Poppins, sans-serif",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: saving
                      ? "not-allowed"
                      : "pointer",
                    boxShadow:
                      "0 5px 14px rgba(90,129,250,0.20)",
                  }}
                >
                  {saving
                    ? "Menyimpan..."
                    : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}
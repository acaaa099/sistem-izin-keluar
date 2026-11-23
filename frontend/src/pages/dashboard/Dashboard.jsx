import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Asset
import logoPengadilan from "../../assets/logo-pn-palangka-raya.png";

// API
import api from "../../services/api";

// ========================================================
// ICONS
// ========================================================

function IconMenu(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      {...props}
    >
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function IconDashboard(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="3.5" y="3.5" width="7.2" height="7.2" rx="1.6" />
      <rect x="13.3" y="3.5" width="7.2" height="7.2" rx="1.6" />
      <rect x="3.5" y="13.3" width="7.2" height="7.2" rx="1.6" />
      <rect x="13.3" y="13.3" width="7.2" height="7.2" rx="1.6" />
    </svg>
  );
}

function IconEdit(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M4.5 19.5h4l10.1-10.1a2.1 2.1 0 0 0 0-3l-1-1a2.1 2.1 0 0 0-3 0L4.5 15.5v4Z" />
      <path d="m13.5 6.5 4 4" />
    </svg>
  );
}

function IconHistory(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3.7 12a8.3 8.3 0 1 0 2.5-6" />
      <path d="M3.7 4.5v4h4" />
      <path d="M12 7.8V12l2.8 1.8" />
    </svg>
  );
}

function IconUserCircle(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="8.4" />
      <circle cx="12" cy="9.8" r="2.8" />
      <path d="M6.5 18a6 6 0 0 1 11 0" />
    </svg>
  );
}

function IconLogout(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M9 4H6.3A1.8 1.8 0 0 0 4.5 5.8v12.4A1.8 1.8 0 0 0 6.3 20H9" />
      <path d="m15 8 4 4-4 4" />
      <path d="M19 12H9" />
    </svg>
  );
}

function IconChevronDown(props) {
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
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function IconPlus(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function IconClock(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="8.3" />
      <path d="M12 7.5V12l3 1.8" />
    </svg>
  );
}

function IconCheck(props) {
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
      <circle cx="12" cy="12" r="8.3" />
      <path d="m8.3 12.2 2.3 2.2 4.8-4.8" />
    </svg>
  );
}

function IconFlag(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M5 20V4" />
      <path d="M5 5c4-3 7 2 14-1v9c-7 3-10-2-14 1" />
    </svg>
  );
}

function IconCalendar(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="3.5" y="5.2" width="17" height="15.2" rx="2" />
      <path d="M3.5 9.5h17" />
      <path d="M8 3.5v4M16 3.5v4" />
    </svg>
  );
}

function IconArrowRight(props) {
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
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function IconFolder(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3.5 6.5A1.5 1.5 0 0 1 5 5h4l1.6 2h8.4a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 19 19H5a1.5 1.5 0 0 1-1.5-1.5v-11Z" />
    </svg>
  );
}

function IconSettings(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="3" />
      <path d="m19.4 15 .1.1a1.7 1.7 0 0 1-2.4 2.4l-.1-.1a1.7 1.7 0 0 0-2.9 1.2v.2a1.7 1.7 0 0 1-3.4 0v-.2a1.7 1.7 0 0 0-2.9-1.2l-.1.1a1.7 1.7 0 0 1-2.4-2.4l.1-.1a1.7 1.7 0 0 0-1.2-2.9H4a1.7 1.7 0 0 1 0-3.4h.2a1.7 1.7 0 0 0 1.2-2.9l-.1-.1a1.7 1.7 0 0 1 2.4-2.4l.1.1a1.7 1.7 0 0 0 2.9-1.2V2.9a1.7 1.7 0 0 1 3.4 0v.2a1.7 1.7 0 0 0 2.9 1.2l.1-.1a1.7 1.7 0 0 1 2.4 2.4l-.1.1a1.7 1.7 0 0 0 1.2 2.9h.2a1.7 1.7 0 0 1 0 3.4h-.2a1.7 1.7 0 0 0-1.2 2.9Z" />
    </svg>
  );
}

// ========================================================
// HELPER
// ========================================================

function formatDate(dateString) {
  if (!dateString) return "-";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(timeString) {
  if (!timeString) return "-";

  return timeString.slice(0, 5);
}

function formatJenisIzin(value) {
  if (!value) return "-";

  const normalized = value.toLowerCase();

  const labels = {
    "keperluan-pribadi": "Keperluan Pribadi",
    keperluan_pribadi: "Keperluan Pribadi",
    "urusan-keluarga": "Urusan Keluarga",
    urusan_keluarga: "Urusan Keluarga",
    "urusan-dinas": "Urusan Dinas",
    urusan_dinas: "Urusan Dinas",
    lainnya: "Lainnya",
  };

  return labels[normalized] || value;
}

function formatStatus(status) {
  const labels = {
    DIAJUKAN: "Menunggu Persetujuan",
    REVISI: "Revisi",
    DISETUJUI: "Disetujui",
    "SURAT TERSEDIA": "Surat Tersedia",
    "SEDANG IZIN": "Sedang Izin",
    "MENUNGGU PENYELESAIAN": "Menunggu Penyelesaian",
    SELESAI: "Selesai",
    DITOLAK: "Ditolak",
  };

  return labels[status] || status || "-";
}

// ========================================================
// STATUS BADGE
// ========================================================

const STATUS_STYLE = {
  Selesai: "bg-[#DDF5E5] text-[#198447]",
  Disetujui: "bg-[#DDF5E5] text-[#198447]",
  "Surat Tersedia": "bg-[#DDF5E5] text-[#198447]",
  "Sedang Izin": "bg-[#DDF5E5] text-[#198447]",
  "Menunggu Penyelesaian": "bg-[#FFF0D7] text-[#A96812]",
  "Menunggu Persetujuan": "bg-[#FFF0D7] text-[#A96812]",
  Revisi: "bg-[#FFF0D7] text-[#A96812]",
  Ditolak: "bg-[#FCE0E0] text-[#D53930]",
};

function StatusBadge({ status }) {
  return (
    <span
      className={`
        inline-flex
        items-center
        justify-center
        rounded-lg
        px-3
        py-1.5
        text-[11px]
        font-semibold
        whitespace-nowrap
        ${STATUS_STYLE[status] || "bg-[#EEF2FF] text-[#40599A]"}
      `}
    >
      {status}
    </span>
  );
}

// ========================================================
// STAT CARD
// ========================================================

const ICON_TONE = {
  blue: {
    wrapper: "bg-[#EAF0FF]",
    icon: "text-[#3565D9]",
  },
  navy: {
    wrapper: "bg-[#263E88]",
    icon: "text-white",
  },
  green: {
    wrapper: "bg-[#E5F6EC]",
    icon: "text-[#209052]",
  },
};

function StatCard({ label, value, icon: Icon, tone }) {
  const toneStyle = ICON_TONE[tone] || ICON_TONE.blue;

  return (
    <div
      className="
        min-w-0
        min-h-[130px]
        rounded-2xl
        border
        border-[#E8EBF2]
        bg-white
        px-5
        py-5
        shadow-[0_5px_18px_rgba(31,41,55,0.05)]
        transition
        hover:-translate-y-0.5
        hover:shadow-[0_10px_25px_rgba(31,41,55,0.08)]
      "
    >
      <div
        className={`
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-xl
          ${toneStyle.wrapper}
        `}
      >
        <Icon className={`h-5 w-5 ${toneStyle.icon}`} />
      </div>

      <p className="mt-4 text-[30px] font-bold leading-none tracking-tight text-[#111827]">
        {value}
      </p>

      <p className="mt-2 text-[13px] font-medium text-[#4F586D]">
        {label}
      </p>
    </div>
  );
}

// ========================================================
// SIDEBAR
// ========================================================

function getNavItems(user) {
  const jabatan = String(user?.jabatan || "").trim().toLowerCase();
  const role = String(user?.role?.name || "").trim().toLowerCase();

  // Laravel biasanya menserialisasi nama relasi menjadi snake_case.
  const positions = user?.active_positions || user?.activePositions || [];
  const positionNames = positions.map((position) =>
    String(position?.position_name || "").trim().toLowerCase()
  );
  const positionTexts = [jabatan, ...positionNames];

  const isAdmin = role === "admin sistem";

  const isKetua = positionTexts.some((position) =>
    position === "ketua" ||
    position.includes("ketua pengadilan")
  );

  const isWakilKetua = positionTexts.some((position) =>
    position === "wakil ketua" ||
    position.includes("wakil ketua")
  );

  const isSupervisor = positionTexts.some((position) =>
    position === "sekretaris" ||
    position === "panitera" ||
    position === "wakil ketua" ||
    position.startsWith("panmud") ||
    position.startsWith("kasub") ||
    position.includes("kasub ")
  );

  const dashboard = {
    key: "dashboard",
    label: "Dashboard",
    icon: IconDashboard,
    path: "/dashboard",
  };

  const ajukan = {
    key: "ajukan",
    label: "Ajukan Izin",
    icon: IconEdit,
    path: "/izin/ajukan",
  };

  const riwayat = {
    key: "riwayat",
    label: "Riwayat Izin Saya",
    icon: IconHistory,
    path: "/riwayat-izin",
  };

  const profil = {
    key: "profil",
    label: "Profil",
    icon: IconUserCircle,
    path: "/profil",
  };

  if (isAdmin) {
    return [
      dashboard,
      {
        key: "monitoring",
        label: "Monitoring Izin",
        icon: IconHistory,
        path: "/monitoring-izin",
      },
      {
        key: "administrasi",
        label: "Administrasi",
        icon: IconSettings,
        path: "/admin",
      },
      profil,
    ];
  }

  if (isKetua && !isWakilKetua) {
    return [
      dashboard,
      {
        key: "permohonan",
        label: "Permohonan Izin",
        icon: IconEdit,
        path: "/permohonan-izin",
      },
      profil,
      {
        key: "monitoring",
        label: "Monitoring Izin",
        icon: IconHistory,
        path: "/monitoring-izin",
      },
    ];
  }

  if (isSupervisor || isWakilKetua) {
    return [
      dashboard,
      ajukan,
      riwayat,
      profil,
      {
        key: "monitoring-pegawai",
        label: "Monitoring Izin Pegawai",
        icon: IconHistory,
        path: "/monitoring-izin-pegawai",
      },
    ];
  }

  return [dashboard, ajukan, riwayat, profil];
}

function Sidebar({
  open,
  activeKey,
  navItems,
  onNavigate,
  onClose,
  onLogout,
  loggingOut,
}) {
  return (
    <aside
      className={`
        fixed
        left-0
        top-0
        z-40
        flex
        h-screen
        w-[228px]
        shrink-0
        flex-col
        bg-[#263247]
        shadow-[4px_0_18px_rgba(15,23,42,0.06)]
        transition-transform
        duration-200
        lg:sticky
        lg:translate-x-0
        ${open ? "translate-x-0" : "-translate-x-full"}
      `}
    >
      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-4">
        <img
          src={logoPengadilan}
          alt="Logo Pengadilan Negeri Palangka Raya"
          className="h-11 w-11 shrink-0 object-contain"
        />

        <div className="min-w-0">
          <p className="truncate text-[14px] font-bold leading-tight text-white">
            PN Palangka Raya
          </p>

          <p className="mt-1 text-[10.5px] leading-tight text-[#B8C0D1]">
            Izin Keluar Kantor
          </p>
        </div>
      </div>

      <nav className="flex-1 px-3" style={{ paddingTop: "8px" }}>
        <div className="flex flex-col gap-1">
          {navItems.map(({ key, label, icon: Icon, path }) => {
            const active = key === activeKey;

            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  onNavigate(key, path);
                  onClose();
                }}
                className={`
                  group
                  flex
                  w-full
                  items-center
                  gap-3
                  rounded-xl
                  px-3
                  py-2.5
                  text-left
                  text-[13.5px]
                  font-medium
                  transition-all
                  ${
                    active
                      ? "bg-[#48639A] text-white shadow-[0_3px_10px_rgba(0,0,0,0.08)]"
                      : "text-[#C4CBDA] hover:bg-white/8 hover:text-white"
                  }
                `}
              >
                <Icon
                  className={`
                    h-[19px]
                    w-[19px]
                    shrink-0
                    ${
                      active
                        ? "text-white"
                        : "text-[#B6C0D3] group-hover:text-white"
                    }
                  `}
                />

                <span className="truncate">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <div className="border-t border-white/10 px-3 py-4">
        <button
          type="button"
          onClick={onLogout}
          disabled={loggingOut}
          className="
            flex
            w-full
            items-center
            gap-3
            rounded-xl
            px-3
            py-2.5
            text-[13.5px]
            font-medium
            text-[#C4CBDA]
            transition
            hover:bg-white/8
            hover:text-white
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          <IconLogout className="h-[19px] w-[19px] shrink-0" />

          <span>{loggingOut ? "Keluar..." : "Logout"}</span>
        </button>
      </div>
    </aside>
  );
}

// ========================================================
// TOPBAR
// ========================================================

function Topbar({
  onToggleSidebar,
  userName,
  userRole,
  onProfile,
}) {
  return (
    <header
      className="
        sticky
        top-0
        z-20
        flex
        h-[62px]
        items-center
        justify-between
        border-b
        border-[#E6E9F0]
        bg-white
        px-4
        sm:px-5
        lg:px-6
      "
    >
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Buka atau tutup sidebar"
          className="
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-lg
            text-[#647089]
            transition
            hover:bg-[#F3F5F9]
          "
        >
          <IconMenu className="h-5 w-5" />
        </button>

        <p className="text-[14px] font-semibold text-[#202638]">
          Dashboard
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden h-7 w-px bg-[#E5E8EF] sm:block" />

        <button
          type="button"
          onClick={onProfile}
          className="group flex items-center gap-3"
        >
          <div
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-[#EEF2FA]
              ring-1
              ring-[#DCE3F0]
            "
          >
            <IconUserCircle className="h-[21px] w-[21px] text-[#536887]" />
          </div>

          <div className="hidden min-w-0 text-left sm:block">
            <p className="max-w-[170px] truncate text-[13px] font-bold leading-tight text-[#202638]">
              {userName}
            </p>

            <p className="mt-1 max-w-[170px] truncate text-[11px] leading-tight text-[#7C8496]">
              {userRole}
            </p>
          </div>

          <IconChevronDown className="h-4 w-4 text-[#8B93A5] transition group-hover:text-[#4D566B]" />
        </button>
      </div>
    </header>
  );
}

// ========================================================
// MAIN DASHBOARD
// ========================================================

export default function Dashboard() {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("dashboard");

  const [user, setUser] = useState(null);
  const [permits, setPermits] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // ======================================================
// GET USER + PERMITS
// ======================================================

useEffect(() => {
  const fetchDashboardData = async () => {
    const token = localStorage.getItem("auth_token");

    // Periksa token login
    if (!token) {
      navigate("/");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      // 1. Ambil data pengguna yang sedang login
      const userResponse = await api.get("/me");

      const currentUser = userResponse.data?.data?.user;

      if (!currentUser) {
        throw new Error("Data pengguna tidak ditemukan dari server.");
      }

      // Simpan data pengguna
      setUser(currentUser);

      localStorage.setItem(
        "auth_user",
        JSON.stringify(currentUser)
      );

      // 2. Ambil data izin berdasarkan permission pengguna
      //
      // Backend akan menentukan cakupan data:
      // - Admin Sistem: seluruh pengajuan izin.
      // - Atasan: pengajuan izin bawahan.
      // - Staff/Pegawai: pengajuan izin milik sendiri.
      //
      // Tidak menggunakan parameter scope=own secara paksa.

      const permitsResponse = await api.get("/permits");

      const permitList =
        permitsResponse.data?.data?.permits || [];

      setPermits(permitList);

    } catch (error) {
      console.error(
        "Gagal mengambil data dashboard:",
        error
      );

      // Jika token tidak valid, kembali ke halaman login
      if (error.response?.status === 401) {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");

        navigate("/");
        return;
      }

      // Tampilkan pesan kesalahan dari backend
      setErrorMessage(
        error.response?.data?.message ||
        "Data dashboard tidak dapat dimuat."
      );

    } finally {
      setLoading(false);
    }
  };

  fetchDashboardData();

}, [navigate]);

  // ======================================================
  // NAVIGATION
  // ======================================================

  const handleNavigation = (key, path) => {
    setActiveNav(key);

    if (path) {
      navigate(path);
    }
  };

  // ======================================================
  // LOGOUT
  // ======================================================

  const handleLogout = async () => {
    const token = localStorage.getItem("auth_token");

    try {
      setLoggingOut(true);

      if (token) {
        await api.post("/logout");
      }
    } catch (error) {
      console.error("Logout API gagal:", error);
    } finally {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");

      setLoggingOut(false);

      navigate("/");
    }
  };

  // ======================================================
  // USER DISPLAY
  // ======================================================

  const userName = loading
    ? "Memuat..."
    : user?.name || "Pengguna";

  const userRole = loading
    ? "..."
    : user?.jabatan || user?.role?.name || "Pengguna";

  const navItems = loading
    ? [
        {
          key: "dashboard",
          label: "Dashboard",
          icon: IconDashboard,
          path: "/dashboard",
        },
      ]
    : getNavItems(user);

  const canSubmitPermit = navItems.some((item) => item.key === "ajukan");

  // ======================================================
  // STATISTICS
  // ======================================================

  const totalPengajuan = permits.length;

  const menungguPersetujuan = permits.filter(
    (permit) => permit.status === "DIAJUKAN"
  ).length;

  const disetujui = permits.filter((permit) =>
    ["DISETUJUI", "SURAT TERSEDIA"].includes(permit.status)
  ).length;

  const selesai = permits.filter(
    (permit) => permit.status === "SELESAI"
  ).length;

  const STATS = [
    {
      label: "Total Pengajuan",
      value: totalPengajuan,
      icon: IconFolder,
      tone: "blue",
    },
    {
      label: "Menunggu Persetujuan",
      value: menungguPersetujuan,
      icon: IconClock,
      tone: "navy",
    },
    {
      label: "Disetujui",
      value: disetujui,
      icon: IconCheck,
      tone: "blue",
    },
    {
      label: "Selesai",
      value: selesai,
      icon: IconFlag,
      tone: "green",
    },
  ];

  // ======================================================
  // ACTIVE PERMIT
  // ======================================================

  const activePermit =
    permits.find((permit) => permit.status === "SEDANG IZIN") || null;

  // ======================================================
  // RECENT HISTORY
  // ======================================================

  const history = [...permits]
    .sort((a, b) => {
      const dateA = new Date(a.submitted_at || a.created_at || 0).getTime();
      const dateB = new Date(b.submitted_at || b.created_at || 0).getTime();

      return dateB - dateA;
    })
    .slice(0, 4);

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <div className="flex min-h-screen bg-[#F4F6FA] font-[Poppins]">
      <Sidebar
        open={sidebarOpen}
        activeKey={activeNav}
        navItems={navItems}
        onNavigate={handleNavigation}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
        loggingOut={loggingOut}
      />

      {sidebarOpen && (
        <button
          type="button"
          aria-label="Tutup sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-[#111827]/35 lg:hidden"
        />
      )}

      <div className="min-w-0 flex-1">
        <Topbar
          onToggleSidebar={() =>
            setSidebarOpen((prev) => !prev)
          }
          userName={userName}
          userRole={userRole}
          onProfile={() => navigate("/profil")}
        />

        <main
          className="
            w-full
            px-4
            py-6
            sm:px-5
            lg:px-[18px]
            lg:py-6
          "
        >
          {/* ==================================================
              HEADER
          ================================================== */}

          <section
            className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
            style={{ marginBottom: "20px" }}
          >
            <div>
              <h1 className="text-[29px] font-bold tracking-[-0.025em] text-[#111827] sm:text-[31px]">
                Dashboard
              </h1>

              <p className="mt-2 text-[13.5px] text-[#68738A] sm:text-[14px]">
                Pantau pengajuan dan aktivitas izin keluar kantor Anda.
              </p>
            </div>

            {canSubmitPermit && (
              <button
                type="button"
                onClick={() => navigate("/izin/ajukan")}
                className="
                  inline-flex
                  h-11
                  shrink-0
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-[#385BA8]
                  px-5
                  text-[13px]
                  font-semibold
                  text-white
                  shadow-[0_5px_13px_rgba(56,91,168,0.20)]
                  transition
                  hover:bg-[#2F4D90]
                  active:scale-[0.98]
                "
              >
                <IconPlus className="h-4 w-4" />
                Ajukan Izin
              </button>
            )}
          </section>

          {/* ==================================================
              ERROR
          ================================================== */}

          {errorMessage && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {errorMessage}
            </div>
          )}

          {/* ==================================================
              STAT CARDS
          ================================================== */}

          <section
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4"
            style={{
              gap: "18px",
              marginBottom: "18px",
            }}
          >
            {STATS.map((stat) => (
              <StatCard
                key={stat.label}
                {...stat}
              />
            ))}
          </section>

          {/* ==================================================
              LOWER CARDS
          ================================================== */}

          <section
            className="grid grid-cols-1 xl:grid-cols-[0.9fr_1.5fr]"
            style={{ gap: "18px" }}
          >
            {/* ==================================================
                ACTIVE PERMIT
            ================================================== */}

            <article
              className="
                rounded-2xl
                border
                border-[#E7EAF1]
                bg-white
                p-5
                shadow-[0_5px_18px_rgba(31,41,55,0.05)]
                sm:p-6
              "
            >
              <h2 className="text-[16px] font-bold text-[#202638]">
                Izin Sedang Berlangsung
              </h2>

              {activePermit ? (
                <>
                  <div className="mt-5 flex items-start justify-between gap-4">
                    <p className="text-[17px] font-bold text-[#202638]">
                      {formatJenisIzin(activePermit.jenis_izin)}
                    </p>

                    <StatusBadge status="Sedang Izin" />
                  </div>

                  <div className="mt-5 flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#EAF0FF]">
                      <IconCalendar className="h-5 w-5 text-[#3F69D9]" />
                    </div>

                    <div>
                      <p className="text-[11px] font-medium text-[#8A93A6]">
                        Tanggal
                      </p>

                      <p className="mt-1 text-[13.5px] font-medium text-[#303647]">
                        {formatDate(activePermit.tanggal_izin)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#EAF0FF]">
                      <IconClock className="h-5 w-5 text-[#3F69D9]" />
                    </div>

                    <div>
                      <p className="text-[11px] font-medium text-[#8A93A6]">
                        Waktu
                      </p>

                      <p className="mt-1 text-[13.5px] font-medium text-[#303647]">
                        {formatTime(activePermit.jam_keluar)} -{" "}
                        {formatTime(activePermit.estimasi_kembali)}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/izin/detail/${activePermit.id}`)
                    }
                    className="
                      mt-6
                      flex
                      h-11
                      w-full
                      items-center
                      justify-center
                      rounded-xl
                      border
                      border-[#8AA8EA]
                      text-[13px]
                      font-semibold
                      text-[#34589E]
                      transition
                      hover:bg-[#F5F8FF]
                    "
                  >
                    Lihat Detail
                  </button>
                </>
              ) : (
                <div className="mt-6 rounded-xl bg-[#F8F9FC] px-5 py-8 text-center">
                  <p className="text-[13px] font-medium text-[#697184]">
                    Tidak ada izin yang sedang berlangsung.
                  </p>

                  <button
                    type="button"
                    onClick={() => navigate("/izin/ajukan")}
                    className="
                      mt-4
                      text-[13px]
                      font-semibold
                      text-[#3F68C9]
                      hover:underline
                    "
                  >
                    Ajukan izin
                  </button>
                </div>
              )}
            </article>

            {/* ==================================================
                RECENT HISTORY
            ================================================== */}

            <article
              className="
                min-w-0
                rounded-2xl
                border
                border-[#E7EAF1]
                bg-white
                p-6
                shadow-[0_5px_18px_rgba(31,41,55,0.05)]
                sm:p-7
              "
            >
              <div className="mb-6 flex items-center justify-between gap-3">
                <h2 className="text-[16px] font-bold text-[#202638]">
                  Riwayat Izin Terbaru
                </h2>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      navItems.some((item) => item.key === "monitoring-pegawai")
                        ? "/monitoring-izin-pegawai"
                        : navItems.some((item) => item.key === "monitoring")
                          ? "/monitoring-izin"
                          : "/riwayat-izin"
                    )
                  }
                  className="
                    inline-flex
                    shrink-0
                    items-center
                    gap-1.5
                    text-[13px]
                    font-semibold
                    text-[#3F68C9]
                    transition
                    hover:text-[#294E9F]
                  "
                >
                  Lihat Semua
                  <IconArrowRight className="h-4 w-4" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] border-collapse">
                  <thead>
                    <tr className="border-b border-[#E8EBF1]">
                      <th className="px-2 py-3 text-left text-[10.5px] font-bold uppercase tracking-[0.05em] text-[#7E879A]">
                        Tanggal
                      </th>

                      <th className="px-2 py-3 text-left text-[10.5px] font-bold uppercase tracking-[0.05em] text-[#7E879A]">
                        Keperluan
                      </th>

                      <th className="px-2 py-3 text-left text-[10.5px] font-bold uppercase tracking-[0.05em] text-[#7E879A]">
                        Waktu
                      </th>

                      <th className="px-2 py-3 text-left text-[10.5px] font-bold uppercase tracking-[0.05em] text-[#7E879A]">
                        Status
                      </th>

                      <th className="px-2 py-3 text-right text-[10.5px] font-bold uppercase tracking-[0.05em] text-[#7E879A]">
                        Aksi
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {history.length > 0 ? (
                      history.map((item) => {
                        const displayStatus = formatStatus(item.status);

                        return (
                          <tr
                            key={item.id}
                            className="
                              border-b
                              border-[#F0F2F6]
                              transition
                              last:border-b-0
                              hover:bg-[#FAFBFD]
                            "
                          >
                            <td className="whitespace-nowrap px-2 py-4 text-[12.5px] font-medium text-[#333949]">
                              {formatDate(item.tanggal_izin)}
                            </td>

                            <td className="px-2 py-4 text-[12.5px] font-medium text-[#333949]">
                              {formatJenisIzin(item.jenis_izin)}
                            </td>

                            <td className="whitespace-nowrap px-2 py-4 text-[12.5px] text-[#697184]">
                              {formatTime(item.jam_keluar)} -{" "}
                              {formatTime(item.estimasi_kembali)}
                            </td>

                            <td className="px-2 py-4">
                              <StatusBadge status={displayStatus} />
                            </td>

                            <td className="px-2 py-4 text-right">
                              <button
                                type="button"
                                onClick={() =>
                                  navigate(`/izin/detail/${item.id}`)
                                }
                                className="
                                  text-[12.5px]
                                  font-semibold
                                  text-[#3F68C9]
                                  underline-offset-2
                                  transition
                                  hover:text-[#294E9F]
                                  hover:underline
                                "
                              >
                                Detail
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan="5"
                          className="px-4 py-8 text-center text-[13px] text-[#697184]"
                        >
                          Belum ada pengajuan izin.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </article>
          </section>
        </main>
      </div>
    </div>
  );
}
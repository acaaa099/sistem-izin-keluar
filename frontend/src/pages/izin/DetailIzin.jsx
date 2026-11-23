import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

// API
import api from "../../services/api";

// ======================================================
// ICONS
// ======================================================

function IconArrowLeft(props) {
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
      <path d="M19 12H5" />
      <path d="m11 18-6-6 6-6" />
    </svg>
  );
}

function IconCalendar(props) {
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
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4" />
    </svg>
  );
}

function IconClock(props) {
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
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  );
}

function IconCheck(props) {
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
      <path d="m7 12 3 3 7-7" />
    </svg>
  );
}

function IconFile(props) {
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
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M8 13h8M8 17h6" />
    </svg>
  );
}

function IconCamera(props) {
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
      <path d="M4 7h3l1.5-2h7L17 7h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Z" />
      <circle cx="12" cy="13" r="3.5" />
    </svg>
  );
}

function IconAlertCircle(props) {
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
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </svg>
  );
}

function IconThumbUp(props) {
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
      <path d="M7 10v10H4a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1h3Z" />
      <path d="M7 20h9.5a2 2 0 0 0 1.9-1.4l2.2-7A2 2 0 0 0 18.7 9H15l.8-4.1A1.7 1.7 0 0 0 12.5 4L8 10H7" />
    </svg>
  );
}

// ======================================================
// STATUS CONFIG
// ======================================================

const STATUS_CONFIG = {
  DIAJUKAN: {
    label: "Diajukan",
    className:
      "bg-amber-50 text-amber-700 border-amber-200",
  },

  REVISI: {
    label: "Perlu Revisi",
    className:
      "bg-orange-50 text-orange-700 border-orange-200",
  },

  DISETUJUI: {
    label: "Disetujui",
    className:
      "bg-blue-50 text-blue-700 border-blue-200",
  },

  "SURAT TERSEDIA": {
    label: "Surat Tersedia",
    className:
      "bg-indigo-50 text-indigo-700 border-indigo-200",
  },

  "SEDANG IZIN": {
    label: "Sedang Izin",
    className:
      "bg-purple-50 text-purple-700 border-purple-200",
  },

  "MENUNGGU PENYELESAIAN": {
    label: "Menunggu Penyelesaian",
    className:
      "bg-cyan-50 text-cyan-700 border-cyan-200",
  },

  SELESAI: {
    label: "Selesai",
    className:
      "bg-emerald-50 text-emerald-700 border-emerald-200",
  },

  DITOLAK: {
    label: "Ditolak",
    className:
      "bg-red-50 text-red-700 border-red-200",
  },
};

// ======================================================
// TIMELINE
// ======================================================

const TIMELINE = [
  {
    key: "diajukan",
    title: "Pengajuan dibuat",
    description:
      "Pengajuan izin telah dikirim oleh pegawai.",
  },

  {
    key: "persetujuan",
    title: "Menunggu persetujuan",
    description:
      "Pengajuan sedang diproses oleh atasan yang berwenang.",
  },

  {
    key: "disetujui",
    title: "Pengajuan disetujui",
    description:
      "Pengajuan telah mendapatkan persetujuan.",
  },

  {
    key: "surat",
    title: "Surat tersedia",
    description:
      "Surat izin dapat diproses sesuai alur yang berlaku.",
  },

  {
    key: "izin",
    title: "Sedang izin",
    description:
      "Pegawai sedang menjalankan izin keluar kantor.",
  },

  {
    key: "penyelesaian",
    title: "Menunggu penyelesaian",
    description:
      "Sistem menunggu bukti penyelesaian izin.",
  },

  {
    key: "selesai",
    title: "Selesai",
    description:
      "Seluruh proses izin telah diselesaikan.",
  },
];

// ======================================================
// APPROVER ROLE
// ======================================================

const APPROVER_ROLES = [
  "Ketua/Wakil Ketua",
  "Hakim",
  "Panitera",
  "Sekretaris",
  "Panmud/Kasub",
];

// ======================================================
// HELPERS
// ======================================================

function getJenisIzinLabel(jenisIzin) {
  if (!jenisIzin) {
    return "-";
  }

  const normalized = String(jenisIzin)
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, "-");

  const labels = {
    "keperluan-pribadi": "Keperluan Pribadi",
    "urusan-keluarga": "Urusan Keluarga",
    "urusan-dinas": "Urusan Dinas",
    lainnya: "Lainnya",
  };

  return labels[normalized] || jenisIzin;
}

function formatTanggal(tanggal) {
  if (!tanggal) {
    return "-";
  }

  const date = new Date(tanggal);

  if (Number.isNaN(date.getTime())) {
    return tanggal;
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatJam(jam) {
  if (!jam) {
    return "-";
  }

  return String(jam).slice(0, 5);
}

function formatDateTime(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getApprovalActionLabel(action) {
  const labels = {
    APPROVE: "Disetujui",
    REVISI: "Perlu Revisi",
    TOLAK: "Ditolak",
  };

  return labels[action] || action || "-";
}

function getEvidenceState(permit) {
  const evidences = permit?.evidences || [];

  return {
    activity: evidences.some(
      (item) => item.type === "ACTIVITY_PHOTO"
    ),

    return: evidences.some(
      (item) => item.type === "RETURN_PHOTO"
    ),

    signed_letter: evidences.some(
      (item) =>
        item.type === "SIGNED_LETTER_PHOTO"
    ),
  };
}

function getTimelineState(permit, index) {
  const status = permit.status;

  if (status === "DITOLAK") {
    if (index === 0) {
      return "done";
    }

    if (index === 1) {
      return "rejected";
    }

    return "inactive";
  }

  if (status === "REVISI") {
    if (index === 0) {
      return "done";
    }

    if (index === 1) {
      return "revision";
    }

    return "inactive";
  }

  const progressMap = {
    DIAJUKAN: 0,
    DISETUJUI: 2,
    "SURAT TERSEDIA": 3,
    "SEDANG IZIN": 4,
    "MENUNGGU PENYELESAIAN": 5,
    SELESAI: 6,
  };

  const currentIndex =
    progressMap[status] ?? 0;

  if (index < currentIndex) {
    return "done";
  }

  if (index === currentIndex) {
    return "current";
  }

  return "inactive";
}

// ======================================================
// UI HELPERS (PRESENTASI SAJA - TIDAK ADA LOGIC BISNIS)
// ======================================================

const STATUS_TONE = {
  DIAJUKAN: {
    badge: "border-amber-200 bg-amber-50 text-amber-800",
    dot: "bg-amber-500",
  },
  REVISI: {
    badge: "border-orange-200 bg-orange-50 text-orange-800",
    dot: "bg-orange-500",
  },
  DISETUJUI: {
    badge: "border-blue-200 bg-blue-50 text-blue-800",
    dot: "bg-blue-500",
  },
  "SURAT TERSEDIA": {
    badge: "border-blue-200 bg-blue-50 text-blue-800",
    dot: "bg-blue-500",
  },
  "SEDANG IZIN": {
    badge: "border-blue-200 bg-blue-50 text-blue-800",
    dot: "bg-blue-500",
  },
  "MENUNGGU PENYELESAIAN": {
    badge: "border-amber-200 bg-amber-50 text-amber-800",
    dot: "bg-amber-500",
  },
  SELESAI: {
    badge: "border-emerald-200 bg-emerald-50 text-emerald-800",
    dot: "bg-emerald-500",
  },
  DITOLAK: {
    badge: "border-red-200 bg-red-50 text-red-800",
    dot: "bg-red-500",
  },
};

const BANNER_TONE = {
  info: {
    box: "border-blue-200 bg-blue-50",
    title: "text-blue-900",
    text: "text-blue-800",
    icon: "text-blue-600",
  },
  warn: {
    box: "border-amber-200 bg-amber-50",
    title: "text-amber-900",
    text: "text-amber-800",
    icon: "text-amber-600",
  },
  success: {
    box: "border-emerald-200 bg-emerald-50",
    title: "text-emerald-900",
    text: "text-emerald-800",
    icon: "text-emerald-600",
  },
  danger: {
    box: "border-red-200 bg-red-50",
    title: "text-red-900",
    text: "text-red-800",
    icon: "text-red-600",
  },
};

const APPROVAL_TONE = {
  APPROVE: "text-emerald-700",
  REVISI: "text-orange-700",
  TOLAK: "text-red-700",
};

const BTN_PRIMARY =
  "inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#2B308B] px-4 text-sm font-semibold text-white transition hover:bg-[#23276F] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#5A81FA]/30 disabled:cursor-not-allowed disabled:opacity-50";

const BTN_SECONDARY =
  "inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#5A81FA]/20 disabled:cursor-not-allowed disabled:opacity-50";

const INPUT_CLASS =
  "w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#5A81FA] focus:ring-4 focus:ring-[#5A81FA]/15 disabled:bg-slate-50";

const MAX_EVIDENCE_FILE_SIZE = 5 * 1024 * 1024;

function normalizeStatus(value) {
  return String(value ?? "").trim().toUpperCase();
}

// Mencari bukti terbaru berdasarkan tipe (hanya untuk preview)
function getEvidenceByType(permit, type) {
  const list = (permit?.evidences || []).filter(
    (item) => item.type === type
  );

  return list.length > 0 ? list[list.length - 1] : null;
}

// Memuat foto bukti melalui endpoint terproteksi.
// Axios menyertakan Bearer token dari services/api.js; foto tetap privat.


function EvidencePreview({ permitId, evidence, title }) {
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewError, setPreviewError] = useState("");
  const [loadingPreview, setLoadingPreview] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let objectUrl = "";
    const controller = new AbortController();

    async function loadEvidence() {
      setPreviewUrl("");
      setPreviewError("");

      if (!permitId || !evidence?.id) {
        setPreviewError("Data foto bukti tidak tersedia.");
        return;
      }

      setLoadingPreview(true);

      try {
        const response = await api.get(
          `/permits/${permitId}/evidences/${evidence.id}/file`,
          {
            responseType: "blob",
            signal: controller.signal,
            headers: { Accept: "image/*" },
          }
        );

        if (cancelled) return;

        const blob = response.data;
        const contentType =
          response.headers?.["content-type"] ||
          response.headers?.["Content-Type"] ||
          "";

        if (!(blob instanceof Blob) || blob.size === 0) {
          throw new Error("Respons file kosong.");
        }

        if (blob.type && !blob.type.startsWith("image/")) {
          throw new Error(`Respons bukan file gambar: ${blob.type || "unknown"}`);
        }

        if (contentType && !contentType.includes("image/")) {
          throw new Error(`Header response bukan gambar: ${contentType}`);
        }

        objectUrl = URL.createObjectURL(blob);
        setPreviewUrl(objectUrl);
      } catch (error) {
        if (
          cancelled ||
          error.name === "CanceledError" ||
          error.name === "AbortError"
        ) {
          return;
        }

        console.error("Gagal memuat bukti izin:", {
          permitId,
          evidenceId: evidence?.id,
          status: error.response?.status,
          error,
        });

        const status = error.response?.status;

        setPreviewError(
          status === 401
            ? "Sesi login berakhir. Silakan login kembali."
            : status === 403
            ? "Akun tidak memiliki akses melihat foto."
            : status === 404
            ? "File atau endpoint foto tidak ditemukan."
            : "Foto gagal dimuat. Periksa respons endpoint Laravel."
        );
      } finally {
        if (!cancelled) setLoadingPreview(false);
      }
    }

    loadEvidence();

    return () => {
      cancelled = true;
      controller.abort();

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [permitId, evidence?.id]);

  if (loadingPreview) {
    return (
      <p className="mt-3 text-xs text-slate-500">
        Memuat foto bukti...
      </p>
    );
  }

  if (previewError) {
    return (
      <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800">
        <p className="font-semibold">Foto bukti gagal dimuat</p>
        <p>{previewError}</p>
        <p className="mt-1">
          ID izin: {permitId} · ID bukti: {evidence?.id}
        </p>
      </div>
    );
  }

  if (!previewUrl) return null;

  return (
    <a
      href={previewUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-4 block overflow-hidden rounded-md border border-slate-200 bg-slate-50 sm:max-w-xs"
      title={`Buka ${title} di tab baru`}
    >
      <img
        src={previewUrl}
        alt={title || "Foto bukti izin"}
        onError={() => {
          setPreviewError(
            "File berhasil diterima, tetapi browser tidak dapat menampilkan gambar."
          );
          setPreviewUrl("");
        }}
        className="h-40 w-full object-contain"
      />
      <span className="block border-t border-slate-200 px-3 py-2 text-xs font-medium text-slate-600">
        Klik foto untuk melihat ukuran penuh
      </span>
    </a>
  );
}


function TopBar({ onBack }) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 w-full max-w-[1120px] items-center px-4 sm:px-8">
        <button
          type="button"
          onClick={onBack}
          className="-ml-2 inline-flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-[#2B308B] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#5A81FA]/20"
        >
          <IconArrowLeft className="h-5 w-5" />
          Kembali ke Riwayat
        </button>
      </div>
    </header>
  );
}

function Panel({
  title,
  subtitle,
  aside,
  tone = "default",
  flush = false,
  children,
}) {
  const border =
    tone === "success"
      ? "border-emerald-300"
      : tone === "accent"
      ? "border-[#B9C8FF]"
      : "border-slate-200";

  return (
    <section
      className={`rounded-lg border ${border} bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]`}
    >
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div className="min-w-0">
          <h2 className="text-[15px] font-semibold text-[#1E2260]">
            {title}
          </h2>

          {subtitle && (
            <p className="mt-0.5 text-[13px] leading-5 text-slate-500">
              {subtitle}
            </p>
          )}
        </div>

        {aside}
      </div>

      {flush ? children : <div className="px-5 py-5">{children}</div>}
    </section>
  );
}

function Field({ label, children, className = "" }) {
  return (
    <div className={`min-w-0 ${className}`}>
      <dt className="text-xs font-medium text-slate-500">{label}</dt>

      <dd className="mt-1 break-words text-sm font-semibold text-slate-800">
        {children}
      </dd>
    </div>
  );
}

function Notice({ tone = "neutral", children }) {
  const style =
    tone === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : "border-slate-200 bg-slate-50 text-slate-700";

  return (
    <div
      className={`rounded-md border px-3 py-2.5 text-sm leading-6 ${style}`}
    >
      {children}
    </div>
  );
}

function EvidenceItem({
  icon,
  title,
  description,
  done,
  permitId,
  evidence,
  children,
}) {
  return (
    <li className="px-5 py-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${
              done
                ? "bg-emerald-50 text-emerald-600"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {icon}
          </div>

          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800">
              {title}
            </p>

            <p className="mt-0.5 text-[13px] leading-5 text-slate-500">
              {description}
            </p>
          </div>
        </div>

        <span
          className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
            done
              ? "bg-emerald-50 text-emerald-700"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          {done && <IconCheck className="h-3.5 w-3.5" />}
          {done ? "Sudah ada" : "Belum ada"}
        </span>
      </div>

      {done && evidence && (
        <EvidencePreview
          permitId={permitId}
          evidence={evidence}
          title={title}
        />
      )}

      {children && <div className="mt-4 space-y-3">{children}</div>}
    </li>
  );
}


// ======================================================
// PAGE
// ======================================================

export default function DetailIzin() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [permit, setPermit] = useState(null);
  const [currentUser, setCurrentUser] =
    useState(null);

  const [loading, setLoading] = useState(true);
  const [loadingUser, setLoadingUser] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [approvalMessage, setApprovalMessage] =
    useState("");

  const [approvalNote, setApprovalNote] =
    useState("");

  const [approvalLoading, setApprovalLoading] =
    useState("");

  // ======================================================
  // PDF STATE
  // ======================================================

  const [pdfLoading, setPdfLoading] =
    useState(false);

  const [pdfMessage, setPdfMessage] =
    useState("");

  // ======================================================
  // ACTIVITY PHOTO STATE
  // ======================================================

  const [activityUploadLoading, setActivityUploadLoading] =
    useState(false);

  const [activityMessage, setActivityMessage] =
    useState("");

  // ======================================================
  // RETURN PHOTO STATE
  // ======================================================

  const [returnUploadLoading, setReturnUploadLoading] =
    useState(false);

  const [returnMessage, setReturnMessage] =
    useState("");

  const [returnTime, setReturnTime] =
    useState("");

  // ======================================================
  // SIGNED LETTER STATE
  // ======================================================

  const [signedLetterUploadLoading, setSignedLetterUploadLoading] =
    useState(false);

  const [signedLetterMessage, setSignedLetterMessage] =
    useState("");

  // ======================================================
  // COMPLETION STATE
  // ======================================================

  const [completionLoading, setCompletionLoading] =
    useState(false);

  const [completionMessage, setCompletionMessage] =
    useState("");

  // ======================================================
  // CAMERA STATE
  // ======================================================

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [cameraOpen, setCameraOpen] =
    useState(false);

  const [cameraStarting, setCameraStarting] =
    useState(false);

  const [cameraError, setCameraError] =
    useState("");

  const [cameraMode, setCameraMode] =
    useState("activity");

  // ======================================================
  // AMBIL USER LOGIN
  // ======================================================

  useEffect(() => {
    const fetchCurrentUser = async () => {
      setLoadingUser(true);

      try {
        const response =
          await api.get("/me");

        const user =
          response.data?.data?.user ||
          response.data?.user ||
          null;

        setCurrentUser(user);

        if (user) {
          localStorage.setItem(
            "auth_user",
            JSON.stringify(user)
          );
        }
      } catch (error) {
        console.error(
          "Gagal mengambil user login:",
          error
        );

        try {
          const storedUser =
            localStorage.getItem(
              "auth_user"
            );

          if (storedUser) {
            setCurrentUser(
              JSON.parse(storedUser)
            );
          }
        } catch (parseError) {
          console.error(
            "Gagal membaca auth_user:",
            parseError
          );
        }
      } finally {
        setLoadingUser(false);
      }
    };

    fetchCurrentUser();
  }, []);

  // ======================================================
  // AMBIL DETAIL DARI BACKEND
  // ======================================================

  const fetchPermit = async () => {
    if (!id) {
      setErrorMessage(
        "ID pengajuan izin tidak ditemukan."
      );
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const response =
        await api.get(`/permits/${id}`);

      console.log(
        "Response detail izin:",
        response.data
      );

      const permitData =
        response.data?.data?.permit;

      if (!permitData) {
        throw new Error(
          "Data pengajuan izin tidak ditemukan."
        );
      }

      setPermit(permitData);
    } catch (error) {
      console.error(
        "Gagal mengambil detail izin:",
        error
      );

      if (
        error.response?.status === 401
      ) {
        setErrorMessage(
          "Sesi login telah berakhir. Silakan login kembali."
        );
        return;
      }

      if (
        error.response?.status === 403
      ) {
        setErrorMessage(
          "Anda tidak memiliki akses ke pengajuan izin ini."
        );
        return;
      }

      if (
        error.response?.status === 404
      ) {
        setErrorMessage(
          "Pengajuan izin tidak ditemukan."
        );
        return;
      }

      setErrorMessage(
        error.response?.data?.message ||
          "Gagal mengambil detail pengajuan izin."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermit();
  }, [id]);

  useEffect(() => {
    if (permit?.jam_kembali) {
      setReturnTime(formatJam(permit.jam_kembali));
    }
  }, [permit?.jam_kembali]);

  // ======================================================
  // CEK HAK APPROVAL
  // ======================================================

  const currentUserRole =
    currentUser?.role?.name || "";

  const isApproverRole =
    APPROVER_ROLES.includes(
      currentUserRole
    );

  // ======================================================
  // CEK PEMILIK IZIN
  // ======================================================

  const isPermitOwner = Boolean(
    permit &&
      currentUser &&
      (
        String(currentUser.id) === String(permit.user_id) ||
        String(currentUser.id) === String(permit.user?.id)
      )
  );

  // ======================================================
  // CEK BOLEH APPROVAL
  // ======================================================

  const permitStatus = normalizeStatus(permit?.status);

  const canProcessApproval =
    !loadingUser &&
    !loading &&
    Boolean(permit) &&
    permitStatus === "DIAJUKAN" &&
    isApproverRole &&
    !isPermitOwner;

  // ======================================================
  // CEK BOLEH PERBAIKI REVISI
  // ======================================================

  const canEditRevision =
    !loadingUser &&
    !loading &&
    Boolean(permit) &&
    permitStatus === "REVISI" &&
    isPermitOwner;

  // ======================================================
  // CEK BOLEH GENERATE PDF
  // ======================================================

  const canGeneratePdf =
    !loadingUser &&
    !loading &&
    Boolean(permit) &&
    permitStatus === "DISETUJUI" &&
    isPermitOwner &&
    !permit.surat_pdf_path;

  // ======================================================
  // CEK BOLEH UPLOAD FOTO AKTIVITAS
  // ======================================================

  const hasActivityEvidence =
    Boolean(
      permit &&
        (permit.evidences || []).some(
          (item) => item.type === "ACTIVITY_PHOTO"
        )
    );

  const canUploadActivity =
    !loadingUser &&
    !loading &&
    Boolean(permit) &&
    isPermitOwner &&
    (
      permitStatus === "SURAT TERSEDIA" ||
      permitStatus === "SEDANG IZIN"
    ) &&
    !hasActivityEvidence;

  // ======================================================
  // CEK BOLEH UPLOAD FOTO BUKTI KEMBALI
  // ======================================================

  const hasReturnEvidence =
    Boolean(
      permit &&
        (permit.evidences || []).some(
          (item) => item.type === "RETURN_PHOTO"
        )
    );

  const canUploadReturn =
    !loadingUser &&
    !loading &&
    Boolean(permit) &&
    isPermitOwner &&
    (
      permitStatus === "SEDANG IZIN" ||
      permitStatus === "MENUNGGU PENYELESAIAN"
    ) &&
    !hasReturnEvidence;

  // ======================================================
  // CEK BOLEH UPLOAD SURAT BERTANDA TANGAN
  // ======================================================

  const hasSignedLetterEvidence =
    Boolean(
      permit &&
        (permit.evidences || []).some(
          (item) => item.type === "SIGNED_LETTER_PHOTO"
        )
    );

  const canUploadSignedLetter =
    !loadingUser &&
    !loading &&
    Boolean(permit) &&
    permitStatus === "MENUNGGU PENYELESAIAN" &&
    isPermitOwner &&
    !hasSignedLetterEvidence;

  // ======================================================
  // CEK BOLEH MENYELESAIKAN IZIN
  // ======================================================

  const canCompletePermit =
    !loadingUser &&
    !loading &&
    Boolean(permit) &&
    permitStatus === "MENUNGGU PENYELESAIAN" &&
    isPermitOwner &&
    hasActivityEvidence &&
    hasReturnEvidence &&
    hasSignedLetterEvidence &&
    Boolean(permit.jam_kembali);

  // ======================================================
  // NAVIGATION
  // ======================================================

  const handleBack = () => {
    // Kembali ke halaman asal (Dashboard, Riwayat, atau Monitoring).
    // Jika detail dibuka langsung tanpa riwayat navigasi, gunakan fallback aman.
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/riwayat-izin", { replace: true });
    }
  };

  const handleEdit = () => {
    if (!canEditRevision) {
      return;
    }

    navigate("/izin/ajukan", {
      state: {
        permit,
      },
    });
  };

  // ======================================================
  // DOWNLOAD PDF
  // ======================================================

  const handleDownload = async () => {
    if (!permit?.id || !permit?.surat_pdf_path) {
      return;
    }

    try {
      const response = await api.get(
        `/permits/${permit.id}/pdf`,
        {
          responseType: "blob",
        }
      );

      const blob = new Blob(
        [response.data],
        { type: "application/pdf" }
      );

      const fileUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = fileUrl;
      link.download = `surat-izin-${permit.id}.pdf`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.setTimeout(() => {
        window.URL.revokeObjectURL(fileUrl);
      }, 1000);
    } catch (error) {
      console.error("Gagal mengunduh surat izin:", error);
      window.alert(
        "Surat izin gagal diunduh. Periksa koneksi, sesi login, dan akses akun Anda."
      );
    }
  };

  // ======================================================
  // GENERATE PDF
  // ======================================================

  const handleGeneratePdf = async () => {
    setPdfMessage("");

    if (!canGeneratePdf) {
      return;
    }

    try {
      setPdfLoading(true);

      const response =
        await api.post(
          `/permits/${id}/generate-pdf`
        );

      console.log(
        "Response generate PDF:",
        response.data
      );

      setPdfMessage(
        response.data?.message ||
          "Surat izin berhasil dibuat."
      );

      // Ambil data terbaru
      // agar status menjadi SURAT TERSEDIA
      // dan surat_pdf_path ikut terisi.
      await fetchPermit();
    } catch (error) {
      console.error(
        "Gagal membuat surat PDF:",
        error
      );

      if (
        error.response?.status === 401
      ) {
        setPdfMessage(
          "Sesi login telah berakhir. Silakan login kembali."
        );
        return;
      }

      if (
        error.response?.status === 403
      ) {
        setPdfMessage(
          error.response?.data?.message ||
            "Anda tidak memiliki hak untuk membuat surat izin."
        );
        return;
      }

      if (
        error.response?.status === 422
      ) {
        const errors =
          error.response?.data?.errors;

        if (errors) {
          const firstError =
            Object.values(errors)[0]?.[0];

          setPdfMessage(
            firstError ||
              error.response?.data?.message ||
              "Data surat tidak valid."
          );
        } else {
          setPdfMessage(
            error.response?.data?.message ||
              "Surat izin tidak dapat dibuat."
          );
        }

        return;
      }

      setPdfMessage(
        error.response?.data?.message ||
          "Terjadi kesalahan saat membuat surat izin."
      );
    } finally {
      setPdfLoading(false);
    }
  };

  // ======================================================
  // CAMERA
  // ======================================================

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) => track.stop());

      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraOpen(false);
    setCameraStarting(false);
  };

  useEffect(() => {
    if (!cameraOpen) {
      return;
    }

    const video = videoRef.current;
    const stream = streamRef.current;

    if (!video || !stream) {
      return;
    }

    video.srcObject = stream;

    const playVideo = async () => {
      try {
        await video.play();
      } catch (error) {
        console.error(
          "Gagal menjalankan preview kamera:",
          error
        );
      }
    };

    playVideo();
  }, [cameraOpen]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) => track.stop());
      }
    };
  }, []);

  const handleOpenCamera = async () => {
    setActivityMessage("");
    setCameraError("");
    setCameraMode("activity");

    if (!canUploadActivity) {
      setActivityMessage(
        "Foto aktivitas belum dapat diunggah pada tahap ini."
      );
      return;
    }

    if (
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      setCameraError(
        "Browser ini tidak mendukung akses kamera. Silakan gunakan browser yang mendukung kamera."
      );
      setCameraOpen(true);
      return;
    }

    try {
      setCameraStarting(true);

      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: {
              ideal: "environment",
            },
            width: {
              ideal: 1280,
            },
            height: {
              ideal: 720,
            },
          },
          audio: false,
        });

      streamRef.current = stream;
      setCameraOpen(true);
    } catch (error) {
      console.error(
        "Gagal membuka kamera:",
        error
      );

      if (error.name === "NotAllowedError") {
        setCameraError(
          "Akses kamera ditolak. Izinkan penggunaan kamera pada pengaturan browser, lalu coba lagi."
        );
      } else if (
        error.name === "NotFoundError"
      ) {
        setCameraError(
          "Kamera tidak ditemukan pada perangkat ini."
        );
      } else {
        setCameraError(
          "Kamera tidak dapat dibuka. Pastikan kamera tersedia dan tidak sedang digunakan aplikasi lain."
        );
      }

      setCameraOpen(true);
    } finally {
      setCameraStarting(false);
    }
  };

  const handleOpenReturnCamera = async () => {
    setReturnMessage("");
    setCameraError("");

    if (!canUploadReturn) {
      setReturnMessage(
        "Foto bukti kembali belum dapat diunggah pada tahap ini."
      );
      return;
    }

    if (!returnTime) {
      setReturnMessage(
        "Isi waktu kembali aktual terlebih dahulu."
      );
      return;
    }

    if (
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      setCameraMode("return");
      setCameraError(
        "Browser ini tidak mendukung akses kamera. Silakan gunakan browser yang mendukung kamera."
      );
      setCameraOpen(true);
      return;
    }

    try {
      setCameraMode("return");
      setCameraStarting(true);

      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: {
              ideal: "user",
            },
            width: {
              ideal: 1280,
            },
            height: {
              ideal: 720,
            },
          },
          audio: false,
        });

      streamRef.current = stream;
      setCameraOpen(true);
    } catch (error) {
      console.error(
        "Gagal membuka kamera untuk bukti kembali:",
        error
      );

      if (error.name === "NotAllowedError") {
        setCameraError(
          "Akses kamera ditolak. Izinkan penggunaan kamera pada pengaturan browser, lalu coba lagi."
        );
      } else if (
        error.name === "NotFoundError"
      ) {
        setCameraError(
          "Kamera tidak ditemukan pada perangkat ini."
        );
      } else {
        setCameraError(
          "Kamera tidak dapat dibuka. Pastikan kamera tersedia dan tidak sedang digunakan aplikasi lain."
        );
      }

      setCameraOpen(true);
    } finally {
      setCameraStarting(false);
    }
  };

  // ======================================================
  // UPLOAD FOTO BUKTI KEMBALI
  // ======================================================

  const uploadReturnFile = async (file) => {
    setReturnMessage("");

    if (!file) {
      return false;
    }

    if (!canUploadReturn) {
      setReturnMessage(
        "Foto bukti kembali belum dapat diunggah pada tahap ini."
      );
      return false;
    }

    if (!returnTime) {
      setReturnMessage(
        "Waktu kembali aktual wajib diisi."
      );
      return false;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setReturnMessage(
        "Format foto harus JPG, JPEG, PNG, atau WEBP."
      );
      return false;
    }

    if (file.size > MAX_EVIDENCE_FILE_SIZE) {
      setReturnMessage(
        `Ukuran foto maksimal ${Math.round(MAX_EVIDENCE_FILE_SIZE / (1024 * 1024))} MB.`
      );
      return false;
    }

    try {
      setReturnUploadLoading(true);

      const formData = new FormData();

      formData.append("type", "RETURN_PHOTO");
      formData.append("image", file);
      formData.append("file", file);
      formData.append("jam_kembali", returnTime);
      formData.append("captured_at", new Date().toISOString());

      const response = await api.post(
        `/permits/${id}/evidences`,
        formData
      );

      console.log(
        "Response upload foto bukti kembali:",
        response.data
      );

      setReturnMessage(
        response.data?.message ||
          "Foto bukti kembali berhasil diunggah."
      );

      await fetchPermit();

      return true;
    } catch (error) {
      console.error(
        "Gagal mengunggah foto bukti kembali:",
        error
      );

      if (error.response?.status === 401) {
        setReturnMessage(
          "Sesi login telah berakhir. Silakan login kembali."
        );
        return false;
      }

      if (error.response?.status === 403) {
        setReturnMessage(
          error.response?.data?.message ||
            "Anda tidak memiliki hak untuk mengunggah foto bukti kembali."
        );
        return false;
      }

      if (error.response?.status === 422) {
        const errors = error.response?.data?.errors;

        if (errors) {
          const messages = Object.values(errors)
            .flat()
            .filter(Boolean);

          setReturnMessage(
            messages.join(" ") ||
              error.response?.data?.message ||
              "Foto bukti kembali tidak valid."
          );
        } else {
          setReturnMessage(
            error.response?.data?.message ||
              "Foto bukti kembali tidak dapat diunggah."
          );
        }

        return false;
      }

      setReturnMessage(
        error.response?.data?.message ||
          "Terjadi kesalahan saat mengunggah foto bukti kembali."
      );

      return false;
    } finally {
      setReturnUploadLoading(false);
    }
  };

  // ======================================================
  // KOMPRES FOTO KAMERA
  // ======================================================

  const createCameraFile = async (video, filePrefix = "aktivitas") => {
    const maxWidth = 1280;
    const maxHeight = 720;

    const sourceWidth =
      video.videoWidth || maxWidth;

    const sourceHeight =
      video.videoHeight || maxHeight;

    const scale = Math.min(
      1,
      maxWidth / sourceWidth,
      maxHeight / sourceHeight
    );

    const width = Math.max(1, Math.round(sourceWidth * scale));
    const height = Math.max(1, Math.round(sourceHeight * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Canvas kamera tidak tersedia.");
    }

    context.drawImage(video, 0, 0, width, height);

    const blob = await new Promise((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", 0.78);
    });

    if (!blob) {
      throw new Error("Foto tidak berhasil dibuat dari kamera.");
    }

    return new File(
      [blob],
      `foto-${filePrefix}-${permit.id}-${Date.now()}.jpg`,
      { type: "image/jpeg" }
    );
  };

  // ======================================================
  // UPLOAD FOTO AKTIVITAS
  // ======================================================

  const uploadActivityFile = async (file) => {
    setActivityMessage("");

    if (!file) {
      return false;
    }

    if (!canUploadActivity) {
      setActivityMessage(
        "Foto aktivitas belum dapat diunggah pada tahap ini."
      );
      return false;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setActivityMessage(
        "Format foto harus JPG, JPEG, PNG, atau WEBP."
      );
      return false;
    }

    if (file.size > MAX_EVIDENCE_FILE_SIZE) {
      setActivityMessage(
        `Ukuran foto maksimal ${Math.round(MAX_EVIDENCE_FILE_SIZE / (1024 * 1024))} MB.`
      );
      return false;
    }

    try {
      setActivityUploadLoading(true);

      const formData = new FormData();

      formData.append(
        "type",
        "ACTIVITY_PHOTO"
      );

      formData.append(
        "image",
        file
      );

      // Kirim juga dengan key "file" agar kompatibel
      // dengan validasi backend apabila memakai nama field file.
      formData.append(
        "file",
        file
      );

      // Waktu pengambilan bukti.
      formData.append(
        "captured_at",
        new Date().toISOString()
      );

      const response =
        await api.post(
          `/permits/${id}/evidences`,
          formData
        );

      console.log(
        "Response upload foto aktivitas:",
        response.data
      );

      setActivityMessage(
        response.data?.message ||
          "Foto aktivitas berhasil diunggah."
      );

      await fetchPermit();

      return true;
    } catch (error) {
      console.error(
        "Gagal mengunggah foto aktivitas:",
        error
      );

      if (
        error.response?.status === 401
      ) {
        setActivityMessage(
          "Sesi login telah berakhir. Silakan login kembali."
        );
        return false;
      }

      if (
        error.response?.status === 403
      ) {
        setActivityMessage(
          error.response?.data?.message ||
            "Anda tidak memiliki hak untuk mengunggah foto aktivitas."
        );
        return false;
      }

      if (
        error.response?.status === 422
      ) {
        const errors =
          error.response?.data?.errors;

        if (errors) {
          const messages = Object.values(errors)
            .flat()
            .filter(Boolean);

          setActivityMessage(
            messages.join(" ") ||
              error.response?.data?.message ||
              "Foto aktivitas tidak valid."
          );
        } else {
          setActivityMessage(
            error.response?.data?.message ||
              "Foto aktivitas tidak dapat diunggah."
          );
        }

        return false;
      }

      setActivityMessage(
        error.response?.data?.message ||
          "Terjadi kesalahan saat mengunggah foto aktivitas."
      );

      return false;
    } finally {
      setActivityUploadLoading(false);
    }
  };

  const handleActivityUpload = async (
    event
  ) => {
    const file =
      event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    await uploadActivityFile(file);
  };

  const handleCapturePhoto = async () => {
    setCameraError("");
    setActivityMessage("");

    if (!canUploadActivity) {
      setActivityMessage(
        "Foto aktivitas belum dapat diunggah pada tahap ini."
      );
      return;
    }

    const video =
      videoRef.current;

    if (!video) {
      setCameraError(
        "Preview kamera belum siap. Silakan coba lagi."
      );
      return;
    }

    if (
      video.readyState <
      HTMLMediaElement.HAVE_CURRENT_DATA
    ) {
      setCameraError(
        "Kamera belum siap mengambil foto. Tunggu sebentar lalu coba lagi."
      );
      return;
    }

    try {
      const file =
        await createCameraFile(video);

      const success =
        await uploadActivityFile(file);

      if (success) {
        stopCamera();
      }
    } catch (error) {
      console.error(
        "Gagal mengambil foto dari kamera:",
        error
      );

      setActivityMessage(
        error.message ||
          "Foto tidak dapat diambil dari kamera."
      );
    }
  };

  const handleCaptureReturnPhoto = async () => {
    setCameraError("");
    setReturnMessage("");

    if (!canUploadReturn) {
      setReturnMessage(
        "Foto bukti kembali belum dapat diunggah pada tahap ini."
      );
      return;
    }

    if (!returnTime) {
      setReturnMessage(
        "Isi waktu kembali aktual terlebih dahulu."
      );
      return;
    }

    const video = videoRef.current;

    if (!video) {
      setCameraError(
        "Preview kamera belum siap. Silakan coba lagi."
      );
      return;
    }

    if (
      video.readyState <
      HTMLMediaElement.HAVE_CURRENT_DATA
    ) {
      setCameraError(
        "Kamera belum siap mengambil foto. Tunggu sebentar lalu coba lagi."
      );
      return;
    }

    try {
      const file = await createCameraFile(video);
      const returnFile = new File(
        [file],
        `foto-kembali-${permit.id}-${Date.now()}.jpg`,
        { type: "image/jpeg" }
      );

      const success =
        await uploadReturnFile(returnFile);

      if (success) {
        stopCamera();
      }
    } catch (error) {
      console.error(
        "Gagal mengambil foto bukti kembali:",
        error
      );

      setReturnMessage(
        error.message ||
          "Foto bukti kembali tidak dapat diambil dari kamera."
      );
    }
  };

  // ======================================================
  // SIGNED LETTER - OPEN CAMERA
  // ======================================================

  const handleOpenSignedLetterCamera = async () => {
    setSignedLetterMessage("");
    setCameraError("");
    setCameraMode("signed_letter");

    if (!canUploadSignedLetter) {
      setSignedLetterMessage(
        "Foto surat bertanda tangan belum dapat diunggah pada tahap ini."
      );
      return;
    }

    if (
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      setCameraError(
        "Browser ini tidak mendukung akses kamera. Silakan gunakan browser yang mendukung kamera atau pilih file dari folder."
      );
      setCameraOpen(true);
      return;
    }

    try {
      setCameraStarting(true);
      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

      streamRef.current = stream;
      setCameraOpen(true);
    } catch (error) {
      console.error(
        "Gagal membuka kamera untuk surat bertanda tangan:",
        error
      );

      if (error.name === "NotAllowedError") {
        setCameraError(
          "Akses kamera ditolak. Izinkan penggunaan kamera pada pengaturan browser, lalu coba lagi atau pilih file dari folder."
        );
      } else if (error.name === "NotFoundError") {
        setCameraError(
          "Kamera tidak ditemukan pada perangkat ini. Silakan pilih file dari folder."
        );
      } else {
        setCameraError(
          "Kamera tidak dapat dibuka. Silakan coba lagi atau pilih file dari folder."
        );
      }

      setCameraOpen(true);
    } finally {
      setCameraStarting(false);
    }
  };

  // ======================================================
  // SIGNED LETTER - UPLOAD FILE
  // ======================================================

  const uploadSignedLetterFile = async (file) => {
    setSignedLetterMessage("");

    if (!file) {
      return false;
    }

    if (!canUploadSignedLetter) {
      setSignedLetterMessage(
        "Foto surat bertanda tangan belum dapat diunggah pada tahap ini."
      );
      return false;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setSignedLetterMessage(
        "Format foto harus JPG, JPEG, PNG, atau WEBP."
      );
      return false;
    }

    if (file.size > MAX_EVIDENCE_FILE_SIZE) {
      setSignedLetterMessage(
        `Ukuran foto maksimal ${Math.round(MAX_EVIDENCE_FILE_SIZE / (1024 * 1024))} MB.`
      );
      return false;
    }

    try {
      setSignedLetterUploadLoading(true);

      const formData = new FormData();
      formData.append("type", "SIGNED_LETTER_PHOTO");
      formData.append("image", file);
      formData.append("file", file);
      formData.append(
        "captured_at",
        new Date().toISOString()
      );

      const response = await api.post(
        `/permits/${id}/evidences`,
        formData
      );

      console.log(
        "Response upload surat bertanda tangan:",
        response.data
      );

      setSignedLetterMessage(
        response.data?.message ||
          "Foto surat bertanda tangan berhasil diunggah."
      );

      await fetchPermit();
      return true;
    } catch (error) {
      console.error(
        "Gagal mengunggah surat bertanda tangan:",
        error
      );

      if (error.response?.status === 401) {
        setSignedLetterMessage(
          "Sesi login telah berakhir. Silakan login kembali."
        );
        return false;
      }

      if (error.response?.status === 403) {
        setSignedLetterMessage(
          error.response?.data?.message ||
            "Anda tidak memiliki hak untuk mengunggah surat bertanda tangan."
        );
        return false;
      }

      if (error.response?.status === 422) {
        const errors = error.response?.data?.errors;

        if (errors) {
          const messages = Object.values(errors)
            .flat()
            .filter(Boolean);

          setSignedLetterMessage(
            messages.join(" ") ||
              error.response?.data?.message ||
              "Foto surat bertanda tangan tidak valid."
          );
        } else {
          setSignedLetterMessage(
            error.response?.data?.message ||
              "Foto surat bertanda tangan tidak dapat diunggah."
          );
        }

        return false;
      }

      setSignedLetterMessage(
        error.response?.data?.message ||
          "Terjadi kesalahan saat mengunggah surat bertanda tangan."
      );
      return false;
    } finally {
      setSignedLetterUploadLoading(false);
    }
  };

  const handleSignedLetterUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    await uploadSignedLetterFile(file);
  };

  const handleCaptureSignedLetterPhoto = async () => {
    setCameraError("");
    setSignedLetterMessage("");

    if (!canUploadSignedLetter) {
      setSignedLetterMessage(
        "Foto surat bertanda tangan belum dapat diunggah pada tahap ini."
      );
      return;
    }

    const video = videoRef.current;

    if (!video) {
      setCameraError(
        "Preview kamera belum siap. Silakan coba lagi."
      );
      return;
    }

    if (
      video.readyState <
      HTMLMediaElement.HAVE_CURRENT_DATA
    ) {
      setCameraError(
        "Kamera belum siap mengambil foto. Tunggu sebentar lalu coba lagi."
      );
      return;
    }

    try {
      const file = await createCameraFile(
        video,
        "surat-tanda-tangan"
      );

      const success =
        await uploadSignedLetterFile(file);

      if (success) {
        stopCamera();
      }
    } catch (error) {
      console.error(
        "Gagal mengambil foto surat bertanda tangan:",
        error
      );

      setSignedLetterMessage(
        error.message ||
          "Foto surat bertanda tangan tidak dapat diambil dari kamera."
      );
    }
  };

  // ======================================================
  // COMPLETE PERMIT
  // ======================================================

  const handleCompletePermit = async () => {
    setCompletionMessage("");

    if (!canCompletePermit) {
      setCompletionMessage(
        "Lengkapi Foto Aktivitas, Foto Bukti Kembali, Waktu Kembali Aktual, dan Surat Bertanda Tangan terlebih dahulu."
      );
      return;
    }

    try {
      setCompletionLoading(true);

      const response = await api.post(
        `/permits/${id}/complete`
      );

      console.log(
        "Response penyelesaian izin:",
        response.data
      );

      setCompletionMessage(
        response.data?.message ||
          "Izin berhasil diselesaikan."
      );

      await fetchPermit();
    } catch (error) {
      console.error(
        "Gagal menyelesaikan izin:",
        error
      );

      if (error.response?.status === 401) {
        setCompletionMessage(
          "Sesi login telah berakhir. Silakan login kembali."
        );
        return;
      }

      if (error.response?.status === 403) {
        setCompletionMessage(
          error.response?.data?.message ||
            "Anda tidak memiliki hak untuk menyelesaikan izin ini."
        );
        return;
      }

      if (error.response?.status === 422) {
        const errors = error.response?.data?.errors;

        if (errors) {
          const messages = Object.values(errors)
            .flat()
            .filter(Boolean);

          setCompletionMessage(
            messages.join(" ") ||
              error.response?.data?.message ||
              "Izin belum dapat diselesaikan."
          );
        } else {
          setCompletionMessage(
            error.response?.data?.message ||
              "Izin belum dapat diselesaikan."
          );
        }
        return;
      }

      setCompletionMessage(
        error.response?.data?.message ||
          "Terjadi kesalahan saat menyelesaikan izin."
      );
    } finally {
      setCompletionLoading(false);
    }
  };

  // ======================================================
  // PROCESS APPROVAL
  // ======================================================

  const handleApproval = async (action) => {
    setApprovalMessage("");

    if (
      (action === "REVISI" ||
        action === "TOLAK") &&
      !approvalNote.trim()
    ) {
      setApprovalMessage(
        "Catatan wajib diisi untuk revisi atau penolakan."
      );
      return;
    }

    try {
      setApprovalLoading(action);

      const payload = {
        action,
      };

      if (
        action === "REVISI" ||
        action === "TOLAK"
      ) {
        payload.catatan =
          approvalNote.trim();
      } else {
        payload.catatan =
          approvalNote.trim() ||
          "Pengajuan izin disetujui.";
      }

      const response =
        await api.post(
          `/permits/${id}/approval`,
          payload
        );

      console.log(
        "Response approval:",
        response.data
      );

      setApprovalMessage(
        response.data?.message ||
          "Tindakan approval berhasil diproses."
      );

      setApprovalNote("");

      await fetchPermit();
    } catch (error) {
      console.error(
        "Gagal memproses approval:",
        error
      );

      if (
        error.response?.status === 401
      ) {
        setApprovalMessage(
          "Sesi login telah berakhir. Silakan login kembali."
        );
        return;
      }

      if (
        error.response?.status === 403
      ) {
        setApprovalMessage(
          error.response?.data?.message ||
            "Anda tidak memiliki hak untuk memproses approval ini."
        );
        return;
      }

      if (
        error.response?.status === 422
      ) {
        const errors =
          error.response?.data?.errors;

        if (errors) {
          const firstError =
            Object.values(errors)[0]?.[0];

          setApprovalMessage(
            firstError ||
              error.response?.data?.message ||
              "Data approval tidak valid."
          );
        } else {
          setApprovalMessage(
            error.response?.data?.message ||
              "Approval tidak dapat diproses."
          );
        }

        return;
      }

      setApprovalMessage(
        error.response?.data?.message ||
          "Terjadi kesalahan saat memproses approval."
      );
    } finally {
      setApprovalLoading("");
    }
  };

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F8FC] text-slate-800">
        <TopBar onBack={handleBack} />

        <main className="mx-auto flex min-h-[70vh] w-full max-w-[1120px] items-center justify-center px-4 sm:px-8">
          <div className="text-center">
            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-[#2B308B]" />

            <p className="mt-4 text-sm text-slate-500">
              Memuat detail izin...
            </p>
          </div>
        </main>
      </div>
    );
  }

  // ======================================================
  // ERROR
  // ======================================================

  if (errorMessage || !permit) {
    return (
      <div className="min-h-screen bg-[#F6F8FC] text-slate-800">
        <TopBar onBack={handleBack} />

        <main className="mx-auto w-full max-w-[1120px] px-4 py-10 sm:px-8">
          <div className="rounded-lg border border-red-200 bg-red-50 px-6 py-8 text-center">
            <IconAlertCircle className="mx-auto h-8 w-8 text-red-500" />

            <h2 className="mt-4 text-base font-semibold text-red-800">
              Detail izin tidak dapat ditampilkan
            </h2>

            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-red-700">
              {errorMessage ||
                "Data pengajuan izin tidak ditemukan."}
            </p>

            <button
              type="button"
              onClick={handleBack}
              className={`${BTN_PRIMARY} mt-5`}
            >
              Kembali ke Riwayat
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ======================================================
  // DATA TURUNAN
  // ======================================================

  const statusConfig =
    STATUS_CONFIG[permit.status] ||
    STATUS_CONFIG.DIAJUKAN;

  const statusTone =
    STATUS_TONE[permit.status] || STATUS_TONE.DIAJUKAN;

  const evidences =
    getEvidenceState(permit);

  const approvals =
    permit.approvals || [];

  const latestApproval =
    approvals.length > 0
      ? approvals[
          approvals.length - 1
        ]
      : null;

  const timelineState = (index) =>
    getTimelineState(
      permit,
      index
    );

  // ======================================================
  // DATA TAMPILAN (PRESENTASI SAJA)
  // ======================================================

  const evidenceCount = [
    evidences.activity,
    evidences.return,
    evidences.signed_letter,
  ].filter(Boolean).length;

  const activityEvidence = getEvidenceByType(permit, "ACTIVITY_PHOTO");
  const returnEvidence = getEvidenceByType(permit, "RETURN_PHOTO");
  const signedLetterEvidence = getEvidenceByType(
    permit,
    "SIGNED_LETTER_PHOTO"
  );

  const applicantMeta = [
    permit.user?.jabatan,
    permit.user?.unit?.name,
  ]
    .filter(Boolean)
    .join(" · ");

  const missingEvidence = [];

  if (!hasActivityEvidence) {
    missingEvidence.push("foto kegiatan");
  }

  if (!hasReturnEvidence) {
    missingEvidence.push("foto kembali");
  }

  if (!hasSignedLetterEvidence) {
    missingEvidence.push("surat bertanda tangan");
  }

  let nextAction = {
    tone: "info",
    title: statusConfig.label,
    text: "Pantau perkembangan pengajuan ini pada halaman ini.",
  };

  if (permitStatus === "DIAJUKAN") {
    nextAction = canProcessApproval
      ? {
          tone: "info",
          title: "Menunggu keputusan Anda",
          text: "Periksa pengajuan ini, lalu setujui, minta revisi, atau tolak pada panel Persetujuan.",
        }
      : {
          tone: "warn",
          title: "Menunggu persetujuan",
          text: "Pengajuan sedang diproses oleh atasan yang berwenang.",
        };
  } else if (permitStatus === "REVISI") {
    nextAction = canEditRevision
      ? {
          tone: "warn",
          title: "Pengajuan perlu diperbaiki",
          text: "Baca catatan atasan pada bagian Persetujuan, lalu perbaiki dan ajukan kembali.",
        }
      : {
          tone: "warn",
          title: "Menunggu perbaikan pemohon",
          text: "Pengajuan dikembalikan kepada pemohon untuk diperbaiki.",
        };
  } else if (permitStatus === "DITOLAK") {
    nextAction = {
      tone: "danger",
      title: "Pengajuan ditolak",
      text: "Proses dihentikan. Alasan penolakan dapat dilihat pada bagian Persetujuan.",
    };
  } else if (permitStatus === "DISETUJUI") {
    nextAction = canGeneratePdf
      ? {
          tone: "info",
          title: "Buat surat izin",
          text: "Pengajuan telah disetujui. Buat surat izin pada panel Surat Izin.",
        }
      : {
          tone: "info",
          title: "Pengajuan disetujui",
          text: "Surat izin menunggu untuk dibuat oleh pemohon.",
        };
  } else if (permitStatus === "SURAT TERSEDIA") {
    nextAction = isPermitOwner
      ? {
          tone: "info",
          title: "Surat izin tersedia",
          text: "Unduh surat izin, lalu unggah foto kegiatan saat izin berlangsung.",
        }
      : {
          tone: "info",
          title: "Surat izin tersedia",
          text: "Pemohon dapat mengunduh surat izin dan menjalankan izin keluar kantor.",
        };
  } else if (permitStatus === "SEDANG IZIN") {
    nextAction = isPermitOwner
      ? {
          tone: "info",
          title: "Izin sedang berlangsung",
          text: "Setelah kembali ke kantor, isi waktu kembali aktual dan unggah foto bukti kembali.",
        }
      : {
          tone: "info",
          title: "Izin sedang berlangsung",
          text: "Pemohon sedang menjalankan izin keluar kantor.",
        };
  } else if (permitStatus === "MENUNGGU PENYELESAIAN") {
    if (canCompletePermit) {
      nextAction = {
        tone: "success",
        title: "Bukti sudah lengkap",
        text: "Klik Selesaikan Izin pada panel Penyelesaian untuk menutup pengajuan.",
      };
    } else if (isPermitOwner && missingEvidence.length > 0) {
      nextAction = {
        tone: "warn",
        title: "Lengkapi bukti penyelesaian",
        text: `Belum tersedia: ${missingEvidence.join(", ")}.`,
      };
    } else {
      nextAction = {
        tone: "warn",
        title: "Menunggu penyelesaian",
        text: "Sistem menunggu bukti penyelesaian izin.",
      };
    }
  } else if (permitStatus === "SELESAI") {
    nextAction = {
      tone: "success",
      title: "Izin telah selesai",
      text: "Seluruh proses izin telah diselesaikan. Tidak ada tindakan lanjutan.",
    };
  }

  const bannerTone =
    BANNER_TONE[nextAction.tone] || BANNER_TONE.info;

  // ======================================================
  // PAGE
  // ======================================================

  return (
    <div className="min-h-screen bg-[#F6F8FC] text-slate-800">
      {/* ==================================================
          TOPBAR
      ================================================== */}

      <TopBar onBack={handleBack} />

      {/* ==================================================
          MAIN
      ================================================== */}

      <main className="mx-auto w-full max-w-[1120px] px-4 py-6 sm:px-8 lg:py-8">
        {/* ==================================================
            HEADER
        ================================================== */}

        <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Detail Pengajuan Izin Keluar Kantor
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#1E2260] sm:text-[28px]">
              {getJenisIzinLabel(permit.jenis_izin)}
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              {formatTanggal(permit.tanggal_izin)} ·{" "}
              {formatJam(permit.jam_keluar)} –{" "}
              {formatJam(permit.estimasi_kembali)}
            </p>
          </div>

          <div className="flex flex-col items-start gap-3 sm:items-end">
            <span
              className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-semibold ${statusTone.badge}`}
            >
              <span
                className={`h-2 w-2 rounded-full ${statusTone.dot}`}
              />
              {statusConfig.label}
            </span>

            {(canEditRevision || permit.surat_pdf_path) && (
              <div className="flex flex-wrap gap-2">
                {/* PERBAIKI REVISI */}

                {canEditRevision && (
                  <button
                    type="button"
                    onClick={handleEdit}
                    className="inline-flex h-10 items-center justify-center rounded-md bg-orange-600 px-4 text-sm font-semibold text-white transition hover:bg-orange-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-300/50"
                  >
                    Perbaiki Pengajuan
                  </button>
                )}

                {/* DOWNLOAD SURAT */}

                {permit.surat_pdf_path && (
                  <button
                    type="button"
                    onClick={handleDownload}
                    className={BTN_SECONDARY}
                  >
                    <IconFile className="h-4 w-4" />
                    Download Surat
                  </button>
                )}
              </div>
            )}
          </div>
        </section>

        {/* ==================================================
            TINDAKAN BERIKUTNYA
        ================================================== */}

        <section
          className={`mt-5 flex items-start gap-3 rounded-lg border px-4 py-3.5 ${bannerTone.box}`}
        >
          <IconAlertCircle
            className={`mt-0.5 h-5 w-5 shrink-0 ${bannerTone.icon}`}
          />

          <div className="min-w-0">
            <p className={`text-sm font-semibold ${bannerTone.title}`}>
              {nextAction.title}
            </p>

            <p className={`mt-0.5 text-sm leading-6 ${bannerTone.text}`}>
              {nextAction.text}
            </p>
          </div>
        </section>

        {/* ==================================================
            RINGKASAN IZIN
        ================================================== */}

        <div className="mt-5">
          <Panel title="Ringkasan Pengajuan">
            <dl className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Pemohon">
                {permit.user?.name || "-"}

                {applicantMeta && (
                  <span className="mt-0.5 block text-xs font-normal text-slate-500">
                    {applicantMeta}
                  </span>
                )}
              </Field>

              <Field label="Jenis / Keperluan">
                {getJenisIzinLabel(permit.jenis_izin)}
              </Field>

              <Field label="Tanggal Izin">
                <span className="inline-flex items-center gap-2">
                  <IconCalendar className="h-4 w-4 shrink-0 text-[#5A81FA]" />
                  {formatTanggal(permit.tanggal_izin)}
                </span>
              </Field>

              <Field label="Jam Keluar">
                <span className="inline-flex items-center gap-2">
                  <IconClock className="h-4 w-4 shrink-0 text-[#5A81FA]" />
                  {formatJam(permit.jam_keluar)}
                </span>
              </Field>

              <Field label="Estimasi Kembali">
                <span className="inline-flex items-center gap-2">
                  <IconClock className="h-4 w-4 shrink-0 text-[#5A81FA]" />
                  {formatJam(permit.estimasi_kembali)}
                </span>
              </Field>

              <Field label="Waktu Kembali Aktual">
                {formatJam(permit.jam_kembali)}
              </Field>

              <Field label="Alasan / Keterangan" className="sm:col-span-2 lg:col-span-3">
                <span className="block rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-normal leading-6 text-slate-700">
                  {permit.alasan || "-"}
                </span>
              </Field>
            </dl>
          </Panel>
        </div>

        {/* ==================================================
            TIMELINE
        ================================================== */}

        <div className="mt-5">
          <Panel
            title="Progres Pengajuan"
            subtitle="Tahapan proses izin dari pengajuan hingga selesai."
          >
            <ol className="flex flex-col lg:flex-row">
              {TIMELINE.map((item, index) => {
                const state = timelineState(index);

                return (
                  <li
                    key={item.key}
                    className="relative flex gap-3 pb-6 last:pb-0 lg:min-w-0 lg:flex-1 lg:flex-col lg:items-center lg:gap-3 lg:px-1 lg:pb-0 lg:text-center"
                  >
                    {index < TIMELINE.length - 1 && (
                      <div
                        className={`absolute left-4 top-8 h-[calc(100%-8px)] w-px lg:left-1/2 lg:top-4 lg:h-px lg:w-full ${
                          state === "done"
                            ? "bg-[#2B308B]"
                            : "bg-slate-200"
                        }`}
                      />
                    )}

                    <div
                      className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${
                        state === "done"
                          ? "border-[#2B308B] bg-[#2B308B] text-white"
                          : state === "current"
                          ? "border-[#2B308B] bg-white text-[#2B308B]"
                          : state === "revision"
                          ? "border-orange-400 bg-orange-50 text-orange-600"
                          : state === "rejected"
                          ? "border-red-400 bg-red-50 text-red-600"
                          : "border-slate-200 bg-white text-slate-300"
                      }`}
                    >
                      {state === "done" ? (
                        <IconCheck className="h-4 w-4" />
                      ) : (
                        <span className="h-2 w-2 rounded-full bg-current" />
                      )}
                    </div>

                    <div className="min-w-0 pt-1 lg:pt-0">
                      <p
                        className={`text-sm font-semibold lg:text-xs ${
                          state === "inactive"
                            ? "text-slate-400"
                            : "text-slate-800"
                        }`}
                      >
                        {item.title}
                      </p>

                      <p
                        className={`mt-0.5 text-[13px] leading-5 lg:hidden ${
                          state === "inactive"
                            ? "text-slate-400"
                            : "text-slate-500"
                        }`}
                      >
                        {item.description}
                      </p>

                      {state === "revision" && (
                        <p className="mt-1.5 text-xs font-medium text-orange-700">
                          Pengajuan dikembalikan untuk diperbaiki.
                        </p>
                      )}

                      {state === "rejected" && (
                        <p className="mt-1.5 text-xs font-medium text-red-700">
                          Pengajuan dihentikan pada tahap persetujuan.
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </Panel>
        </div>

        {/* ==================================================
            KONTEN UTAMA: BUKTI (kiri) + PANEL TINDAKAN (kanan)
        ================================================== */}

        <div className="mt-5 grid grid-cols-1 items-start gap-5 lg:grid-cols-3">
          {/* ------------------------------------------------
              KOLOM KIRI: BUKTI PENYELESAIAN
          ------------------------------------------------ */}

          <div className="lg:col-span-2">
            <Panel
              title="Bukti Penyelesaian"
              subtitle="Tiga bukti diperlukan sebelum izin dapat diselesaikan."
              flush
              aside={
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    evidenceCount === 3
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {evidenceCount} dari 3 tersedia
                </span>
              }
            >
              <ul className="divide-y divide-slate-100">
                {/* ACTIVITY */}

                <EvidenceItem
                  icon={<IconCamera className="h-5 w-5" />}
                  title="Foto Kegiatan"
                  description="Foto kegiatan saat izin berlangsung. Ambil dari kamera atau pilih dari folder."
                  done={evidences.activity}
                  permitId={permit.id}
                  evidence={activityEvidence}
                >
                  {activityMessage && (
                    <Notice>{activityMessage}</Notice>
                  )}

                  {canUploadActivity && (
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <button
                        type="button"
                        onClick={handleOpenCamera}
                        disabled={
                          activityUploadLoading ||
                          cameraStarting
                        }
                        className={BTN_PRIMARY}
                      >
                        <IconCamera className="h-4 w-4" />
                        {cameraStarting
                          ? "Membuka Kamera..."
                          : activityUploadLoading
                          ? "Mengunggah..."
                          : "Ambil Foto"}
                      </button>

                      <label className={`${BTN_SECONDARY} cursor-pointer`}>
                        <IconFile className="h-4 w-4" />
                        Pilih dari Folder

                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          disabled={activityUploadLoading}
                          onChange={handleActivityUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </EvidenceItem>

                {/* RETURN */}

                <EvidenceItem
                  icon={<IconCamera className="h-5 w-5" />}
                  title="Foto Kembali"
                  description="Foto saat sudah kembali di kantor, diambil langsung dari kamera."
                  done={evidences.return}
                  permitId={permit.id}
                  evidence={returnEvidence}
                >
                  {evidences.return && permit.jam_kembali && (
                    <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2.5">
                      <p className="text-xs font-medium text-emerald-700">
                        Waktu kembali aktual
                      </p>

                      <p className="mt-0.5 text-sm font-semibold text-emerald-900">
                        {formatJam(permit.jam_kembali)}
                      </p>
                    </div>
                  )}

                  {returnMessage && (
                    <Notice>{returnMessage}</Notice>
                  )}

                  {canUploadReturn && (
                    <div>
                      <label
                        htmlFor="returnTime"
                        className="mb-1.5 block text-sm font-semibold text-slate-700"
                      >
                        Waktu Kembali Aktual
                      </label>

                      <input
                        id="returnTime"
                        type="time"
                        value={returnTime}
                        onChange={(e) =>
                          setReturnTime(e.target.value)
                        }
                        disabled={returnUploadLoading}
                        className={`${INPUT_CLASS} h-10 sm:max-w-[180px]`}
                      />

                      <button
                        type="button"
                        onClick={handleOpenReturnCamera}
                        disabled={
                          returnUploadLoading ||
                          cameraStarting
                        }
                        className={`${BTN_PRIMARY} mt-3`}
                      >
                        <IconCamera className="h-4 w-4" />
                        {cameraStarting
                          ? "Membuka Kamera..."
                          : returnUploadLoading
                          ? "Mengunggah..."
                          : "Ambil Foto Kembali"}
                      </button>
                    </div>
                  )}
                </EvidenceItem>

                {/* SIGNED LETTER */}

                <EvidenceItem
                  icon={<IconFile className="h-5 w-5" />}
                  title="Foto / Scan Surat Bertanda Tangan"
                  description="Surat izin yang sudah ditandatangani. Ambil foto langsung atau pilih file dari folder."
                  done={evidences.signed_letter}
                  permitId={permit.id}
                  evidence={signedLetterEvidence}
                >
                  {signedLetterMessage && (
                    <Notice>{signedLetterMessage}</Notice>
                  )}

                  {canUploadSignedLetter && (
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <button
                        type="button"
                        onClick={handleOpenSignedLetterCamera}
                        disabled={
                          signedLetterUploadLoading ||
                          cameraStarting
                        }
                        className={BTN_PRIMARY}
                      >
                        <IconCamera className="h-4 w-4" />
                        {cameraStarting
                          ? "Membuka Kamera..."
                          : signedLetterUploadLoading
                          ? "Mengunggah..."
                          : "Ambil Foto"}
                      </button>

                      <label className={`${BTN_SECONDARY} cursor-pointer`}>
                        <IconFile className="h-4 w-4" />
                        Pilih dari Folder

                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          disabled={signedLetterUploadLoading}
                          onChange={handleSignedLetterUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </EvidenceItem>
              </ul>
            </Panel>
          </div>

          {/* ------------------------------------------------
              KOLOM KANAN: PANEL TINDAKAN
              (di layar kecil tampil sebelum bukti)
          ------------------------------------------------ */}

          <div className="order-first space-y-5 lg:order-none">
            {/* ==================================================
                APPROVAL ACTION
            ================================================== */}

            {canProcessApproval && (
              <Panel
                title="Persetujuan Pengajuan"
                subtitle="Periksa pengajuan, lalu pilih tindakan."
                tone="accent"
              >
                {approvalMessage && (
                  <div className="mb-4">
                    <Notice>{approvalMessage}</Notice>
                  </div>
                )}

                <label
                  htmlFor="approvalNote"
                  className="mb-1.5 block text-sm font-semibold text-slate-800"
                >
                  Catatan
                </label>

                <textarea
                  id="approvalNote"
                  value={approvalNote}
                  onChange={(e) =>
                    setApprovalNote(e.target.value)
                  }
                  disabled={Boolean(approvalLoading)}
                  rows={4}
                  placeholder="Tulis catatan pemeriksaan. Wajib diisi untuk revisi atau penolakan."
                  className={`${INPUT_CLASS} resize-none py-2.5 leading-6`}
                />

                <div className="mt-4 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => handleApproval("APPROVE")}
                    disabled={Boolean(approvalLoading)}
                    className={`${BTN_PRIMARY} w-full`}
                  >
                    {approvalLoading === "APPROVE" ? (
                      "Memproses..."
                    ) : (
                      <>
                        <IconThumbUp className="h-4 w-4" />
                        Setujui
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApproval("REVISI")}
                    disabled={Boolean(approvalLoading)}
                    className="inline-flex h-10 w-full items-center justify-center rounded-md border border-orange-300 bg-white px-4 text-sm font-semibold text-orange-700 transition hover:bg-orange-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-200 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {approvalLoading === "REVISI"
                      ? "Memproses..."
                      : "Minta Revisi"}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApproval("TOLAK")}
                    disabled={Boolean(approvalLoading)}
                    className="inline-flex h-10 w-full items-center justify-center rounded-md border border-red-300 bg-white px-4 text-sm font-semibold text-red-700 transition hover:bg-red-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-red-200 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {approvalLoading === "TOLAK"
                      ? "Memproses..."
                      : "Tolak"}
                  </button>
                </div>
              </Panel>
            )}

            {/* ==================================================
                SURAT IZIN
            ================================================== */}

            {(permitStatus === "DISETUJUI" ||
              permitStatus === "SURAT TERSEDIA" ||
              permit.surat_pdf_path) && (
              <Panel
                title="Surat Izin"
                subtitle="Surat resmi berdasarkan pengajuan yang disetujui."
                aside={
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      permit.surat_pdf_path
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {permit.surat_pdf_path
                      ? "Tersedia"
                      : "Belum dibuat"}
                  </span>
                }
              >
                {pdfMessage && (
                  <div className="mb-4">
                    <Notice>{pdfMessage}</Notice>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-500">
                    <IconFile className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800">
                      Surat Izin Keluar Kantor
                    </p>

                    <p className="mt-0.5 text-[13px] leading-5 text-slate-500">
                      {permit.surat_pdf_path
                        ? "Surat sudah tersedia dan dapat diunduh."
                        : "Pengajuan sudah disetujui. Silakan buat surat izin."}
                    </p>
                  </div>
                </div>

                {(canGeneratePdf || permit.surat_pdf_path) && (
                  <div className="mt-4 flex flex-col gap-2">
                    {canGeneratePdf && (
                      <button
                        type="button"
                        onClick={handleGeneratePdf}
                        disabled={pdfLoading}
                        className={`${BTN_PRIMARY} w-full`}
                      >
                        <IconFile className="h-4 w-4" />

                        {pdfLoading
                          ? "Membuat Surat..."
                          : "Buat Surat Izin"}
                      </button>
                    )}

                    {permit.surat_pdf_path && (
                      <button
                        type="button"
                        onClick={handleDownload}
                        className={`${BTN_SECONDARY} w-full`}
                      >
                        <IconFile className="h-4 w-4" />
                        Download Surat
                      </button>
                    )}
                  </div>
                )}
              </Panel>
            )}

            {/* ==================================================
                COMPLETION
            ================================================== */}

            {permitStatus === "MENUNGGU PENYELESAIAN" &&
              isPermitOwner &&
              canCompletePermit && (
                <Panel
                  title="Penyelesaian Izin"
                  subtitle="Seluruh bukti telah lengkap. Pengajuan siap diselesaikan."
                  tone="success"
                >
                  {completionMessage && (
                    <div className="mb-4">
                      <Notice tone="success">
                        {completionMessage}
                      </Notice>
                    </div>
                  )}

                  <p className="text-sm leading-6 text-slate-600">
                    Foto kegiatan, foto bukti kembali, waktu kembali, dan
                    surat bertanda tangan sudah tersedia.
                  </p>

                  <button
                    type="button"
                    onClick={handleCompletePermit}
                    disabled={completionLoading}
                    className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white transition hover:bg-emerald-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300/50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <IconCheck className="h-4 w-4" />
                    {completionLoading
                      ? "Menyelesaikan..."
                      : "Selesaikan Izin"}
                  </button>
                </Panel>
              )}

            {/* ==================================================
                APPROVAL
            ================================================== */}

            <Panel title="Keputusan Atasan">
              {latestApproval ? (
                <div className="space-y-4">
                  <dl className="grid grid-cols-1 gap-4">
                    <Field label="Pemeriksa / Atasan">
                      {latestApproval.approver?.name ||
                        "Atasan yang berwenang"}
                    </Field>

                    <Field label="Tindakan">
                      <span
                        className={
                          APPROVAL_TONE[latestApproval.action] ||
                          "text-slate-800"
                        }
                      >
                        {getApprovalActionLabel(
                          latestApproval.action
                        )}
                      </span>
                    </Field>

                    <Field label="Waktu">
                      {formatDateTime(latestApproval.acted_at)}
                    </Field>
                  </dl>

                  <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
                    <p className="text-xs font-medium text-slate-500">
                      Catatan
                    </p>

                    <p className="mt-1 text-sm leading-6 text-slate-700">
                      {latestApproval.catatan ||
                        "Tidak ada catatan."}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 py-4">
                  <p className="text-sm font-semibold text-slate-700">
                    Belum ada keputusan atasan
                  </p>

                  <p className="mt-1 text-[13px] leading-5 text-slate-500">
                    Pengajuan masih menunggu proses persetujuan dari
                    atasan yang berwenang.
                  </p>
                </div>
              )}
            </Panel>
          </div>
        </div>
      </main>

      {/* ==================================================
          CAMERA MODAL
      ================================================== */}

      {cameraOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-[#1E2260]">
                  {cameraMode === "return"
                    ? "Ambil Foto Bukti Kembali"
                    : cameraMode === "signed_letter"
                    ? "Ambil Foto Surat Bertanda Tangan"
                    : "Ambil Foto Aktivitas"}
                </h3>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {cameraMode === "return"
                    ? "Pastikan Anda sudah berada di kantor sebelum mengambil foto."
                    : cameraMode === "signed_letter"
                    ? "Arahkan kamera ke surat yang sudah ditandatangani dan pastikan seluruh bagian surat terlihat jelas."
                    : "Pastikan objek kegiatan terlihat jelas sebelum mengambil foto."}
                </p>
              </div>

              <button
                type="button"
                onClick={stopCamera}
                disabled={
                  activityUploadLoading ||
                  returnUploadLoading ||
                  signedLetterUploadLoading
                }
                className="shrink-0 rounded-md px-3 py-2 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Tutup
              </button>
            </div>

            <div className="bg-black">
              {cameraError ? (
                <div className="flex min-h-[280px] items-center justify-center px-6 py-10 text-center">
                  <div>
                    <IconAlertCircle className="mx-auto h-9 w-9 text-red-400" />

                    <p className="mt-4 text-sm leading-6 text-white">
                      {cameraError}
                    </p>
                  </div>
                </div>
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="max-h-[60vh] w-full object-contain"
                />
              )}
            </div>

            <div className="flex flex-col-reverse gap-2 px-5 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={stopCamera}
                disabled={
                  activityUploadLoading ||
                  returnUploadLoading ||
                  signedLetterUploadLoading
                }
                className={BTN_SECONDARY}
              >
                Batal
              </button>

              {!cameraError && (
                <button
                  type="button"
                  onClick={
                    cameraMode === "return"
                      ? handleCaptureReturnPhoto
                      : cameraMode === "signed_letter"
                      ? handleCaptureSignedLetterPhoto
                      : handleCapturePhoto
                  }
                  disabled={
                    activityUploadLoading ||
                    returnUploadLoading ||
                    signedLetterUploadLoading
                  }
                  className={BTN_PRIMARY}
                >
                  <IconCamera className="h-4 w-4" />
                  {activityUploadLoading ||
                  returnUploadLoading ||
                  signedLetterUploadLoading
                    ? "Mengunggah..."
                    : "Ambil Foto"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
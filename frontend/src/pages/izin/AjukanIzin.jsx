import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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

function IconCheckCircle(props) {
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
      <path d="m8.5 12 2.3 2.3 4.7-4.8" />
    </svg>
  );
}

// ======================================================
// HELPERS
// ======================================================

function formatPermitDateForInput(dateValue) {
  if (!dateValue) {
    return "";
  }

  return String(dateValue).slice(0, 10);
}

function formatPermitTimeForInput(timeValue) {
  if (!timeValue) {
    return "";
  }

  return String(timeValue).slice(0, 5);
}

// Gunakan tanggal lokal perangkat, bukan UTC, agar tidak bergeser sehari.
function getTodayLocalDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getCurrentLocalTime() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
}

function getLocalMinutesNow() {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

// ======================================================
// PAGE
// ======================================================

export default function AjukanIzin() {
  const navigate = useNavigate();
  const location = useLocation();

  // Permit dikirim dari DetailIzin ketika mode revisi
  const editPermit = location.state?.permit || null;

  // Mode revisi hanya aktif jika permit memang REVISI
  const isEditMode =
    Boolean(editPermit?.id) &&
    editPermit?.status === "REVISI";

  const [formData, setFormData] = useState({
    jenisIzin: "",
    tanggal: "",
    jamKeluar: "",
    estimasiKembali: "",
    alasan: "",
  });

  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [approvalTargets, setApprovalTargets] = useState([]);
  const [requiresTargetSelection, setRequiresTargetSelection] = useState(false);
  const [approvalTargetId, setApprovalTargetId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [clockNow, setClockNow] = useState(() => new Date());

  // Perbarui batas jam secara berkala jika halaman dibiarkan terbuka.
  useEffect(() => {
    const timer = window.setInterval(() => setClockNow(new Date()), 15000);
    return () => window.clearInterval(timer);
  }, []);

  const today = getTodayLocalDate();
  const currentTime = `${String(clockNow.getHours()).padStart(2, "0")}:${String(clockNow.getMinutes()).padStart(2, "0")}`;
  const isTodaySelected = formData.tanggal === today;

  // ======================================================
  // AMBIL USER DAN PILIHAN PEJABAT PERSETUJUAN
  // ======================================================

  useEffect(() => {
    let active = true;

    const loadApprovalTargets = async () => {
      try {
        const [meResponse, targetsResponse] = await Promise.all([
          api.get("/me"),
          api.get("/approval-targets"),
        ]);

        if (!active) return;

        const user = meResponse.data?.data?.user ?? meResponse.data?.user ?? meResponse.data?.data ?? meResponse.data;
        const targetData = targetsResponse.data?.data ?? targetsResponse.data;
        const targets = targetData?.approval_targets ?? [];

        setCurrentUser(user);
        setRequiresTargetSelection(Boolean(targetData?.requires_selection));
        setApprovalTargets(Array.isArray(targets) ? targets : []);
      } catch (error) {
        console.error("Gagal memuat target persetujuan:", error);
      }
    };

    loadApprovalTargets();
    return () => { active = false; };
  }, []);

  // ======================================================
  // ISI FORM OTOMATIS SAAT MODE REVISI
  // ======================================================

  useEffect(() => {
    if (!isEditMode || !editPermit) {
      return;
    }

    setFormData({
      jenisIzin: editPermit.jenis_izin || "",
      tanggal: formatPermitDateForInput(
        editPermit.tanggal_izin
      ),
      jamKeluar: formatPermitTimeForInput(
        editPermit.jam_keluar
      ),
      estimasiKembali: formatPermitTimeForInput(
        editPermit.estimasi_kembali
      ),
      alasan: editPermit.alasan || "",
    });

    setErrorMessage("");
    setSuccessMessage("");
  }, [isEditMode, editPermit]);

  // ======================================================
  // HANDLE CHANGE
  // ======================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrorMessage("");
    setSuccessMessage("");
  };

  // ======================================================
  // VALIDATION
  // ======================================================

  const validateForm = () => {
    if (!formData.jenisIzin) {
      return "Silakan pilih jenis / keperluan izin.";
    }

    if (!isEditMode && requiresTargetSelection && !approvalTargetId) {
      return "Silakan pilih pejabat yang akan menyetujui izin.";
    }

    if (!formData.tanggal) {
      return "Tanggal izin wajib diisi.";
    }

    const todayAtValidation = getTodayLocalDate();
    if (formData.tanggal < todayAtValidation) {
      return "Tanggal izin tidak boleh sebelum hari ini.";
    }

    if (!formData.jamKeluar) {
      return "Jam keluar wajib diisi.";
    }

    if (!formData.estimasiKembali) {
      return "Perkiraan kembali wajib diisi.";
    }

    if (!formData.alasan.trim()) {
      return "Alasan / keterangan wajib diisi.";
    }

    if (formData.alasan.trim().length < 5) {
      return "Alasan / keterangan minimal 5 karakter.";
    }

    // Untuk izin hari ini, jam keluar harus benar-benar masih akan datang.
    // Input time memiliki ketelitian menit, sehingga menit yang sama dengan
    // waktu sekarang juga dianggap sudah terlewati/tidak valid.
    if (formData.tanggal === todayAtValidation) {
      const [selectedHour, selectedMinute] = formData.jamKeluar
        .split(":")
        .map(Number);
      const selectedMinutes = selectedHour * 60 + selectedMinute;
      const nowMinutes = getLocalMinutesNow();

      if (selectedMinutes <= nowMinutes) {
        return `Jam keluar untuk izin hari ini harus setelah pukul ${getCurrentLocalTime()}.`;
      }
    }

    if (
      formData.estimasiKembali <= formData.jamKeluar
    ) {
      return "Perkiraan kembali harus lebih dari jam keluar.";
    }

    return "";
  };

  // ======================================================
  // SUBMIT
  // ======================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    const validationError = validateForm();

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    try {
      setLoading(true);

      const payload = {
        jenis_izin: formData.jenisIzin,
        tanggal_izin: formData.tanggal,
        jam_keluar: formData.jamKeluar,
        estimasi_kembali: formData.estimasiKembali,
        alasan: formData.alasan.trim(),
        ...(requiresTargetSelection && !isEditMode
          ? { approval_target_id: String(approvalTargetId) }
          : {}),
      };

      let response;

      // ==================================================
      // MODE REVISI
      // ==================================================

      if (isEditMode) {
        response = await api.put(
          `/permits/${editPermit.id}`,
          payload
        );
      } else {
        // ==================================================
        // MODE PENGAJUAN BARU
        // ==================================================

        response = await api.post(
          "/permits",
          payload
        );
      }

      console.log(
        "Response pengajuan:",
        response.data
      );

      setSuccessMessage(
        response.data?.message ||
          (isEditMode
            ? "Pengajuan berhasil diperbaiki dan diajukan kembali."
            : "Pengajuan izin berhasil dikirim.")
      );

      setFormData({
        jenisIzin: "",
        tanggal: "",
        jamKeluar: "",
        estimasiKembali: "",
        alasan: "",
      });
      setApprovalTargetId("");

      setTimeout(() => {
        navigate("/riwayat-izin");
      }, 1000);
    } catch (error) {
      console.error(
        "Error pengajuan izin:",
        error
      );

      // ==================================================
      // ERROR VALIDASI LARAVEL
      // ==================================================

      if (error.response?.status === 422) {
        const errors =
          error.response?.data?.errors;

        if (errors) {
          const firstError =
            Object.values(errors)[0]?.[0];

          setErrorMessage(
            firstError ||
              "Data pengajuan tidak valid. Silakan periksa kembali."
          );
        } else {
          setErrorMessage(
            error.response?.data?.message ||
              "Data pengajuan tidak valid. Silakan periksa kembali."
          );
        }

        return;
      }

      // ==================================================
      // TIDAK MEMILIKI AKSES
      // ==================================================

      if (error.response?.status === 403) {
        setErrorMessage(
          error.response?.data?.message ||
            "Anda tidak memiliki akses untuk mengubah pengajuan ini."
        );

        return;
      }

      // ==================================================
      // SESSION EXPIRED
      // ==================================================

      if (error.response?.status === 401) {
        setErrorMessage(
          "Sesi login telah berakhir. Silakan login kembali."
        );

        return;
      }

      // ==================================================
      // ERROR LAIN
      // ==================================================

      setErrorMessage(
        error.response?.data?.message ||
          "Terjadi kesalahan saat memproses pengajuan. Silakan coba lagi."
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // BACK
  // ======================================================

  const handleCancel = () => {
    if (isEditMode && editPermit?.id) {
      navigate(`/izin/detail/${editPermit.id}`);
      return;
    }

    navigate("/dashboard");
  };

  // ======================================================
  // DYNAMIC TEXT
  // ======================================================

  const pageBadge = isEditMode
    ? "Revisi Pengajuan"
    : "Pengajuan Izin";

  const pageTitle = isEditMode
    ? "Perbaiki Pengajuan Izin"
    : "Ajukan Izin Keluar Kantor";

  const pageDescription = isEditMode
    ? "Perbaiki informasi pengajuan sesuai catatan dari atasan sebelum mengajukannya kembali."
    : "Lengkapi informasi izin berikut dengan benar sebelum mengirim pengajuan kepada atasan.";

  const submitButtonText = isEditMode
    ? "Ajukan Ulang"
    : "Ajukan Izin";

  const cardTitle = isEditMode
    ? "Perbaiki Data Pengajuan"
    : "Data Pengajuan";

  const cardDescription = isEditMode
    ? "Perbarui informasi yang perlu diperbaiki, kemudian ajukan kembali."
    : "Masukkan informasi yang diperlukan untuk pengajuan izin.";

  // ======================================================
  // PAGE
  // ======================================================

  return (
    <div className="min-h-screen bg-[#111927] text-white">

      {/* ==================================================
          HEADER
      ================================================== */}

      <header className="border-b border-white/5 bg-[#27344B]">
        <div
          style={{
            width: "100%",
            maxWidth: "860px",
            margin: "0 auto",
            padding: "14px 20px",
            boxSizing: "border-box",
          }}
        >
          <button
            type="button"
            onClick={handleCancel}
            className="
              inline-flex
              items-center
              gap-2
              rounded-lg
              bg-[#4F79D8]
              px-4
              py-2
              text-sm
              font-medium
              text-white
              shadow-sm
              transition
              hover:bg-[#5C85E5]
            "
          >
            <IconArrowLeft className="h-4 w-4" />

            {isEditMode
              ? "Kembali ke Detail"
              : "Kembali"}
          </button>
        </div>
      </header>

      {/* ==================================================
          CENTER WRAPPER
      ================================================== */}

      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <main
          style={{
            width: "100%",
            maxWidth: "860px",
            padding: "34px 20px 50px",
            boxSizing: "border-box",
          }}
        >

          {/* ==================================================
              PAGE HEADER
          ================================================== */}

          <section className="mb-6">
            <span
              className={`text-xs font-medium ${
                isEditMode
                  ? "text-orange-300"
                  : "text-slate-400"
              }`}
            >
              {pageBadge}
            </span>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {pageTitle}
            </h1>

            <p className="mt-1 text-sm leading-6 text-slate-300">
              {pageDescription}
            </p>
          </section>

          {/* ==================================================
              REVISION INFO
          ================================================== */}

          {isEditMode && (
            <div className="mb-5 rounded-xl border border-orange-300/20 bg-orange-400/10 px-5 py-4">
              <p className="text-sm font-semibold text-orange-200">
                Pengajuan perlu diperbaiki
              </p>

              <p className="mt-1 text-sm leading-6 text-orange-100/80">
                Silakan periksa dan perbaiki data
                pengajuan, kemudian klik{" "}
                <strong>Ajukan Ulang</strong>.
              </p>
            </div>
          )}

          {/* ==================================================
              ERROR
          ================================================== */}

          {errorMessage && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-300/20 bg-red-400/10 px-4 py-4">
              <IconAlertCircle
                className="
                  mt-0.5
                  h-5
                  w-5
                  shrink-0
                  text-red-300
                "
              />

              <div>
                <p className="text-sm font-semibold text-red-200">
                  {isEditMode
                    ? "Revisi belum dapat diproses"
                    : "Pengajuan belum dapat diproses"}
                </p>

                <p className="mt-1 text-sm text-red-200/80">
                  {errorMessage}
                </p>
              </div>
            </div>
          )}

          {/* ==================================================
              SUCCESS
          ================================================== */}

          {successMessage && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-300/20 bg-emerald-400/10 px-4 py-4">
              <IconCheckCircle
                className="
                  mt-0.5
                  h-5
                  w-5
                  shrink-0
                  text-emerald-300
                "
              />

              <div>
                <p className="text-sm font-semibold text-emerald-200">
                  {isEditMode
                    ? "Revisi berhasil"
                    : "Pengajuan berhasil"}
                </p>

                <p className="mt-1 text-sm text-emerald-200/80">
                  {successMessage}
                </p>
              </div>
            </div>
          )}

          {/* ==================================================
              FORM CARD
          ================================================== */}

          <form
            onSubmit={handleSubmit}
            className="
              w-full
              overflow-hidden
              rounded-2xl
              border
              border-white/10
              bg-[#2A354B]
              shadow-[0_18px_45px_rgba(0,0,0,0.20)]
            "
          >

            {/* CARD HEADER */}

            <div
              className="
                border-b
                border-white/10
                px-5
                py-5
                sm:px-7
              "
            >
              <h2 className="text-base font-bold text-white sm:text-lg">
                {cardTitle}
              </h2>

              <p className="mt-1 text-sm text-slate-300">
                {cardDescription}
              </p>
            </div>

            {/* FORM BODY */}

            <div className="space-y-6 px-5 py-6 sm:px-7">

              {/* ==================================================
                  JENIS IZIN
              ================================================== */}

              <div>
                <label
                  htmlFor="jenisIzin"
                  className="
                    mb-2
                    block
                    text-sm
                    font-semibold
                    text-white
                  "
                >
                  Jenis / Keperluan Izin
                </label>

                <div className="relative">
                  <select
                    id="jenisIzin"
                    name="jenisIzin"
                    value={formData.jenisIzin}
                    onChange={handleChange}
                    disabled={loading}
                    className="
                      h-12
                      w-full
                      appearance-none
                      rounded-xl
                      border
                      border-white/15
                      bg-[#202A3B]
                      px-4
                      pr-11
                      text-sm
                      text-slate-200
                      outline-none
                      transition
                      focus:border-[#6E91E8]
                      focus:ring-4
                      focus:ring-[#5A81FA]/10
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    "
                  >
                    <option
                      value=""
                      className="bg-[#202A3B]"
                    >
                      Pilih jenis / keperluan izin
                    </option>

                    <option
                      value="keperluan-pribadi"
                      className="bg-[#202A3B]"
                    >
                      Keperluan Pribadi
                    </option>

                    <option
                      value="urusan-keluarga"
                      className="bg-[#202A3B]"
                    >
                      Urusan Keluarga
                    </option>

                    <option
                      value="urusan-dinas"
                      className="bg-[#202A3B]"
                    >
                      Urusan Dinas
                    </option>

                    <option
                      value="lainnya"
                      className="bg-[#202A3B]"
                    >
                      Lainnya
                    </option>
                  </select>

                  <IconChevronDown
                    className="
                      pointer-events-none
                      absolute
                      right-4
                      top-1/2
                      h-5
                      w-5
                      -translate-y-1/2
                      text-slate-400
                    "
                  />
                </div>
              </div>

              {/* ==================================================
                  PEJABAT TUJUAN PERSETUJUAN
              ================================================== */}

              {!isEditMode && requiresTargetSelection && (
                <div>
                  <label
                    htmlFor="approvalTargetId"
                    className="mb-2 block text-sm font-semibold text-white"
                  >
                    Pejabat yang Menyetujui
                  </label>
                  <select
                    id="approvalTargetId"
                    name="approvalTargetId"
                    value={approvalTargetId}
                    onChange={(e) => {
                      setApprovalTargetId(e.target.value);
                      setErrorMessage("");
                    }}
                    disabled={loading}
                    required
                    className="h-12 w-full rounded-xl border border-white/15 bg-[#202A3B] px-4 text-sm text-slate-200 outline-none transition focus:border-[#6E91E8] focus:ring-4 focus:ring-[#5A81FA]/10 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="">Pilih pejabat tujuan</option>
                    {approvalTargets.map((target) => (
                      <option key={target.id} value={target.id} className="bg-[#202A3B]">
                        {target.name}{target.jabatan ? ` — ${target.jabatan}` : ""}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1.5 text-xs text-slate-400">
                    Pilih Ketua atau Wakil Ketua yang akan menerima pengajuan ini.
                  </p>
                  {approvalTargets.length === 0 && (
                    <p className="mt-2 text-xs text-amber-300">
                      Pilihan pejabat belum tersedia. Pastikan data Ketua/Wakil Ketua aktif dan endpoint target persetujuan sudah benar.
                    </p>
                  )}
                </div>
              )}

              {/* ==================================================
                  WAKTU IZIN
              ================================================== */}

              <div>
                <div className="mb-3">
                  <label className="block text-sm font-semibold text-white">
                    Waktu Izin
                  </label>

                  <p className="mt-0.5 text-xs text-slate-400">
                    Tentukan tanggal dan perkiraan waktu
                    keluar serta kembali.
                  </p>
                </div>

                <div
                  className="
                    grid
                    grid-cols-1
                    gap-4
                    md:grid-cols-3
                  "
                >

                  {/* TANGGAL */}

                  <div>
                    <label
                      htmlFor="tanggal"
                      className="
                        mb-1.5
                        block
                        text-xs
                        font-medium
                        text-slate-300
                      "
                    >
                      Tanggal
                    </label>

                    {/* 
                      PENTING:
                      Tidak ada icon custom di sini.
                      Chrome akan menampilkan icon kalender
                      bawaan input type=date.
                    */}

                    <input
                      id="tanggal"
                      name="tanggal"
                      type="date"
                      value={formData.tanggal}
                      min={today}
                      onChange={handleChange}
                      disabled={loading}
                      className="
                        h-12
                        w-full
                        rounded-xl
                        border
                        border-white/15
                        bg-[#202A3B]
                        px-4
                        text-sm
                        text-slate-200
                        outline-none
                        transition
                        focus:border-[#6E91E8]
                        focus:ring-4
                        focus:ring-[#5A81FA]/10
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                      "
                    />
                  </div>

                  {/* JAM KELUAR */}

                  <div>
                    <label
                      htmlFor="jamKeluar"
                      className="
                        mb-1.5
                        block
                        text-xs
                        font-medium
                        text-slate-300
                      "
                    >
                      Jam Keluar
                    </label>

                    {/* 
                      Tidak ada icon custom.
                      Chrome menggunakan icon clock bawaan.
                    */}

                    <input
                      id="jamKeluar"
                      name="jamKeluar"
                      type="time"
                      value={formData.jamKeluar}
                      min={isTodaySelected ? currentTime : undefined}
                      onChange={handleChange}
                      disabled={loading}
                      className="
                        h-12
                        w-full
                        rounded-xl
                        border
                        border-white/15
                        bg-[#202A3B]
                        px-4
                        text-sm
                        text-slate-200
                        outline-none
                        transition
                        focus:border-[#6E91E8]
                        focus:ring-4
                        focus:ring-[#5A81FA]/10
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                      "
                    />
                  </div>

                  {/* PERKIRAAN KEMBALI */}

                  <div>
                    <label
                      htmlFor="estimasiKembali"
                      className="
                        mb-1.5
                        block
                        text-xs
                        font-medium
                        text-slate-300
                      "
                    >
                      Perkiraan Kembali
                    </label>

                    <input
                      id="estimasiKembali"
                      name="estimasiKembali"
                      type="time"
                      value={formData.estimasiKembali}
                      onChange={handleChange}
                      disabled={loading}
                      className="
                        h-12
                        w-full
                        rounded-xl
                        border
                        border-white/15
                        bg-[#202A3B]
                        px-4
                        text-sm
                        text-slate-200
                        outline-none
                        transition
                        focus:border-[#6E91E8]
                        focus:ring-4
                        focus:ring-[#5A81FA]/10
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                      "
                    />
                  </div>
                </div>
              </div>

              {/* ==================================================
                  ALASAN
              ================================================== */}

              <div>
                <div
                  className="
                    mb-2
                    flex
                    items-end
                    justify-between
                    gap-4
                  "
                >
                  <div>
                    <label
                      htmlFor="alasan"
                      className="
                        block
                        text-sm
                        font-semibold
                        text-white
                      "
                    >
                      Alasan / Keterangan
                    </label>

                    <p className="mt-0.5 text-xs text-slate-400">
                      Jelaskan keperluan izin secara singkat
                      dan jelas.
                    </p>
                  </div>

                  <span className="shrink-0 text-xs text-slate-400">
                    {formData.alasan.length} karakter
                  </span>
                </div>

                <textarea
                  id="alasan"
                  name="alasan"
                  value={formData.alasan}
                  onChange={handleChange}
                  rows={4}
                  disabled={loading}
                  placeholder="Tuliskan alasan atau keterangan izin..."
                  className="
                    w-full
                    resize-none
                    rounded-xl
                    border
                    border-white/15
                    bg-[#202A3B]
                    px-4
                    py-3.5
                    text-sm
                    text-slate-200
                    outline-none
                    transition
                    placeholder:text-slate-500
                    focus:border-[#6E91E8]
                    focus:ring-4
                    focus:ring-[#5A81FA]/10
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                />
              </div>

              {/* ==================================================
                  INFO
              ================================================== */}

              <div
                className={`
                  rounded-xl
                  border
                  px-4
                  py-3.5
                  ${
                    isEditMode
                      ? "border-orange-300/20 bg-orange-400/10"
                      : "border-[#6E91E8]/20 bg-[#1F4960]"
                  }
                `}
              >
                <div className="flex gap-3">

                  <div
                    className={`
                      mt-0.5
                      flex
                      h-8
                      w-8
                      shrink-0
                      items-center
                      justify-center
                      rounded-lg
                      ${
                        isEditMode
                          ? "bg-orange-300/10 text-orange-300"
                          : "bg-[#163B4C] text-sky-300"
                      }
                    `}
                  >
                    <span className="text-sm font-bold">
                      i
                    </span>
                  </div>

                  <div>
                    <p
                      className={`
                        text-sm
                        font-semibold
                        ${
                          isEditMode
                            ? "text-orange-200"
                            : "text-white"
                        }
                      `}
                    >
                      {isEditMode
                        ? "Informasi Revisi"
                        : "Informasi Pengajuan"}
                    </p>

                    <p className="mt-0.5 text-sm leading-6 text-slate-200/90">
                      {isEditMode
                        ? "Setelah diperbaiki dan diajukan ulang, pengajuan akan kembali masuk ke proses persetujuan."
                        : "Setelah pengajuan dikirim, permohonan akan diteruskan kepada atasan sesuai dengan struktur persetujuan yang berlaku."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ==================================================
                FOOTER BUTTON
            ================================================== */}

            <div
              className="
                flex
                flex-col-reverse
                gap-3
                border-t
                border-white/10
                bg-[#263247]
                px-5
                py-4
                sm:flex-row
                sm:justify-end
                sm:px-7
              "
            >
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="
                  h-10
                  rounded-lg
                  px-4
                  text-sm
                  font-medium
                  text-slate-300
                  transition
                  hover:bg-white/5
                  hover:text-white
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                Batal
              </button>

              <button
                type="submit"
                disabled={loading}
                className={`
                  h-10
                  rounded-lg
                  px-5
                  text-sm
                  font-semibold
                  text-white
                  shadow-sm
                  transition
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                  ${
                    isEditMode
                      ? "bg-orange-500 hover:bg-orange-600"
                      : "bg-[#3E70D8] hover:bg-[#4A7BE4]"
                  }
                `}
              >
                {loading
                  ? "Memproses..."
                  : submitButtonText}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
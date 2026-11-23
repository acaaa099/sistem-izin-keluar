import { useCallback, useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

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

function IconSearch(props) {

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

      <circle cx="11" cy="11" r="7" />

      <path d="m20 20-4-4" />

    </svg>

  );

}

function IconChevronRight(props) {

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

      <path d="m9 18 6-6-6-6" />

    </svg>

  );

}

function IconClipboard(props) {

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

      <rect x="5" y="4" width="14" height="17" rx="2" />

      <path d="M9 4.5V3h6v1.5" />

      <path d="M9 9h6" />

      <path d="M9 13h6" />

      <path d="M9 17h4" />

    </svg>

  );

}

function getStatusLabel(status) {

  const labels = {

    DIAJUKAN: "Diajukan",

    REVISI: "Perlu Revisi",

    DISETUJUI: "Disetujui",

    "SURAT TERSEDIA": "Surat Tersedia",

    "SEDANG IZIN": "Sedang Izin",

    "MENUNGGU PENYELESAIAN": "Menunggu Penyelesaian",

    SELESAI: "Selesai",

    DITOLAK: "Ditolak",

  };

  return labels[status] || status;

}

function getStatusClass(status) {

  const classes = {

    DIAJUKAN:

      "bg-amber-50 text-amber-700 border-amber-200",

    REVISI:

      "bg-orange-50 text-orange-700 border-orange-200",

    DISETUJUI:

      "bg-blue-50 text-blue-700 border-blue-200",

    "SURAT TERSEDIA":

      "bg-indigo-50 text-indigo-700 border-indigo-200",

    "SEDANG IZIN":

      "bg-purple-50 text-purple-700 border-purple-200",

    "MENUNGGU PENYELESAIAN":

      "bg-cyan-50 text-cyan-700 border-cyan-200",

    SELESAI:

      "bg-emerald-50 text-emerald-700 border-emerald-200",

    DITOLAK:

      "bg-red-50 text-red-700 border-red-200",

  };

  return (

    classes[status] ||

    "bg-slate-50 text-slate-600 border-slate-200"

  );

}

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

  return labels[normalized] || String(jenisIzin);
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


function getTodayInputDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatInputDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildMonitoringDateRange({ periodType, weekDate, monthValue, customStartDate, customEndDate }) {
  if (periodType === "all") {
    return { range: null, label: "Semua periode", error: "" };
  }

  if (periodType === "weekly") {
    if (!weekDate) {
      return { range: null, label: "", error: "Pilih tanggal untuk menentukan minggu." };
    }

    const selected = new Date(`${weekDate}T00:00:00`);
    if (Number.isNaN(selected.getTime())) {
      return { range: null, label: "", error: "Tanggal minggu tidak valid." };
    }

    const day = selected.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(selected);
    monday.setDate(selected.getDate() + diffToMonday);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const startDate = formatInputDate(monday);
    const endDate = formatInputDate(sunday);
    return {
      range: { start_date: startDate, end_date: endDate },
      label: `Mingguan (${startDate} s.d. ${endDate})`,
      error: "",
    };
  }

  if (periodType === "monthly") {
    if (!/^\d{4}-\d{2}$/.test(monthValue || "")) {
      return { range: null, label: "", error: "Pilih bulan monitoring terlebih dahulu." };
    }

    const [year, month] = monthValue.split("-").map(Number);
    const startDate = `${monthValue}-01`;
    const endDate = formatInputDate(new Date(year, month, 0));
    return {
      range: { start_date: startDate, end_date: endDate },
      label: `Bulanan (${monthValue})`,
      error: "",
    };
  }

  if (periodType === "custom") {
    if (!customStartDate || !customEndDate) {
      return { range: null, label: "", error: "Lengkapi tanggal mulai dan tanggal akhir." };
    }
    if (customStartDate > customEndDate) {
      return { range: null, label: "", error: "Tanggal mulai tidak boleh melewati tanggal akhir." };
    }
    return {
      range: { start_date: customStartDate, end_date: customEndDate },
      label: `Rentang (${customStartDate} s.d. ${customEndDate})`,
      error: "",
    };
  }

  return { range: null, label: "", error: "Jenis periode tidak dikenali." };
}

function countUniqueEmployees(permits) {
  const employeeKeys = permits
    .map((permit) => permit.user_id ?? permit.user?.id ?? permit.user?.name ?? permit.user?.nama)
    .filter((value) => value !== null && value !== undefined && String(value).trim() !== "")
    .map((value) => String(value));
  return new Set(employeeKeys).size;
}

function normalizePermit(permit) {

  return {

    ...permit,

    tanggal_izin_raw: permit.tanggal_izin,

    jenis_izin: getJenisIzinLabel(permit.jenis_izin),

    tanggal_izin: formatTanggal(permit.tanggal_izin),

    jam_keluar: formatJam(permit.jam_keluar),

    estimasi_kembali: formatJam(

      permit.estimasi_kembali

    ),

    alasan: permit.alasan || "-",

    status: permit.status || "",

  };

}

// ======================================================

// PAGE

// ======================================================

export default function MonitoringIzinPegawai() {

  const navigate = useNavigate();

  const [permits, setPermits] = useState([]);
  const [summary, setSummary] = useState({ total_permits: 0, total_employees: 0 });
  const [activeFilter, setActiveFilter] = useState("SEMUA");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [periodError, setPeriodError] = useState("");

  const [periodType, setPeriodType] = useState("all");
  const [weekDate, setWeekDate] = useState(getTodayInputDate());
  const [monthValue, setMonthValue] = useState(getTodayInputDate().slice(0, 7));
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [periodLabel, setPeriodLabel] = useState("Semua periode");

  const filters = [
    { key: "SEMUA", label: "Semua" },
    { key: "DIAJUKAN", label: "Diajukan" },
    { key: "DISETUJUI", label: "Disetujui" },
    { key: "SELESAI", label: "Selesai" },
    { key: "DITOLAK", label: "Ditolak" },
  ];

  // ======================================================
  // AMBIL DATA DARI API BERDASARKAN CAKUPAN ATASAN
  // ======================================================

  const fetchPermits = useCallback(async (dateRange = null, label = "Semua periode") => {
    setLoading(true);
    setErrorMessage("");

    try {
      const params = { scope: "subordinates" };
      if (dateRange) {
        params.start_date = dateRange.start_date;
        params.end_date = dateRange.end_date;
      }

      const response = await api.get("/permits", { params });
      const apiPermits = response.data?.data?.permits ?? response.data?.data ?? [];

      if (!Array.isArray(apiPermits)) {
        throw new Error("Format data monitoring dari server tidak sesuai.");
      }

      const normalizedPermits = apiPermits.map(normalizePermit);
      const apiSummary = response.data?.data?.summary;
      const fallbackEmployees = countUniqueEmployees(apiPermits);

      setPermits(normalizedPermits);
      setSummary({
        total_permits: Number(apiSummary?.total_permits ?? apiPermits.length),
        total_employees: Number(apiSummary?.total_employees ?? fallbackEmployees),
      });
      setPeriodLabel(label);
    } catch (error) {
      console.error("Gagal mengambil data monitoring pegawai:", error);

      if (error.response?.status === 401) {
        setErrorMessage("Sesi login telah berakhir. Silakan login kembali.");
      } else {
        setErrorMessage(
          error.response?.data?.message ||
          error.message ||
          "Gagal mengambil data monitoring pegawai. Silakan coba lagi."
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPermits();
  }, [fetchPermits]);

  const handleApplyPeriod = () => {
    const result = buildMonitoringDateRange({
      periodType,
      weekDate,
      monthValue,
      customStartDate,
      customEndDate,
    });

    if (result.error) {
      setPeriodError(result.error);
      return;
    }

    setPeriodError("");
    setActiveFilter("SEMUA");
    fetchPermits(result.range, result.label);
  };

  const handleResetPeriod = () => {
    setPeriodType("all");
    setWeekDate(getTodayInputDate());
    setMonthValue(getTodayInputDate().slice(0, 7));
    setCustomStartDate("");
    setCustomEndDate("");
    setPeriodError("");
    setActiveFilter("SEMUA");
    fetchPermits(null, "Semua periode");
  };

  // ======================================================

  // FILTER

  // ======================================================

  const filteredPermits = useMemo(() => {

    const keyword = search.trim().toLowerCase();

    return permits.filter((permit) => {

      const matchesFilter =

        activeFilter === "SEMUA" ||

        permit.status === activeFilter;

      const matchesSearch =

        !keyword ||

        permit.jenis_izin

          .toLowerCase()

          .includes(keyword) ||

        permit.alasan

          .toLowerCase()

          .includes(keyword) ||

        permit.tanggal_izin

          .toLowerCase()

          .includes(keyword) ||

        String(permit.user?.name || "")

          .toLowerCase()

          .includes(keyword);

      return matchesFilter && matchesSearch;

    });

  }, [permits, activeFilter, search]);

  // ======================================================

  // NAVIGATION

  // ======================================================

  const handleBack = () => {

    navigate("/dashboard");

  };



  const handleDetail = (permit) => {

    navigate(`/izin/detail/${permit.id}`);

  };

  // ======================================================

  // RENDER

  // ======================================================

  return (

    <div

      style={{

        minHeight: "100vh",

        width: "100%",

        background: "#F6F8FC",

        color: "#1E293B",

      }}

    >

      {/* ==================================================

          TOPBAR

      ================================================== */}

      <header

        style={{

          width: "100%",

          background: "#FFFFFF",

          borderBottom: "1px solid #E2E8F0",

        }}

      >

        <div

          style={{

            width: "100%",

            maxWidth: "1050px",

            margin: "0 auto",

            minHeight: "72px",

            padding: "14px 20px",

            boxSizing: "border-box",

            display: "flex",

            alignItems: "center",

            justifyContent: "space-between",

          }}

        >

          <button

            type="button"

            onClick={handleBack}

            className="

              inline-flex

              items-center

              gap-2

              rounded-lg

              px-2

              py-2

              text-sm

              font-medium

              text-slate-500

              transition

              hover:bg-slate-50

              hover:text-[#3F55C3]

            "

          >

            <IconArrowLeft className="h-5 w-5" />

            Kembali

          </button>



        </div>

      </header>

      {/* ==================================================

          CONTENT

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

            maxWidth: "1050px",

            padding: "34px 20px 60px",

            boxSizing: "border-box",

          }}

        >

          {/* ==================================================

              HEADER

          ================================================== */}

          <section className="mb-6">

            <span

              className="

                inline-flex

                rounded-full

                bg-[#EEF2FF]

                px-3

                py-1

                text-xs

                font-semibold

                text-[#4F67D8]

              "

            >

              Monitoring Pegawai

            </span>

            <h1

              className="

                mt-2

                text-2xl

                font-bold

                tracking-tight

                text-slate-900

                sm:text-3xl

              "

            >

              Riwayat Izin

            </h1>

            <p

              className="

                mt-1.5

                max-w-2xl

                text-sm

                leading-6

                text-slate-500

              "

            >

              Pantau pengajuan izin pegawai yang berada dalam cakupan pemantauan Anda.

            </p>

          </section>

          {/* ==================================================

              FILTER + SEARCH

          ================================================== */}

          <section

            className="

              mb-6

              rounded-2xl

              border

              border-slate-200

              bg-white

              p-4

              shadow-[0_8px_30px_rgba(15,23,42,0.04)]

              sm:p-5

            "

          >

            {/* FILTER */}

            <div className="flex flex-wrap gap-2">

              {filters.map((filter) => {

                const active =

                  activeFilter === filter.key;

                return (

                  <button

                    key={filter.key}

                    type="button"

                    onClick={() =>

                      setActiveFilter(filter.key)

                    }

                    className={`

                      rounded-xl

                      px-4

                      py-2

                      text-xs

                      font-semibold

                      transition

                      ${

                        active

                          ? "bg-[#4F70D8] text-white shadow-sm"

                          : "bg-[#F5F7FB] text-slate-500 hover:bg-[#EDF1F8] hover:text-slate-700"

                      }

                    `}

                  >

                    {filter.label}

                  </button>

                );

              })}

            </div>

            {/* FILTER PERIODE MONITORING */}
            <div className="mt-5 border-t border-slate-100 pt-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Periode Monitoring
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "all", label: "Semua Periode" },
                  { value: "weekly", label: "Mingguan" },
                  { value: "monthly", label: "Bulanan" },
                  { value: "custom", label: "Rentang Tanggal" },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => { setPeriodType(item.value); setPeriodError(""); }}
                    className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                      periodType === item.value
                        ? "bg-[#4F70D8] text-white shadow-sm"
                        : "bg-[#F5F7FB] text-slate-500 hover:bg-[#EDF1F8] hover:text-slate-700"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {periodType === "weekly" && (
                <div className="mt-3 max-w-xs">
                  <label className="mb-1 block text-xs font-medium text-slate-600">Pilih tanggal dalam minggu</label>
                  <input type="date" value={weekDate} onChange={(e) => setWeekDate(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm" />
                  <p className="mt-1 text-[11px] text-slate-400">Minggu dihitung dari Senin sampai Minggu.</p>
                </div>
              )}

              {periodType === "monthly" && (
                <div className="mt-3 max-w-xs">
                  <label className="mb-1 block text-xs font-medium text-slate-600">Pilih bulan</label>
                  <input type="month" value={monthValue} onChange={(e) => setMonthValue(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm" />
                </div>
              )}

              {periodType === "custom" && (
                <div className="mt-3 grid max-w-xl gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">Tanggal mulai</label>
                    <input type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">Tanggal akhir</label>
                    <input type="date" value={customEndDate} min={customStartDate || undefined} onChange={(e) => setCustomEndDate(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm" />
                  </div>
                </div>
              )}

              {periodError && <p className="mt-2 text-xs text-red-600">{periodError}</p>}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button type="button" onClick={handleApplyPeriod} disabled={loading} className="rounded-lg bg-[#4F70D8] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#405FC0] disabled:opacity-60">
                  Terapkan Periode
                </button>
                <button type="button" onClick={handleResetPeriod} disabled={loading} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-60">
                  Reset Periode
                </button>
                <span className="text-[11px] text-slate-400">Aktif: {periodLabel}</span>
              </div>
            </div>

            {/* ==================================================

                SEARCH

                ICON DAN INPUT TIDAK LAGI ABSOLUTE

            ================================================== */}

            <div

              style={{

                width: "100%",

                display: "flex",

                justifyContent: "center",

                marginTop: "16px",

              }}

            >

              <div

                style={{

                  width: "100%",

                  maxWidth: "760px",

                  height: "48px",

                  display: "flex",

                  alignItems: "center",

                  boxSizing: "border-box",

                  border: "1px solid #E2E8F0",

                  borderRadius: "12px",

                  background: "#F8FAFD",

                  paddingLeft: "16px",

                  paddingRight: "16px",

                  transition: "all 0.2s ease",

                }}

              >

                {/* ICON */}

                <div

                  style={{

                    width: "24px",

                    height: "24px",

                    flexShrink: 0,

                    display: "flex",

                    alignItems: "center",

                    justifyContent: "center",

                    color: "#94A3B8",

                    marginRight: "12px",

                  }}

                >

                  <IconSearch

                    style={{

                      width: "20px",

                      height: "20px",

                    }}

                  />

                </div>

                {/* INPUT */}

                <input

                  type="text"

                  value={search}

                  onChange={(e) =>

                    setSearch(e.target.value)

                  }

                  placeholder="Cari jenis izin, alasan, atau tanggal..."

                  style={{

                    width: "100%",

                    height: "100%",

                    border: "none",

                    outline: "none",

                    background: "transparent",

                    color: "#334155",

                    fontSize: "14px",

                    fontFamily: "Poppins, sans-serif",

                    padding: "0",

                    margin: "0",

                  }}

                />

              </div>

            </div>

          </section>

          {/* RINGKASAN PERIODE */}
          <section className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_5px_18px_rgba(31,41,55,0.04)]">
              <p className="text-xs font-medium text-slate-500">Pegawai Mengajukan Izin</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{loading ? "…" : summary.total_employees}</p>
              <p className="mt-1 text-[11px] text-slate-400">Jumlah pegawai unik pada periode terpilih</p>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_5px_18px_rgba(31,41,55,0.04)]">
              <p className="text-xs font-medium text-slate-500">Total Pengajuan Izin</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{loading ? "…" : summary.total_permits}</p>
              <p className="mt-1 text-[11px] text-slate-400">Seluruh status pengajuan pada periode terpilih</p>
            </article>
          </section>

          {/* ==================================================

              RESULT HEADER

          ================================================== */}

          <div

            className="

              mb-4

              flex

              items-center

              justify-between

              gap-4

            "

          >

            <p

              className="

                text-sm

                font-semibold

                text-slate-700

              "

            >

              {loading

                ? "Memuat..."

                : `${filteredPermits.length} Pengajuan ditampilkan`}

            </p>

            <p

              className="

                text-xs

                text-slate-400

              "

            >

              Data dari sistem

            </p>

          </div>

          {/* ==================================================

              ERROR

          ================================================== */}

          {errorMessage && (

            <div

              className="

                mb-5

                rounded-2xl

                border

                border-red-200

                bg-red-50

                px-5

                py-4

              "

            >

              <p

                className="

                  text-sm

                  font-semibold

                  text-red-700

                "

              >

                Gagal mengambil data

              </p>

              <p

                className="

                  mt-1

                  text-sm

                  text-red-600

                "

              >

                {errorMessage}

              </p>

              <button

                type="button"

                onClick={() =>

                  window.location.reload()

                }

                className="

                  mt-3

                  rounded-lg

                  bg-white

                  px-3

                  py-2

                  text-xs

                  font-semibold

                  text-red-700

                  shadow-sm

                  ring-1

                  ring-red-200

                  transition

                  hover:bg-red-50

                "

              >

                Coba Lagi

              </button>

            </div>

          )}

          {/* ==================================================

              LOADING

          ================================================== */}

          {loading ? (

            <div

              className="

                rounded-2xl

                border

                border-slate-200

                bg-white

                px-6

                py-16

                text-center

                shadow-[0_8px_24px_rgba(15,23,42,0.03)]

              "

            >

              <div

                className="

                  mx-auto

                  h-8

                  w-8

                  animate-spin

                  rounded-full

                  border-2

                  border-slate-200

                  border-t-[#5A81FA]

                "

              />

              <p

                className="

                  mt-4

                  text-sm

                  text-slate-500

                "

              >

                Memuat riwayat izin...

              </p>

            </div>

          ) : filteredPermits.length > 0 ? (

            /* ==================================================

               LIST

            ================================================== */

            <div className="space-y-4">

              {filteredPermits.map((permit) => (

                <article

                  key={permit.id}

                  className="

                    rounded-2xl

                    border

                    border-slate-200

                    bg-white

                    p-5

                    shadow-[0_7px_24px_rgba(15,23,42,0.04)]

                    transition

                    hover:-translate-y-[1px]

                    hover:border-slate-300

                    hover:shadow-[0_10px_28px_rgba(15,23,42,0.07)]

                    sm:p-6

                  "

                >

                  <div

                    className="

                      flex

                      flex-col

                      gap-5

                      lg:flex-row

                      lg:items-center

                      lg:justify-between

                    "

                  >

                    {/* LEFT */}

                    <div className="min-w-0 flex-1">

                      <div

                        className="

                          flex

                          flex-wrap

                          items-center

                          gap-2.5

                        "

                      >

                        {permit.user?.name && (
                          <p className="mb-1 w-full text-sm font-semibold text-slate-600">
                            {permit.user.name}{permit.user?.jabatan ? ` · ${permit.user.jabatan}` : ""}
                          </p>
                        )}
                        <h2

                          className="

                            text-base

                            font-bold

                            text-slate-900

                            sm:text-[17px]

                          "

                        >

                          {permit.jenis_izin}

                        </h2>

                        <span

                          className={`

                            inline-flex

                            items-center

                            rounded-full

                            border

                            px-2.5

                            py-1

                            text-[11px]

                            font-semibold

                            ${getStatusClass(

                              permit.status

                            )}

                          `}

                        >

                          {getStatusLabel(

                            permit.status

                          )}

                        </span>

                      </div>

                      <div

                        className="

                          mt-3

                          flex

                          flex-wrap

                          items-center

                          gap-x-3

                          gap-y-1.5

                          text-sm

                          text-slate-500

                        "

                      >

                        <span>

                          {permit.tanggal_izin}

                        </span>

                        <span className="text-slate-300">

                          •

                        </span>

                        <span>

                          {permit.jam_keluar} -{" "}

                          {permit.estimasi_kembali}

                        </span>

                      </div>

                      <p

                        className="

                          mt-2.5

                          max-w-[700px]

                          line-clamp-2

                          text-sm

                          leading-6

                          text-slate-500

                        "

                      >

                        {permit.alasan}

                      </p>

                    </div>

                    {/* DETAIL */}

                    <button

                      type="button"

                      onClick={() =>

                        handleDetail(permit)

                      }

                      className="

                        inline-flex

                        shrink-0

                        items-center

                        justify-center

                        gap-2

                        self-start

                        rounded-xl

                        border

                        border-slate-200

                        bg-white

                        px-4

                        py-2.5

                        text-sm

                        font-semibold

                        text-slate-600

                        transition

                        hover:border-[#C5D0FF]

                        hover:bg-[#F5F7FF]

                        hover:text-[#3F55C3]

                        lg:self-center

                      "

                    >

                      Lihat Detail

                      <IconChevronRight

                        className="h-4 w-4"

                      />

                    </button>

                  </div>

                </article>

              ))}

            </div>

          ) : (

            /* ==================================================

               EMPTY STATE

            ================================================== */

            <div

              className="

                rounded-2xl

                border

                border-dashed

                border-slate-300

                bg-white

                px-6

                py-16

                text-center

                shadow-[0_8px_24px_rgba(15,23,42,0.03)]

              "

            >

              <div

                className="

                  mx-auto

                  flex

                  h-12

                  w-12

                  items-center

                  justify-center

                  rounded-xl

                  bg-slate-100

                  text-slate-400

                "

              >

                <IconClipboard className="h-6 w-6" />

              </div>

              <h2

                className="

                  mt-4

                  text-base

                  font-bold

                  text-slate-800

                "

              >

                Belum ada izin pegawai

              </h2>

              <p

                className="

                  mx-auto

                  mt-2

                  max-w-md

                  text-sm

                  leading-6

                  text-slate-500

                "

              >

                Tidak ditemukan pengajuan yang

                sesuai dengan filter atau pencarian

                Anda.

              </p>

              {search ||

              activeFilter !== "SEMUA" ? (

                <button

                  type="button"

                  onClick={() => {

                    setSearch("");

                    setActiveFilter("SEMUA");
                    handleResetPeriod();

                  }}

                  className="

                    mt-4

                    rounded-lg

                    bg-[#EEF2FF]

                    px-4

                    py-2

                    text-xs

                    font-semibold

                    text-[#3F55C3]

                    transition

                    hover:bg-[#E3E8FF]

                  "

                >

                  Reset Filter

                </button>

              ) : null}

            </div>

          )}

        </main>

      </div>

    </div>

  );

}
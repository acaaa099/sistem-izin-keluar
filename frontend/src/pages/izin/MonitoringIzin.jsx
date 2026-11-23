import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";


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

const STATUS_OPTIONS = [
  { value: "DIAJUKAN", label: "Diajukan" },
  { value: "REVISI", label: "Revisi" },
  { value: "DISETUJUI", label: "Disetujui" },
  { value: "DITOLAK", label: "Ditolak" },
  { value: "SURAT TERSEDIA", label: "Surat Tersedia" },
  { value: "SEDANG IZIN", label: "Sedang Izin" },
  { value: "MENUNGGU PENYELESAIAN", label: "Menunggu Penyelesaian" },
  { value: "SELESAI", label: "Selesai" },
];

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatPermitType(value) {
  if (!value) return "-";
  const normalized = String(value).replace(/[-_]/g, " ");
  return normalized.replace(/\b\w/g, (character) => character.toUpperCase());
}

function getSummaryFromResponse(summary, permits) {
  return {
    total_permits: Number(summary?.total_permits ?? permits.length),
    total_employees: Number(summary?.total_employees ?? countUniqueEmployees(permits)),
  };
}

export default function MonitoringIzin() {
  const navigate = useNavigate();
  const [permits, setPermits] = useState([]);
  const [summary, setSummary] = useState({ total_permits: 0, total_employees: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [periodError, setPeriodError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("SEMUA");

  const [periodType, setPeriodType] = useState("all");
  const [weekDate, setWeekDate] = useState(getTodayInputDate());
  const [monthValue, setMonthValue] = useState(getTodayInputDate().slice(0, 7));
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [periodLabel, setPeriodLabel] = useState("Semua periode");

  const loadPermits = useCallback(async (dateRange = null, label = "Semua periode") => {
    setLoading(true);
    setError("");

    try {
      const params = { scope: "all" };
      if (dateRange) {
        params.start_date = dateRange.start_date;
        params.end_date = dateRange.end_date;
      }

      const response = await api.get("/permits", { params });
      const data = response.data?.data?.permits ?? response.data?.permits ?? [];
      if (!Array.isArray(data)) {
        throw new Error("Format data monitoring dari server tidak sesuai.");
      }

      setPermits(data);
      setSummary(getSummaryFromResponse(response.data?.data?.summary, data));
      setPeriodLabel(label);
    } catch (err) {
      setError(
        err.response?.data?.message ?? err.message ?? "Gagal memuat monitoring izin."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPermits();
  }, [loadPermits]);

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
    setStatus("SEMUA");
    loadPermits(result.range, result.label);
  };

  const handleResetPeriod = () => {
    setPeriodType("all");
    setWeekDate(getTodayInputDate());
    setMonthValue(getTodayInputDate().slice(0, 7));
    setCustomStartDate("");
    setCustomEndDate("");
    setPeriodError("");
    setStatus("SEMUA");
    loadPermits(null, "Semua periode");
  };

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return permits.filter((permit) => {
      const name = permit.user?.name ?? permit.user?.nama ?? "";
      const permitType = permit.jenis_izin ?? "";
      const reason = permit.alasan ?? permit.reason ?? permit.keperluan ?? permit.purpose ?? "";
      const matchesSearch =
        !term ||
        String(name).toLowerCase().includes(term) ||
        String(permit.id ?? "").toLowerCase().includes(term) ||
        String(permitType).toLowerCase().includes(term) ||
        String(reason).toLowerCase().includes(term);
      const matchesStatus = status === "SEMUA" || permit.status === status;
      return matchesSearch && matchesStatus;
    });
  }, [permits, search, status]);

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-2 text-2xl font-bold text-slate-900">Monitoring Izin</h1>
        <p className="mb-6 text-sm leading-6 text-slate-600">
          Pemantauan seluruh pengajuan izin pegawai berdasarkan tanggal pelaksanaan izin.
          Halaman ini digunakan untuk monitoring, bukan untuk mengambil keputusan persetujuan.
        </p>

        <section className="mb-5 grid gap-4 sm:grid-cols-2">
          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Pegawai Mengajukan Izin</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {loading ? "…" : summary.total_employees}
            </p>
            <p className="mt-1 text-xs text-slate-400">Jumlah pegawai unik pada periode terpilih</p>
          </article>
          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Total Pengajuan Izin</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {loading ? "…" : summary.total_permits}
            </p>
            <p className="mt-1 text-xs text-slate-400">Seluruh status pengajuan pada periode terpilih</p>
          </article>
        </section>

        <section className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
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
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  periodType === item.value
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {periodType === "weekly" && (
            <div className="mt-4 max-w-xs">
              <label className="mb-1 block text-sm font-medium text-slate-700">Pilih salah satu tanggal dalam minggu</label>
              <input type="date" value={weekDate} onChange={(e) => setWeekDate(e.target.value)} className="w-full rounded-lg border border-slate-300 p-2.5 text-sm" />
              <p className="mt-1 text-xs text-slate-400">Periode dihitung Senin sampai Minggu.</p>
            </div>
          )}

          {periodType === "monthly" && (
            <div className="mt-4 max-w-xs">
              <label className="mb-1 block text-sm font-medium text-slate-700">Pilih bulan</label>
              <input type="month" value={monthValue} onChange={(e) => setMonthValue(e.target.value)} className="w-full rounded-lg border border-slate-300 p-2.5 text-sm" />
            </div>
          )}

          {periodType === "custom" && (
            <div className="mt-4 grid max-w-xl gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Tanggal mulai</label>
                <input type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} className="w-full rounded-lg border border-slate-300 p-2.5 text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Tanggal akhir</label>
                <input type="date" value={customEndDate} min={customStartDate || undefined} onChange={(e) => setCustomEndDate(e.target.value)} className="w-full rounded-lg border border-slate-300 p-2.5 text-sm" />
              </div>
            </div>
          )}

          {periodError && <p className="mt-3 text-sm text-red-600">{periodError}</p>}
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={handleApplyPeriod} disabled={loading} className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
              Terapkan Periode
            </button>
            <button type="button" onClick={handleResetPeriod} disabled={loading} className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60">
              Reset Periode
            </button>
            <span className="self-center text-xs text-slate-500">Periode aktif: {periodLabel}</span>
          </div>
        </section>

        <section className="mb-4 flex flex-col gap-3 sm:flex-row">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, nomor izin, jenis izin, atau alasan..."
            className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm sm:flex-1"
          />
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border border-slate-300 bg-white p-3 text-sm">
            <option value="SEMUA">Semua Status</option>
            {STATUS_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
        </section>

        {loading && <p className="py-4 text-sm text-slate-500">Memuat data izin...</p>}
        {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        {!loading && !error && (
          <>
            <p className="mb-3 text-sm text-slate-600">
              Menampilkan {filtered.length} dari {permits.length} pengajuan pada periode {periodLabel.toLowerCase()}.
            </p>
            <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    <th className="p-3">Pegawai</th>
                    <th className="p-3">Tanggal Izin</th>
                    <th className="p-3">Keperluan</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((permit) => (
                    <tr key={permit.id} className="border-t border-slate-200">
                      <td className="p-3 font-medium text-slate-800">{permit.user?.name ?? permit.user?.nama ?? "-"}</td>
                      <td className="whitespace-nowrap p-3">{formatDate(permit.tanggal_izin)}</td>
                      <td className="p-3">{formatPermitType(permit.jenis_izin) || permit.alasan || permit.reason || "-"}</td>
                      <td className="p-3">{String(permit.status ?? "-").replace(/_/g, " ")}</td>
                      <td className="p-3">
                        <button
                          type="button"
                          onClick={() => navigate(`/izin/detail/${permit.id}`, { state: { from: "/monitoring-izin" } })}
                          className="rounded bg-blue-600 px-3 py-2 font-medium text-white hover:bg-blue-700"
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={5} className="p-6 text-center text-slate-500">Tidak ada data yang sesuai.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </main>
  );
}


import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

export default function AdminUnits() {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchUnits() {
      setLoading(true);
      setError("");

      try {
        const response = await api.get("/admin/units", {
          params: {
            search: search || undefined,
            status: status || undefined,
          },
        });

        if (cancelled) return;

        const payload = response.data?.data;
        const items = Array.isArray(payload)
          ? payload
          : payload?.data;

        if (!Array.isArray(items)) {
          setUnits([]);
          setError("Format data unit dari server tidak sesuai.");
          return;
        }

        setUnits(items);
      } catch (err) {
        if (cancelled) return;

        setError(
          err.response?.data?.message ||
            "Gagal mengambil data unit. Periksa koneksi backend dan hak akses akun."
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchUnits();

    return () => {
      cancelled = true;
    };
  }, [search, status]);

  const activeCount = units.filter((unit) => unit.is_active).length;

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 hover:underline"
        >
          <span aria-hidden="true">←</span>
          Kembali ke Admin Dashboard
        </Link>

        <div className="mt-5">
          <h1 className="text-2xl font-bold text-slate-800">
            Manajemen Unit
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Lihat struktur unit kerja, jumlah pegawai, dan status unit.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Unit ditemukan</p>
            <p className="mt-2 text-3xl font-bold text-slate-800">
              {loading ? "—" : units.length}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Unit aktif</p>
            <p className="mt-2 text-3xl font-bold text-emerald-700">
              {loading ? "—" : activeCount}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_220px]">
            <div>
              <label
                htmlFor="unit-search"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Cari unit
              </label>
              <input
                id="unit-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Nama unit atau tipe..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="unit-status"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Status
              </label>
              <select
                id="unit-status"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Semua status</option>
                <option value="active">Aktif</option>
                <option value="inactive">Tidak aktif</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="px-5 py-4">No.</th>
                  <th className="px-5 py-4">Nama Unit</th>
                  <th className="px-5 py-4">Tipe</th>
                  <th className="px-5 py-4">Unit Induk</th>
                  <th className="px-5 py-4 text-center">Pegawai</th>
                  <th className="px-5 py-4 text-center">Unit Bawahan</th>
                  <th className="px-5 py-4">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-10 text-center text-slate-500"
                    >
                      Memuat data unit...
                    </td>
                  </tr>
                ) : units.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-10 text-center text-slate-500"
                    >
                      {error
                        ? "Data belum dapat ditampilkan."
                        : "Tidak ada unit yang sesuai dengan pencarian."}
                    </td>
                  </tr>
                ) : (
                  units.map((unit, index) => (
                    <tr
                      key={unit.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4 text-slate-500">
                        {index + 1}
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-800">
                        {unit.name}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {unit.type || "—"}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {unit.parent?.name || "Unit utama"}
                      </td>
                      <td className="px-5 py-4 text-center text-slate-700">
                        {unit.users_count ?? 0}
                      </td>
                      <td className="px-5 py-4 text-center text-slate-700">
                        {unit.children_count ?? 0}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            unit.is_active
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {unit.is_active ? "Aktif" : "Tidak aktif"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

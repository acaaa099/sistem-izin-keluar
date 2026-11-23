
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

export default function AdminPermissions() {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchPermissions() {
      setLoading(true);
      setError("");

      try {
        const response = await api.get("/admin/permissions", {
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
          setPermissions([]);
          setError("Format data permission dari server tidak sesuai.");
          return;
        }

        setPermissions(items);
      } catch (err) {
        if (cancelled) return;

        setError(
          err.response?.data?.message ||
            "Gagal mengambil data permission. Periksa koneksi backend dan hak akses akun."
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchPermissions();

    return () => {
      cancelled = true;
    };
  }, [search, status]);

  const activeCount = permissions.filter(
    (permission) => permission.is_active
  ).length;

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
            Manajemen Permission
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Lihat daftar hak akses, status, dan jumlah role yang menggunakan
            setiap permission.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Permission ditemukan
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-800">
              {loading ? "—" : permissions.length}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Permission aktif</p>
            <p className="mt-2 text-3xl font-bold text-emerald-700">
              {loading ? "—" : activeCount}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_220px]">
            <div>
              <label
                htmlFor="permission-search"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Cari permission
              </label>
              <input
                id="permission-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Nama permission atau deskripsi..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="permission-status"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Status
              </label>
              <select
                id="permission-status"
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
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="px-5 py-4">No.</th>
                  <th className="px-5 py-4">Nama Permission</th>
                  <th className="px-5 py-4">Deskripsi</th>
                  <th className="px-5 py-4 text-center">Jumlah Role</th>
                  <th className="px-5 py-4">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-10 text-center text-slate-500"
                    >
                      Memuat data permission...
                    </td>
                  </tr>
                ) : permissions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-10 text-center text-slate-500"
                    >
                      {error
                        ? "Data belum dapat ditampilkan."
                        : "Tidak ada permission yang sesuai."}
                    </td>
                  </tr>
                ) : (
                  permissions.map((permission, index) => (
                    <tr
                      key={permission.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4 text-slate-500">
                        {index + 1}
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-800">
                        {permission.name}
                      </td>
                      <td className="max-w-sm px-5 py-4 text-slate-600">
                        {permission.description || "—"}
                      </td>
                      <td className="px-5 py-4 text-center text-slate-700">
                        {permission.roles_count ?? 0}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            permission.is_active
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {permission.is_active ? "Aktif" : "Tidak aktif"}
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

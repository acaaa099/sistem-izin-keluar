
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

export default function AdminRoles() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchRoles() {
      setLoading(true);
      setError("");

      try {
        const response = await api.get("/admin/roles", {
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

        setRoles(Array.isArray(items) ? items : []);

        if (!Array.isArray(items)) {
          setError("Format data role dari server tidak sesuai.");
        }
      } catch (err) {
        if (cancelled) return;

        setError(
          err.response?.data?.message ||
            "Gagal mengambil data role. Periksa akses akun dan koneksi backend."
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchRoles();

    return () => {
      cancelled = true;
    };
  }, [search, status]);

  const totalRoles = roles.length;
  const activeRoles = roles.filter((role) => role.is_active).length;

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

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Manajemen Role
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Lihat role, status, jumlah pengguna, dan permission yang
              terhubung.
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Role ditemukan</p>
            <p className="mt-2 text-3xl font-bold text-slate-800">
              {loading ? "—" : totalRoles}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Role aktif</p>
            <p className="mt-2 text-3xl font-bold text-emerald-700">
              {loading ? "—" : activeRoles}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_220px]">
            <div>
              <label
                htmlFor="role-search"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Cari role
              </label>
              <input
                id="role-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Nama role atau deskripsi..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="role-status"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Status
              </label>
              <select
                id="role-status"
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
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="px-5 py-4">No.</th>
                  <th className="px-5 py-4">Nama Role</th>
                  <th className="px-5 py-4">Deskripsi</th>
                  <th className="px-5 py-4 text-center">Pengguna</th>
                  <th className="px-5 py-4 text-center">Permission</th>
                  <th className="px-5 py-4">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-10 text-center text-slate-500"
                    >
                      Memuat data role...
                    </td>
                  </tr>
                ) : roles.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-10 text-center text-slate-500"
                    >
                      {error
                        ? "Data belum dapat ditampilkan."
                        : "Tidak ada role yang sesuai dengan pencarian."}
                    </td>
                  </tr>
                ) : (
                  roles.map((role, index) => (
                    <tr
                      key={role.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4 text-slate-500">
                        {index + 1}
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-800">
                        {role.name}
                      </td>
                      <td className="max-w-sm px-5 py-4 text-slate-600">
                        {role.description || "—"}
                      </td>
                      <td className="px-5 py-4 text-center text-slate-700">
                        {role.users_count ?? 0}
                      </td>
                      <td className="px-5 py-4 text-center text-slate-700">
                        {role.permissions_count ?? 0}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            role.is_active
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {role.is_active ? "Aktif" : "Tidak aktif"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <p className="mt-3 text-xs text-slate-500">
          Halaman ini hanya menampilkan data. Perubahan role dan permission
          belum tersedia.
        </p>
      </div>
    </div>
  );
}

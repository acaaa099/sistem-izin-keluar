
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

const initialFilters = {
  search: "",
  role_id: "",
  unit_id: "",
  status: "",
};

const initialForm = {
  name: "",
  username: "",
  email: "",
  nip: "",
  jabatan: "",
  pangkat_golongan: "",
  role_id: "",
  unit_id: "",
  supervisor_id: "",
  password: "",
  password_confirmation: "",
};

function getErrorMessage(error, fallback) {
  const data = error.response?.data;
  if (data?.errors) {
    return Object.values(data.errors).flat().join(" ");
  }
  return data?.message || fallback;
}

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [units, setUnits] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  });

  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState("");

  const fetchUsers = useCallback(async (pageNumber, activeFilters) => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/admin/users", {
        params: {
          page: pageNumber,
          per_page: 15,
          search: activeFilters.search,
          role_id: activeFilters.role_id,
          unit_id: activeFilters.unit_id,
          status: activeFilters.status,
        },
      });

      const result = response.data?.data;
      setUsers(Array.isArray(result?.users) ? result.users : []);
      setPagination(
        result?.pagination ?? {
          current_page: pageNumber,
          last_page: 1,
          per_page: 15,
          total: 0,
        }
      );
      setRoles(Array.isArray(result?.filters?.roles) ? result.filters.roles : []);
      setUnits(Array.isArray(result?.filters?.units) ? result.filters.units : []);
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Daftar pengguna gagal dimuat. Periksa koneksi API dan hak akses."
        )
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(page, appliedFilters);
  }, [page, appliedFilters, fetchUsers]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  };

  const handleApplyFilters = (event) => {
    event.preventDefault();
    setPage(1);
    setAppliedFilters({ ...filters });
  };

  const handleResetFilters = () => {
    setFilters({ ...initialFilters });
    setPage(1);
    setAppliedFilters({ ...initialFilters });
  };

  const goToPage = (nextPage) => {
    if (loading || nextPage < 1 || nextPage > pagination.last_page) return;
    setPage(nextPage);
  };

  const openCreateForm = () => {
    setEditingUser(null);
    setForm({ ...initialForm });
    setFormError("");
    setNotice("");
    setFormOpen(true);
  };

  const openEditForm = (user) => {
    setEditingUser(user);
    setForm({
      ...initialForm,
      name: user.name ?? "",
      username: user.username ?? "",
      email: user.email ?? "",
      nip: user.nip ?? "",
      jabatan: user.jabatan ?? "",
      pangkat_golongan: user.pangkat_golongan ?? "",
      role_id: user.role_id == null ? "" : String(user.role_id),
      unit_id: user.unit_id == null ? "" : String(user.unit_id),
      supervisor_id: user.supervisor_id ?? "",
    });
    setFormError("");
    setNotice("");
    setFormOpen(true);
  };

  const closeForm = () => {
    if (saving) return;
    setFormOpen(false);
    setEditingUser(null);
    setFormError("");
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSaveUser = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFormError("");
    setNotice("");

    const payload = {
      name: form.name.trim(),
      username: form.username.trim(),
      email: form.email.trim(),
      nip: form.nip.trim() || null,
      jabatan: form.jabatan.trim() || null,
      pangkat_golongan: form.pangkat_golongan.trim() || null,
      role_id: form.role_id,
      unit_id: form.unit_id,
      supervisor_id: form.supervisor_id || null,
    };

    if (form.password) {
      payload.password = form.password;
      payload.password_confirmation = form.password_confirmation;
    }

    try {
      if (editingUser) {
        await api.put(`/admin/users/${editingUser.id}`, payload);
        setNotice("Data pengguna berhasil diperbarui.");
      } else {
        if (!form.password) {
          setFormError("Password wajib diisi untuk akun baru.");
          setSaving(false);
          return;
        }
        payload.is_active = true;
        await api.post("/admin/users", payload);
        setNotice("Pengguna baru berhasil ditambahkan.");
      }

      setFormOpen(false);
      setEditingUser(null);
      setForm({ ...initialForm });
      await fetchUsers(page, appliedFilters);
    } catch (err) {
      setFormError(
        getErrorMessage(err, "Data pengguna gagal disimpan.")
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (user) => {
    const nextActive = !user.is_active;
    const action = nextActive ? "mengaktifkan" : "menonaktifkan";

    if (
      !window.confirm(
        `Yakin ingin ${action} akun ${user.name}? Data pengguna tidak akan dihapus.`
      )
    ) {
      return;
    }

    setNotice("");
    setError("");

    try {
      await api.patch(`/admin/users/${user.id}/status`, {
        is_active: nextActive,
      });
      setNotice(
        nextActive
          ? "Akun pengguna berhasil diaktifkan."
          : "Akun pengguna berhasil dinonaktifkan."
      );
      await fetchUsers(page, appliedFilters);
    } catch (err) {
      setError(getErrorMessage(err, "Status akun gagal diperbarui."));
    }
  };

  const handleDeleteUser = async (user) => {
    const confirmed = window.confirm(
      `Yakin ingin menghapus pengguna "${user.name}"? Tindakan ini tidak dapat dibatalkan. Jika pengguna memiliki riwayat izin atau relasi, sistem akan menolak penghapusan.`
    );

    if (!confirmed) return;

    setNotice("");
    setError("");
    setDeletingUserId(user.id);

    try {
      await api.delete(`/admin/users/${user.id}`);
      setNotice(`Pengguna "${user.name}" berhasil dihapus.`);

      // Jika pengguna terakhir pada halaman ini dihapus, kembali ke halaman sebelumnya.
      const remainingOnPage = users.length - 1;
      const nextPage = remainingOnPage === 0 && page > 1 ? page - 1 : page;
      setPage(nextPage);
      await fetchUsers(nextPage, appliedFilters);
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Pengguna gagal dihapus. Jika masih memiliki riwayat atau relasi, nonaktifkan akun sebagai gantinya."
        )
      );
    } finally {
      setDeletingUserId(null);
    }
  };

  const startItem =
    pagination.total === 0
      ? 0
      : (pagination.current_page - 1) * pagination.per_page + 1;

  const endItem = Math.min(
    pagination.current_page * pagination.per_page,
    pagination.total
  );

  const visiblePages = Array.from(
    { length: pagination.last_page },
    (_, index) => index + 1
  ).filter(
    (pageNumber) =>
      pageNumber === 1 ||
      pageNumber === pagination.last_page ||
      Math.abs(pageNumber - pagination.current_page) <= 1
  );

  const fieldClass =
    "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
  const labelClass = "block text-sm font-medium text-slate-700";

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <Link
          to="/admin"
          className="text-sm font-medium text-blue-700 hover:underline"
        >
          ← Kembali ke Admin
        </Link>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Manajemen Pengguna
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Kelola akun, jabatan, role, unit, dan status pengguna.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreateForm}
            className="rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
          >
            + Tambah Pengguna
          </button>
        </div>

        {notice && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
            {notice}
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {formOpen && (
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-slate-900">
                {editingUser ? "Edit Pengguna" : "Tambah Pengguna Baru"}
              </h2>
              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50 disabled:opacity-50"
              >
                Tutup
              </button>
            </div>

            {formError && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveUser} className="space-y-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <label className={labelClass}>
                  Nama lengkap *
                  <input
                    className={fieldClass}
                    name="name"
                    value={form.name}
                    onChange={handleFormChange}
                    required
                    maxLength={255}
                  />
                </label>

                <label className={labelClass}>
                  Username *
                  <input
                    className={fieldClass}
                    name="username"
                    value={form.username}
                    onChange={handleFormChange}
                    required
                    maxLength={255}
                    pattern="[A-Za-z0-9_-]+"
                    title="Gunakan huruf, angka, garis bawah, atau tanda hubung."
                  />
                </label>

                <label className={labelClass}>
                  Email *
                  <input
                    className={fieldClass}
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleFormChange}
                    required
                    maxLength={255}
                  />
                </label>

                <label className={labelClass}>
                  NIP
                  <input
                    className={fieldClass}
                    name="nip"
                    value={form.nip}
                    onChange={handleFormChange}
                    maxLength={255}
                  />
                </label>

                <label className={labelClass}>
                  Jabatan
                  <input
                    className={fieldClass}
                    name="jabatan"
                    value={form.jabatan}
                    onChange={handleFormChange}
                    maxLength={255}
                  />
                </label>

                <label className={labelClass}>
                  Pangkat/Golongan
                  <input
                    className={fieldClass}
                    name="pangkat_golongan"
                    value={form.pangkat_golongan}
                    onChange={handleFormChange}
                    maxLength={255}
                  />
                </label>

                <label className={labelClass}>
                  Role *
                  <select
                    className={fieldClass}
                    name="role_id"
                    value={form.role_id}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="">Pilih role</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className={labelClass}>
                  Unit *
                  <select
                    className={fieldClass}
                    name="unit_id"
                    value={form.unit_id}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="">Pilih unit</option>
                    {units.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className={labelClass}>
                  ID Atasan (opsional)
                  <input
                    className={fieldClass}
                    name="supervisor_id"
                    value={form.supervisor_id}
                    onChange={handleFormChange}
                    placeholder="Tempel UUID pengguna atasan"
                  />
                  <span className="mt-1 block text-xs font-normal text-slate-500">
                    Kosongkan jika tidak memiliki atasan langsung.
                  </span>
                </label>

                <label className={labelClass}>
                  {editingUser
                    ? "Password baru (opsional)"
                    : "Password *"}
                  <input
                    className={fieldClass}
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleFormChange}
                    required={!editingUser}
                    minLength={8}
                    autoComplete="new-password"
                  />
                  <span className="mt-1 block text-xs font-normal text-slate-500">
                    Minimal 8 karakter. Kosongkan saat edit jika tidak ingin mengganti.
                  </span>
                </label>

                <label className={labelClass}>
                  Konfirmasi password
                  <input
                    className={fieldClass}
                    type="password"
                    name="password_confirmation"
                    value={form.password_confirmation}
                    onChange={handleFormChange}
                    required={Boolean(form.password)}
                    minLength={8}
                    autoComplete="new-password"
                  />
                </label>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Menyimpan..."
                    : editingUser
                      ? "Simpan Perubahan"
                      : "Buat Pengguna"}
                </button>
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Batal
                </button>
              </div>
            </form>
          </section>
        )}

        <form
          onSubmit={handleApplyFilters}
          className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-2 lg:grid-cols-5"
        >
          <input
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            placeholder="Cari nama atau username..."
            className={fieldClass}
          />

          <select
            name="role_id"
            value={filters.role_id}
            onChange={handleFilterChange}
            className={fieldClass}
          >
            <option value="">Semua role</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>

          <select
            name="unit_id"
            value={filters.unit_id}
            onChange={handleFilterChange}
            className={fieldClass}
          >
            <option value="">Semua unit</option>
            {units.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.name}
              </option>
            ))}
          </select>

          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className={fieldClass}
          >
            <option value="">Semua status</option>
            <option value="active">Aktif</option>
            <option value="inactive">Nonaktif</option>
          </select>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700"
            >
              Terapkan
            </button>
            <button
              type="button"
              onClick={handleResetFilters}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50"
            >
              Reset
            </button>
          </div>
        </form>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <h2 className="font-semibold text-slate-900">Daftar Pengguna</h2>
            <span className="text-sm text-slate-500">
              Total {pagination.total} pengguna
            </span>
          </div>

          {loading ? (
            <div className="p-10 text-center text-sm text-slate-500">
              Memuat data pengguna...
            </div>
          ) : users.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-500">
              Tidak ada pengguna yang cocok dengan filter.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Pengguna</th>
                      <th className="px-4 py-3">NIP</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Unit</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900">
                            {user.name}
                          </div>
                          <div className="text-slate-500">
                            @{user.username}
                          </div>
                          <div className="text-xs text-slate-400">
                            {user.email}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {user.nip || "—"}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {user.role?.name || "—"}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {user.unit?.name || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                              user.is_active
                                ? "bg-green-100 text-green-800"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {user.is_active ? "Aktif" : "Nonaktif"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            <Link
                              to={`/admin/pengguna/${user.id}`}
                              className="rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                            >
                              Detail
                            </Link>
                            <button
                              type="button"
                              onClick={() => openEditForm(user)}
                              className="rounded-md border border-blue-200 px-2.5 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-50"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(user)}
                              className={`rounded-md border px-2.5 py-1.5 text-xs font-medium ${
                                user.is_active
                                  ? "border-red-200 text-red-700 hover:bg-red-50"
                                  : "border-green-200 text-green-700 hover:bg-green-50"
                              }`}
                            >
                              {user.is_active ? "Nonaktifkan" : "Aktifkan"}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(user)}
                              disabled={deletingUserId === user.id}
                              className="rounded-md border border-red-300 bg-red-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                              title="Hapus pengguna secara permanen"
                            >
                              {deletingUserId === user.id ? "Menghapus..." : "Hapus"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">
                  Menampilkan {startItem}–{endItem} dari {pagination.total} pengguna
                </p>
                <div className="flex flex-wrap items-center gap-1">
                  <button
                    type="button"
                    onClick={() => goToPage(page - 1)}
                    disabled={loading || page <= 1}
                    className="rounded-md border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-40"
                  >
                    Sebelumnya
                  </button>
                  {visiblePages.map((pageNumber) => (
                    <button
                      type="button"
                      key={pageNumber}
                      onClick={() => goToPage(pageNumber)}
                      className={`rounded-md border px-3 py-1.5 text-sm ${
                        pageNumber === pagination.current_page
                          ? "border-blue-700 bg-blue-700 text-white"
                          : "border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => goToPage(page + 1)}
                    disabled={loading || page >= pagination.last_page}
                    className="rounded-md border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-40"
                  >
                    Berikutnya
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

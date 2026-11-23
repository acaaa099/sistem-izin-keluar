
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../services/api";

function InfoItem({ label, value }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 break-words font-medium text-gray-900">
        {value === null || value === undefined || value === ""
          ? "-"
          : String(value)}
      </p>
    </div>
  );
}

function AdminUserDetail() {
  const { id } = useParams();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUser = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get(`/admin/users/${id}`);
      const result = response.data;

      if (result?.success === false || !result?.data?.user) {
        throw new Error(
          result?.message || "Data pengguna tidak ditemukan."
        );
      }

      setUser(result.data.user);
    } catch (err) {
      setUser(null);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Terjadi kesalahan saat mengambil detail pengguna."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Detail Pengguna
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Informasi akun pengguna sistem izin keluar kantor.
            </p>
          </div>

          <Link
            to="/admin/pengguna"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
          >
            ← Kembali ke Daftar Pengguna
          </Link>
        </div>

        {loading && (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
            <p className="text-gray-600">Memuat detail pengguna...</p>
          </div>
        )}

        {!loading && error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-5"
          >
            <h2 className="font-semibold text-red-700">
              Gagal Memuat Data
            </h2>
            <p className="mt-2 text-sm text-red-600">{error}</p>

            <button
              type="button"
              onClick={fetchUser}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {!loading && !error && user && (
          <div className="space-y-6">
            <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 border-b border-gray-100 pb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Informasi Pribadi dan Akun
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Identitas dan informasi akun pengguna.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <InfoItem label="Nama Lengkap" value={user.name} />
                <InfoItem label="Username" value={user.username} />
                <InfoItem label="NIP" value={user.nip} />
                <InfoItem label="Email" value={user.email} />
                <InfoItem label="Jabatan" value={user.jabatan} />
                <InfoItem
                  label="Pangkat / Golongan"
                  value={user.pangkat_golongan}
                />
              </div>
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 border-b border-gray-100 pb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Informasi Organisasi dan Hak Akses
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <InfoItem
                  label="Role"
                  value={user.role?.name}
                />
                <InfoItem
                  label="Unit Kerja"
                  value={user.unit?.name}
                />
                <InfoItem
                  label="Atasan / Supervisor"
                  value={user.supervisor?.name}
                />
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <p className="text-sm text-gray-500">Status Akun</p>
                  <span
                    className={`mt-2 inline-flex rounded-full px-3 py-1 text-sm font-medium ${
                      user.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {user.is_active ? "Aktif" : "Tidak Aktif"}
                  </span>
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Informasi Sistem
              </h2>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <InfoItem
                  label="ID Pengguna"
                  value={user.id}
                />
                <InfoItem
                  label="Dibuat Pada"
                  value={
                    user.created_at
                      ? new Date(user.created_at).toLocaleString("id-ID")
                      : "-"
                  }
                />
                <InfoItem
                  label="Terakhir Diperbarui"
                  value={
                    user.updated_at
                      ? new Date(user.updated_at).toLocaleString("id-ID")
                      : "-"
                  }
                />
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminUserDetail;

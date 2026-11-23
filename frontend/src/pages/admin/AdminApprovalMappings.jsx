
import { useEffect, useState } from "react";
import api from "../../services/api";

function AdminApprovalMappings() {
  const [mappings, setMappings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function fetchMappings() {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/admin/approval-mappings");
        const result = response.data?.data;
        const items = Array.isArray(result)
          ? result
          : result?.data;

        if (active) {
          setMappings(Array.isArray(items) ? items : []);
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
              "Data pemetaan persetujuan gagal dimuat."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchMappings();

    return () => {
      active = false;
    };
  }, []);

  const formatName = (item, roleKey, unitKey) => {
    const role = item[roleKey]?.name;
    const unit = item[unitKey]?.name;

    if (role && unit) return `${role} — ${unit}`;
    if (role) return role;
    if (unit) return unit;

    return "Tidak ditentukan";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Pemetaan Persetujuan
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Daftar pemetaan pihak yang mengajukan izin dan pihak yang
          memberikan persetujuan.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-semibold text-gray-800">
            Daftar Pemetaan
          </h2>
          <span className="text-sm text-gray-500">
            {mappings.length} data pada halaman ini
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">
            Memuat data pemetaan...
          </div>
        ) : error ? (
          <div className="p-6">
            <p className="text-sm text-red-600">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-3 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Muat Ulang
            </button>
          </div>
        ) : mappings.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Belum ada data pemetaan persetujuan.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-5 py-3 font-semibold">No.</th>
                  <th className="px-5 py-3 font-semibold">
                    Pihak Pengaju
                  </th>
                  <th className="px-5 py-3 font-semibold">
                    Pihak Penyetuju
                  </th>
                  <th className="px-5 py-3 font-semibold">Urutan</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {mappings.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4 text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-5 py-4 font-medium text-gray-800">
                      {formatName(
                        item,
                        "requester_role",
                        "requester_unit"
                      )}
                    </td>
                    <td className="px-5 py-4 text-gray-700">
                      {formatName(
                        item,
                        "approver_role",
                        "approver_unit"
                      )}
                    </td>
                    <td className="px-5 py-4 text-gray-700">
                      {item.sequence ?? "-"}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          item.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {item.is_active ? "Aktif" : "Tidak Aktif"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminApprovalMappings;

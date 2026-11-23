import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const LABEL_JENIS_IZIN = {
  "keperluan-pribadi": "Keperluan Pribadi",
  "urusan-keluarga": "Urusan Keluarga",
  "urusan-dinas": "Urusan Dinas",
  lainnya: "Lainnya",
};

function getLabelKeperluan(permit) {
  const value =
    permit?.jenis_izin ??
    permit?.jenisIzin ??
    permit?.keperluan ??
    permit?.purpose ??
    permit?.reason;

  if (!value) return "-";

  const normalized = String(value).trim().toLowerCase();
  return LABEL_JENIS_IZIN[normalized] ??
    String(value)
      .replaceAll("-", " ")
      .replace(/\b\w/g, (character) => character.toUpperCase());
}

export default function PermohonanIzin() {
  const navigate = useNavigate();
  const [permits, setPermits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadPermits() {
      try {
        const [meRes, permitsRes] = await Promise.all([
          api.get("/me"),
          api.get("/permits?scope=all"),
        ]);

        const meData =
          meRes.data?.data?.user ??
          meRes.data?.user ??
          meRes.data?.data ??
          meRes.data;

        const user = meData?.user ?? meData;
        const allPermits =
          permitsRes.data?.data?.permits ??
          permitsRes.data?.permits ??
          [];

        if (active) {
          setPermits(
            allPermits.filter(
              (permit) =>
                (permit.approval_target_id != null && String(permit.approval_target_id) === String(user?.id)) &&
                permit.status === "DIAJUKAN"
            )
          );
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ??
              err.message ??
              "Gagal memuat permohonan izin."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadPermits();

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="p-6">
      <h1 className="mb-2 text-2xl font-bold">Permohonan Izin</h1>
      <p className="mb-6 text-gray-600">
        Daftar izin yang menunggu keputusan Anda sebagai pejabat yang dituju.
      </p>

      {loading && <p>Memuat permohonan...</p>}
      {error && <p className="mb-4 text-red-600">{error}</p>}

      {!loading && !error && permits.length === 0 && (
        <div className="rounded-lg border bg-white p-6 text-gray-600">
          Belum ada permohonan izin yang menunggu keputusan Anda.
        </div>
      )}

      {!loading && !error && permits.length > 0 && (
        <div className="overflow-x-auto rounded-lg border bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3">Pegawai</th>
                <th className="p-3">Keperluan</th>
                <th className="p-3">Status</th>
                <th className="p-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {permits.map((permit) => (
                <tr key={permit.id} className="border-t">
                  <td className="p-3">
                    {permit.user?.name ?? permit.user?.nama ?? "-"}
                  </td>
                  <td className="p-3">{getLabelKeperluan(permit)}</td>
                  <td className="p-3">{permit.status ?? "-"}</td>
                  <td className="p-3">
                    <button
                      onClick={() =>
                        navigate(`/izin/detail/${permit.id}`, {
                          state: { from: "/permohonan-izin" },
                        })
                      }
                      className="rounded bg-blue-600 px-3 py-2 text-white hover:bg-blue-700"
                    >
                      Lihat Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

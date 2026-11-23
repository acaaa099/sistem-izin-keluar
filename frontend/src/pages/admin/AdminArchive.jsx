
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
};

const documentTypeLabel = (type) => {
  if (type === "SURAT_IZIN_PDF") return "Surat Izin PDF";
  if (type === "SIGNED_LETTER_PHOTO") return "Surat Bertanda Tangan";
  return "Dokumen";
};

const statusClass = (status) => {
  const styles = {
    SELESAI: "bg-green-100 text-green-700",
    "SURAT TERSEDIA": "bg-blue-100 text-blue-700",
    "SEDANG IZIN": "bg-amber-100 text-amber-700",
    MENUNGGU_PENYELESAIAN: "bg-orange-100 text-orange-700",
    DISETUJUI: "bg-blue-100 text-blue-700",
    DITOLAK: "bg-red-100 text-red-700",
  };

  return styles[status] || "bg-slate-100 text-slate-600";
};

export default function AdminArchive() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("SEMUA");
  const [statusFilter, setStatusFilter] = useState("SEMUA");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [preview, setPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const [actionLoading, setActionLoading] = useState("");

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/archive/documents");
      const result = response.data?.data?.documents;

      setDocuments(Array.isArray(result) ? result : []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Data arsip dokumen gagal dimuat. Silakan coba kembali."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    return () => {
      if (preview?.url) {
        URL.revokeObjectURL(preview.url);
      }
    };
  }, [preview]);

  const filteredDocuments = useMemo(() => {
    return documents.filter((document) => {
      const keyword = search.trim().toLowerCase();

      const applicantName =
        document.applicant?.name?.toLowerCase() || "";

      const applicantNip =
        String(document.applicant?.nip || "").toLowerCase();

      const permitId = String(document.permit_id || "").toLowerCase();

      const matchesSearch =
        !keyword ||
        applicantName.includes(keyword) ||
        applicantNip.includes(keyword) ||
        permitId.includes(keyword);

      const matchesType =
        typeFilter === "SEMUA" ||
        document.document_type === typeFilter;

      const matchesStatus =
        statusFilter === "SEMUA" ||
        document.status === statusFilter;

      const permitDate = document.tanggal_izin || "";

      const matchesStartDate =
        !startDate || permitDate >= startDate;

      const matchesEndDate =
        !endDate || permitDate <= endDate;

      return (
        matchesSearch &&
        matchesType &&
        matchesStatus &&
        matchesStartDate &&
        matchesEndDate
      );
    });
  }, [
    documents,
    search,
    typeFilter,
    statusFilter,
    startDate,
    endDate,
  ]);

  const pdfCount = documents.filter(
    (item) => item.document_type === "SURAT_IZIN_PDF"
  ).length;

  const signedCount = documents.filter(
    (item) => item.document_type === "SIGNED_LETTER_PHOTO"
  ).length;

  const availableCount = documents.filter(
    (item) => item.is_available
  ).length;

  const closePreview = () => {
    if (preview?.url) {
      URL.revokeObjectURL(preview.url);
    }

    setPreview(null);
    setPreviewError("");
  };

  const getDocumentBlob = async (document) => {
    if (!document.file_url) {
      throw new Error("Tautan dokumen tidak tersedia.");
    }

    const response = await api.get(document.file_url, {
      responseType: "blob",
      headers: {
        Accept: "*/*",
      },
    });

    return response.data;
  };

  const readBlobError = async (blob) => {
    try {
      const text = await blob.text();
      const result = JSON.parse(text);

      return result.message || "Dokumen gagal dibuka.";
    } catch {
      return "Dokumen gagal dibuka. Periksa hak akses atau koneksi server.";
    }
  };

  const handlePreview = async (document) => {
    try {
      setPreviewLoading(true);
      setPreviewError("");
      setActionLoading(document.id);

      const blob = await getDocumentBlob(document);

      const expectedType =
        document.document_type === "SURAT_IZIN_PDF"
          ? "application/pdf"
          : "image/jpeg";

      if (blob.type && !blob.type.includes(expectedType)) {
        const message = await readBlobError(blob);
        throw new Error(message);
      }

      const url = URL.createObjectURL(blob);

      setPreview((previous) => {
        if (previous?.url) {
          URL.revokeObjectURL(previous.url);
        }

        return {
          document,
          url,
          type: expectedType,
        };
      });
    } catch (err) {
      const responseBlob = err.response?.data;

      let message =
        err.response?.status === 403
          ? "Akses dokumen ditolak oleh server (403). Hak akses unduh PDF masih perlu diperbaiki."
          : err.message || "Dokumen gagal dibuka.";

      if (responseBlob instanceof Blob) {
        message = await readBlobError(responseBlob);
      }

      setPreviewError(message);
      setPreview(null);
    } finally {
      setPreviewLoading(false);
      setActionLoading("");
    }
  };

  const handleDownload = async (document) => {
    try {
      setActionLoading(document.id);
      setError("");

      const blob = await getDocumentBlob(document);

      const url = URL.createObjectURL(blob);
      const link = window.document.createElement("a");

      const extension =
        document.document_type === "SURAT_IZIN_PDF"
          ? "pdf"
          : "jpg";

      link.href = url;
      link.download = `dokumen-izin-${document.permit_id}-${extension}`;

      window.document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);
    } catch (err) {
      const responseBlob = err.response?.data;

      let message =
        err.response?.status === 403
          ? "Akses unduh dokumen ditolak server (403)."
          : err.message || "Dokumen gagal diunduh.";

      if (responseBlob instanceof Blob) {
        message = await readBlobError(responseBlob);
      }

      setError(message);
    } finally {
      setActionLoading("");
    }
  };

  const resetFilters = () => {
    setSearch("");
    setTypeFilter("SEMUA");
    setStatusFilter("SEMUA");
    setStartDate("");
    setEndDate("");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-5 py-5 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-medium text-blue-700">
            SISTEM INFORMASI IZIN KELUAR KANTOR
          </p>

          <h1 className="mt-1 text-2xl font-bold text-slate-900">
            Arsip Dokumen
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Pengadilan Negeri Palangka Raya
          </p>

          <Link
            to="/admin"
            className="mt-4 inline-flex items-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            ← Kembali ke Admin
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-5 py-7 sm:px-8">
        <section className="rounded-2xl bg-slate-900 p-6 text-white">
          <p className="text-sm text-slate-300">
            Pusat Pengelolaan Dokumen
          </p>

          <h2 className="mt-2 text-2xl font-bold">
            Arsip Surat Izin Pegawai
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
            Lihat dan kelola akses dokumen surat izin yang dihasilkan
            sistem maupun surat yang telah ditandatangani.
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Total Dokumen</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {documents.length}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Seluruh dokumen arsip
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Surat PDF</p>
            <p className="mt-2 text-3xl font-bold text-red-600">
              {pdfCount}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Surat yang dibuat sistem
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Surat Bertanda Tangan
            </p>
            <p className="mt-2 text-3xl font-bold text-blue-700">
              {signedCount}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Dokumen yang diunggah
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">File Tersedia</p>
            <p className="mt-2 text-3xl font-bold text-green-600">
              {availableCount}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              File ditemukan di penyimpanan
            </p>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Daftar Arsip Dokumen
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Cari dan saring dokumen berdasarkan informasi pengajuan.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchDocuments}
              disabled={loading}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              {loading ? "Memuat..." : "↻ Muat Ulang"}
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari nama, NIP, atau ID pengajuan..."
              className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
            >
              <option value="SEMUA">Semua Jenis Dokumen</option>
              <option value="SURAT_IZIN_PDF">Surat Izin PDF</option>
              <option value="SIGNED_LETTER_PHOTO">
                Surat Bertanda Tangan
              </option>
            </select>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
            >
              <option value="SEMUA">Semua Status</option>
              <option value="SURAT TERSEDIA">Surat Tersedia</option>
              <option value="SEDANG IZIN">Sedang Izin</option>
              <option value="MENUNGGU PENYELESAIAN">
                Menunggu Penyelesaian
              </option>
              <option value="SELESAI">Selesai</option>
              <option value="DISETUJUI">Disetujui</option>
              <option value="DITOLAK">Ditolak</option>
            </select>

            <div>
              <label className="mb-1 block text-xs text-slate-500">
                Tanggal izin mulai
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-slate-500">
                Tanggal izin sampai
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
              />
            </div>

            <button
              type="button"
              onClick={resetFilters}
              className="self-end rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-200"
            >
              Reset Filter
            </button>
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="py-14 text-center text-sm text-slate-500">
              Memuat data arsip dokumen...
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="py-14 text-center">
              <p className="font-medium text-slate-700">
                Tidak ada dokumen ditemukan.
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Coba ubah kata kunci atau filter pencarian.
              </p>
            </div>
          ) : (
            <div className="mt-5 overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full min-w-[1000px] text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-3 font-semibold">No.</th>
                    <th className="px-4 py-3 font-semibold">
                      Pemohon
                    </th>
                    <th className="px-4 py-3 font-semibold">
                      Jenis Dokumen
                    </th>
                    <th className="px-4 py-3 font-semibold">
                      Tanggal Izin
                    </th>
                    <th className="px-4 py-3 font-semibold">
                      Status Izin
                    </th>
                    <th className="px-4 py-3 font-semibold">
                      Ketersediaan
                    </th>
                    <th className="px-4 py-3 text-center font-semibold">
                      Aksi
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredDocuments.map((document, index) => (
                    <tr
                      key={document.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-4 py-4 text-slate-500">
                        {index + 1}
                      </td>

                      <td className="px-4 py-4">
                        <p className="font-semibold text-slate-800">
                          {document.applicant?.name || "-"}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          NIP: {document.applicant?.nip || "-"}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          ID Pengajuan: #{document.permit_id}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                            document.document_type === "SURAT_IZIN_PDF"
                              ? "bg-red-50 text-red-700"
                              : "bg-blue-50 text-blue-700"
                          }`}
                        >
                          {documentTypeLabel(document.document_type)}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-slate-600">
                        {formatDate(document.tanggal_izin)}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(
                            document.status
                          )}`}
                        >
                          {document.status || "-"}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        {document.is_available ? (
                          <span className="text-xs font-medium text-green-700">
                            ● File tersedia
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-red-600">
                            ● File tidak ditemukan
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex justify-center gap-2">
                          <button
                            type="button"
                            disabled={
                              !document.is_available ||
                              actionLoading === document.id
                            }
                            onClick={() => handlePreview(document)}
                            className="rounded-lg border border-blue-200 px-3 py-2 text-xs font-medium text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            Lihat
                          </button>

                          <button
                            type="button"
                            disabled={
                              !document.is_available ||
                              actionLoading === document.id
                            }
                            onClick={() => handleDownload(document)}
                            className="rounded-lg bg-blue-700 px-3 py-2 text-xs font-medium text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            Unduh
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && filteredDocuments.length > 0 && (
            <p className="mt-3 text-xs text-slate-500">
              Menampilkan {filteredDocuments.length} dari{" "}
              {documents.length} dokumen.
            </p>
          )}
        </section>
      </main>

      {(previewLoading || preview || previewError) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-3 sm:p-6">
          <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 sm:px-6">
              <div>
                <h2 className="font-bold text-slate-900">
                  Pratinjau Dokumen
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  {preview?.document?.applicant?.name || "Dokumen Arsip"}
                </p>
              </div>

              <button
                type="button"
                onClick={closePreview}
                className="rounded-lg px-3 py-2 text-lg text-slate-500 hover:bg-slate-100"
                aria-label="Tutup pratinjau"
              >
                ✕
              </button>
            </div>

            <div className="min-h-[300px] flex-1 overflow-auto bg-slate-100 p-3 sm:p-5">
              {previewLoading ? (
                <div className="py-20 text-center text-slate-500">
                  Membuka dokumen...
                </div>
              ) : previewError ? (
                <div className="mx-auto mt-12 max-w-xl rounded-lg border border-red-200 bg-red-50 p-5 text-center text-sm text-red-700">
                  {previewError}
                </div>
              ) : preview?.type === "application/pdf" ? (
                <iframe
                  title="Pratinjau surat izin PDF"
                  src={preview.url}
                  className="h-[70vh] w-full rounded-lg border border-slate-300 bg-white"
                />
              ) : preview ? (
                <div className="flex min-h-[60vh] items-center justify-center">
                  <img
                    src={preview.url}
                    alt="Surat izin bertanda tangan"
                    className="max-h-[70vh] max-w-full rounded-lg bg-white object-contain shadow"
                  />
                </div>
              ) : null}
            </div>

            {preview && (
              <div className="flex justify-end border-t border-slate-200 px-4 py-3">
                <button
                  type="button"
                  onClick={() => handleDownload(preview.document)}
                  disabled={actionLoading === preview.document.id}
                  className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-50"
                >
                  Unduh Dokumen
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

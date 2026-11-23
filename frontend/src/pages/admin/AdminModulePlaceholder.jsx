
import { Link } from "react-router-dom";

export default function AdminModulePlaceholder({ title }) {
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-5xl">
        <Link
          to="/admin"
          className="text-sm font-medium text-blue-700 hover:underline"
        >
          ← Kembali ke Admin Sistem
        </Link>

        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-blue-700">
            ADMINISTRASI SISTEM
          </p>

          <h1 className="mt-2 text-2xl font-bold text-slate-900">
            {title}
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            Halaman ini sudah terhubung ke navigasi Admin Sistem.
            Fitur pengelolaan data pada modul ini akan diimplementasikan
            pada tahap berikutnya.
          </p>
        </section>
      </div>
    </div>
  );
}


import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const token = localStorage.getItem("auth_token");

  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("auth_user") || "null");
  } catch {
    user = null;
  }

  if (!token) {
    window.location.replace("/");
    return null;
  }

  const roleName =
    typeof user?.role === "string" ? user.role : user?.role?.name;

  if (roleName !== "Admin Sistem") {
    window.location.replace("/dashboard");
    return null;
  }

  const menus = [
    {
      title: "Manajemen Pengguna",
      description: "Kelola akun, identitas, jabatan, dan status aktif pengguna.",
      path: "/admin/pengguna",
      icon: "👥",
    },
    {
      title: "Manajemen Role",
      description: "Kelola peran pengguna dan pembagian kewenangan sistem.",
      path: "/admin/role",
      icon: "🛡️",
    },
    {
      title: "Manajemen Permission",
      description: "Lihat dan kelola hak akses yang tersedia dalam sistem.",
      path: "/admin/permission",
      icon: "🔐",
    },
    {
      title: "Manajemen Unit",
      description: "Kelola data dan struktur unit kerja pengadilan.",
      path: "/admin/unit",
      icon: "🏢",
    },
    {
      title: "Arsip Dokumen",
      description:
        "Lihat arsip surat izin PDF dan dokumen surat yang telah ditandatangani.",
      path: "/admin/arsip",
      icon: "📁",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white px-6 py-5">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-medium text-blue-700">
            SISTEM INFORMASI IZIN KELUAR KANTOR
          </p>

          <h1 className="mt-1 text-2xl font-bold text-slate-900">
            Admin Sistem
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Pengadilan Negeri Palangka Raya
          </p>

          <Link
            to="/dashboard"
            className="mt-4 inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            ← Kembali ke Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <section className="mb-8 rounded-2xl bg-slate-900 p-6 text-white">
          <p className="text-sm text-slate-300">
            Panel Administrasi
          </p>

          <h2 className="mt-2 text-2xl font-bold">
            Selamat datang, {user?.name || "Admin Sistem"}
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
            Kelola pengguna, peran, hak akses, unit kerja, dan
            arsip dokumen dalam Sistem Informasi Izin Keluar Kantor
            melalui menu administrasi berikut.
          </p>
        </section>

        <div className="mb-5">
          <h2 className="text-lg font-bold text-slate-900">
            Menu Administrasi
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Pilih modul administrasi yang ingin dikelola.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {menus.map((menu) => (
            <article
              key={menu.path}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="text-3xl">
                {menu.icon}
              </div>

              <h3 className="mt-4 font-semibold text-slate-900">
                {menu.title}
              </h3>

              <p className="mt-2 min-h-12 text-sm leading-6 text-slate-500">
                {menu.description}
              </p>

              <Link
                to={menu.path}
                className="mt-4 inline-flex rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
              >
                Buka modul
              </Link>
            </article>
          ))}
        </div>

        <p className="mt-8 text-xs leading-5 text-slate-500">
          Panel administrasi digunakan untuk mendukung pengelolaan
          data pengguna, kewenangan, unit kerja, dan arsip dokumen
          pada sistem perizinan pegawai.
        </p>
      </main>
    </div>
  );
}

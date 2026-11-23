
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/auth/Login";
import Dashboard from "./pages/dashboard/Dashboard";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminUserDetail from "./pages/admin/AdminUserDetail";
import AdminRoles from "./pages/admin/AdminRoles";
import AdminPermissions from "./pages/admin/AdminPermissions";
import AdminUnits from "./pages/admin/AdminUnits";
import AdminArchive from "./pages/admin/AdminArchive";

import AjukanIzin from "./pages/izin/AjukanIzin";
import RiwayatIzin from "./pages/izin/RiwayatIzin";
import MonitoringIzinPegawai from "./pages/izin/MonitoringIzinPegawai";
import PermohonanIzin from "./pages/izin/PermohonanIzin";
import MonitoringIzin from "./pages/izin/MonitoringIzin";
import DetailIzin from "./pages/izin/DetailIzin";

import Profile from "./pages/profile/Profile";
import GantiPassword from "./pages/profile/GantiPassword";

import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Halaman administrasi khusus Admin Sistem */}
          <Route element={<ProtectedRoute allowedRoles={["Admin Sistem"]} />}>
            <Route path="/admin" element={<AdminDashboard />} />

            {/* Manajemen Pengguna */}
            <Route path="/admin/pengguna" element={<AdminUsers />} />
            <Route
              path="/admin/pengguna/:id"
              element={<AdminUserDetail />}
            />

            {/* Manajemen Role, Permission, dan Unit */}
            <Route path="/admin/role" element={<AdminRoles />} />
            <Route
              path="/admin/permission"
              element={<AdminPermissions />}
            />
            <Route path="/admin/unit" element={<AdminUnits />} />

            {/* Arsip Dokumen */}
            <Route path="/admin/arsip" element={<AdminArchive />} />
          </Route>

          {/* Fitur izin pegawai */}
          <Route path="/izin/ajukan" element={<AjukanIzin />} />
          <Route path="/riwayat-izin" element={<RiwayatIzin />} />
          <Route path="/permohonan-izin" element={<PermohonanIzin />} />
          <Route path="/monitoring-izin" element={<MonitoringIzin />} />
          <Route
            path="/monitoring-izin-pegawai"
            element={<MonitoringIzinPegawai />}
          />
          <Route path="/izin/detail/:id" element={<DetailIzin />} />

          {/* Profil */}
          <Route path="/profil" element={<Profile />} />
          <Route path="/profil/password" element={<GantiPassword />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

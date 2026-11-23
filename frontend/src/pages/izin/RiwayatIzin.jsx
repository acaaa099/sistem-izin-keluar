import { useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

import api from "../../services/api";

// ======================================================

// ICONS

// ======================================================

function IconArrowLeft(props) {

  return (

    <svg

      viewBox="0 0 24 24"

      fill="none"

      stroke="currentColor"

      strokeWidth="1.8"

      strokeLinecap="round"

      strokeLinejoin="round"

      {...props}

    >

      <path d="M19 12H5" />

      <path d="m11 18-6-6 6-6" />

    </svg>

  );

}

function IconSearch(props) {

  return (

    <svg

      viewBox="0 0 24 24"

      fill="none"

      stroke="currentColor"

      strokeWidth="1.8"

      strokeLinecap="round"

      strokeLinejoin="round"

      {...props}

    >

      <circle cx="11" cy="11" r="7" />

      <path d="m20 20-4-4" />

    </svg>

  );

}

function IconChevronRight(props) {

  return (

    <svg

      viewBox="0 0 24 24"

      fill="none"

      stroke="currentColor"

      strokeWidth="1.8"

      strokeLinecap="round"

      strokeLinejoin="round"

      {...props}

    >

      <path d="m9 18 6-6-6-6" />

    </svg>

  );

}

function IconClipboard(props) {

  return (

    <svg

      viewBox="0 0 24 24"

      fill="none"

      stroke="currentColor"

      strokeWidth="1.8"

      strokeLinecap="round"

      strokeLinejoin="round"

      {...props}

    >

      <rect x="5" y="4" width="14" height="17" rx="2" />

      <path d="M9 4.5V3h6v1.5" />

      <path d="M9 9h6" />

      <path d="M9 13h6" />

      <path d="M9 17h4" />

    </svg>

  );

}

function IconPlus(props) {

  return (

    <svg

      viewBox="0 0 24 24"

      fill="none"

      stroke="currentColor"

      strokeWidth="1.8"

      strokeLinecap="round"

      strokeLinejoin="round"

      {...props}

    >

      <path d="M12 5v14M5 12h14" />

    </svg>

  );

}

// ======================================================

// HELPERS

// ======================================================

function getStatusLabel(status) {

  const labels = {

    DIAJUKAN: "Diajukan",

    REVISI: "Perlu Revisi",

    DISETUJUI: "Disetujui",

    "SURAT TERSEDIA": "Surat Tersedia",

    "SEDANG IZIN": "Sedang Izin",

    "MENUNGGU PENYELESAIAN": "Menunggu Penyelesaian",

    SELESAI: "Selesai",

    DITOLAK: "Ditolak",

  };

  return labels[status] || status;

}

function getStatusClass(status) {

  const classes = {

    DIAJUKAN:

      "bg-amber-50 text-amber-700 border-amber-200",

    REVISI:

      "bg-orange-50 text-orange-700 border-orange-200",

    DISETUJUI:

      "bg-blue-50 text-blue-700 border-blue-200",

    "SURAT TERSEDIA":

      "bg-indigo-50 text-indigo-700 border-indigo-200",

    "SEDANG IZIN":

      "bg-purple-50 text-purple-700 border-purple-200",

    "MENUNGGU PENYELESAIAN":

      "bg-cyan-50 text-cyan-700 border-cyan-200",

    SELESAI:

      "bg-emerald-50 text-emerald-700 border-emerald-200",

    DITOLAK:

      "bg-red-50 text-red-700 border-red-200",

  };

  return (

    classes[status] ||

    "bg-slate-50 text-slate-600 border-slate-200"

  );

}

function getJenisIzinLabel(jenisIzin) {
  if (!jenisIzin) {
    return "-";
  }

  const normalized = String(jenisIzin)
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, "-");

  const labels = {
    "keperluan-pribadi": "Keperluan Pribadi",
    "urusan-keluarga": "Urusan Keluarga",
    "urusan-dinas": "Urusan Dinas",
    lainnya: "Lainnya",
  };

  return labels[normalized] || String(jenisIzin);
}

function formatTanggal(tanggal) {

  if (!tanggal) {

    return "-";

  }

  const date = new Date(tanggal);

  if (Number.isNaN(date.getTime())) {

    return tanggal;

  }

  return new Intl.DateTimeFormat("id-ID", {

    day: "2-digit",

    month: "long",

    year: "numeric",

  }).format(date);

}

function formatJam(jam) {

  if (!jam) {

    return "-";

  }

  return String(jam).slice(0, 5);

}

function normalizePermit(permit) {

  return {

    ...permit,

    jenis_izin: getJenisIzinLabel(permit.jenis_izin),

    tanggal_izin: formatTanggal(permit.tanggal_izin),

    jam_keluar: formatJam(permit.jam_keluar),

    estimasi_kembali: formatJam(

      permit.estimasi_kembali

    ),

    alasan: permit.alasan || "-",

    status: permit.status || "",

  };

}

// ======================================================

// PAGE

// ======================================================

export default function RiwayatIzin() {

  const navigate = useNavigate();

  const [permits, setPermits] = useState([]);

  const [activeFilter, setActiveFilter] =

    useState("SEMUA");

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [errorMessage, setErrorMessage] =

    useState("");

  const filters = [

    {

      key: "SEMUA",

      label: "Semua",

    },

    {

      key: "DIAJUKAN",

      label: "Diajukan",

    },

    {

      key: "DISETUJUI",

      label: "Disetujui",

    },

    {

      key: "SELESAI",

      label: "Selesai",

    },

    {

      key: "DITOLAK",

      label: "Ditolak",

    },

  ];

  // ======================================================

  // AMBIL DATA

  // ======================================================

  useEffect(() => {

    const fetchPermits = async () => {

      setLoading(true);

      setErrorMessage("");

      try {

        const response = await api.get("/permits", { params: { scope: "own" } });

        console.log(

          "Response riwayat izin:",

          response.data

        );

        const apiPermits =

          response.data?.data?.permits ||

          response.data?.data ||

          [];

        if (!Array.isArray(apiPermits)) {

          throw new Error(

            "Format data riwayat dari server tidak sesuai."

          );

        }

        const normalizedPermits =

          apiPermits.map(normalizePermit);

        setPermits(normalizedPermits);

      } catch (error) {

        console.error(

          "Gagal mengambil riwayat izin:",

          error

        );

        if (error.response?.status === 401) {

          setErrorMessage(

            "Sesi login telah berakhir. Silakan login kembali."

          );

          return;

        }

        setErrorMessage(

          error.response?.data?.message ||

            "Gagal mengambil data riwayat izin. Silakan coba lagi."

        );

      } finally {

        setLoading(false);

      }

    };

    fetchPermits();

  }, []);

  // ======================================================

  // FILTER

  // ======================================================

  const filteredPermits = useMemo(() => {

    const keyword = search.trim().toLowerCase();

    return permits.filter((permit) => {

      const matchesFilter =

        activeFilter === "SEMUA" ||

        permit.status === activeFilter;

      const matchesSearch =

        !keyword ||

        permit.jenis_izin

          .toLowerCase()

          .includes(keyword) ||

        permit.alasan

          .toLowerCase()

          .includes(keyword) ||

        permit.tanggal_izin

          .toLowerCase()

          .includes(keyword);

      return matchesFilter && matchesSearch;

    });

  }, [permits, activeFilter, search]);

  // ======================================================

  // NAVIGATION

  // ======================================================

  const handleBack = () => {

    navigate("/dashboard");

  };

  const handleAjukanIzin = () => {

    navigate("/izin/ajukan");

  };

  const handleDetail = (permit) => {

    navigate(`/izin/detail/${permit.id}`);

  };

  // ======================================================

  // RENDER

  // ======================================================

  return (

    <div

      style={{

        minHeight: "100vh",

        width: "100%",

        background: "#F6F8FC",

        color: "#1E293B",

      }}

    >

      {/* ==================================================

          TOPBAR

      ================================================== */}

      <header

        style={{

          width: "100%",

          background: "#FFFFFF",

          borderBottom: "1px solid #E2E8F0",

        }}

      >

        <div

          style={{

            width: "100%",

            maxWidth: "1050px",

            margin: "0 auto",

            minHeight: "72px",

            padding: "14px 20px",

            boxSizing: "border-box",

            display: "flex",

            alignItems: "center",

            justifyContent: "space-between",

          }}

        >

          <button

            type="button"

            onClick={handleBack}

            className="

              inline-flex

              items-center

              gap-2

              rounded-lg

              px-2

              py-2

              text-sm

              font-medium

              text-slate-500

              transition

              hover:bg-slate-50

              hover:text-[#3F55C3]

            "

          >

            <IconArrowLeft className="h-5 w-5" />

            Kembali

          </button>

          <button

            type="button"

            onClick={handleAjukanIzin}

            className="

              inline-flex

              items-center

              gap-2

              rounded-xl

              bg-[#4F70D8]

              px-4

              py-2.5

              text-sm

              font-semibold

              text-white

              shadow-[0_6px_16px_rgba(79,112,216,0.20)]

              transition

              hover:bg-[#4163CB]

              active:scale-[0.98]

            "

          >

            <IconPlus className="h-4 w-4" />

            Ajukan Izin

          </button>

        </div>

      </header>

      {/* ==================================================

          CONTENT

      ================================================== */}

      <div

        style={{

          width: "100%",

          display: "flex",

          justifyContent: "center",

        }}

      >

        <main

          style={{

            width: "100%",

            maxWidth: "1050px",

            padding: "34px 20px 60px",

            boxSizing: "border-box",

          }}

        >

          {/* ==================================================

              HEADER

          ================================================== */}

          <section className="mb-6">

            <span

              className="

                inline-flex

                rounded-full

                bg-[#EEF2FF]

                px-3

                py-1

                text-xs

                font-semibold

                text-[#4F67D8]

              "

            >

              Pengajuan Izin

            </span>

            <h1

              className="

                mt-2

                text-2xl

                font-bold

                tracking-tight

                text-slate-900

                sm:text-3xl

              "

            >

              Riwayat Izin

            </h1>

            <p

              className="

                mt-1.5

                max-w-2xl

                text-sm

                leading-6

                text-slate-500

              "

            >

              Lihat status dan riwayat seluruh

              pengajuan izin yang telah Anda lakukan.

            </p>

          </section>

          {/* ==================================================

              FILTER + SEARCH

          ================================================== */}

          <section

            className="

              mb-6

              rounded-2xl

              border

              border-slate-200

              bg-white

              p-4

              shadow-[0_8px_30px_rgba(15,23,42,0.04)]

              sm:p-5

            "

          >

            {/* FILTER */}

            <div className="flex flex-wrap gap-2">

              {filters.map((filter) => {

                const active =

                  activeFilter === filter.key;

                return (

                  <button

                    key={filter.key}

                    type="button"

                    onClick={() =>

                      setActiveFilter(filter.key)

                    }

                    className={`

                      rounded-xl

                      px-4

                      py-2

                      text-xs

                      font-semibold

                      transition

                      ${

                        active

                          ? "bg-[#4F70D8] text-white shadow-sm"

                          : "bg-[#F5F7FB] text-slate-500 hover:bg-[#EDF1F8] hover:text-slate-700"

                      }

                    `}

                  >

                    {filter.label}

                  </button>

                );

              })}

            </div>

            {/* ==================================================

                SEARCH

                ICON DAN INPUT TIDAK LAGI ABSOLUTE

            ================================================== */}

            <div

              style={{

                width: "100%",

                display: "flex",

                justifyContent: "center",

                marginTop: "16px",

              }}

            >

              <div

                style={{

                  width: "100%",

                  maxWidth: "760px",

                  height: "48px",

                  display: "flex",

                  alignItems: "center",

                  boxSizing: "border-box",

                  border: "1px solid #E2E8F0",

                  borderRadius: "12px",

                  background: "#F8FAFD",

                  paddingLeft: "16px",

                  paddingRight: "16px",

                  transition: "all 0.2s ease",

                }}

              >

                {/* ICON */}

                <div

                  style={{

                    width: "24px",

                    height: "24px",

                    flexShrink: 0,

                    display: "flex",

                    alignItems: "center",

                    justifyContent: "center",

                    color: "#94A3B8",

                    marginRight: "12px",

                  }}

                >

                  <IconSearch

                    style={{

                      width: "20px",

                      height: "20px",

                    }}

                  />

                </div>

                {/* INPUT */}

                <input

                  type="text"

                  value={search}

                  onChange={(e) =>

                    setSearch(e.target.value)

                  }

                  placeholder="Cari jenis izin, alasan, atau tanggal..."

                  style={{

                    width: "100%",

                    height: "100%",

                    border: "none",

                    outline: "none",

                    background: "transparent",

                    color: "#334155",

                    fontSize: "14px",

                    fontFamily: "Poppins, sans-serif",

                    padding: "0",

                    margin: "0",

                  }}

                />

              </div>

            </div>

          </section>

          {/* ==================================================

              RESULT HEADER

          ================================================== */}

          <div

            className="

              mb-4

              flex

              items-center

              justify-between

              gap-4

            "

          >

            <p

              className="

                text-sm

                font-semibold

                text-slate-700

              "

            >

              {loading

                ? "Memuat..."

                : `${filteredPermits.length} Pengajuan`}

            </p>

            <p

              className="

                text-xs

                text-slate-400

              "

            >

              Data dari sistem

            </p>

          </div>

          {/* ==================================================

              ERROR

          ================================================== */}

          {errorMessage && (

            <div

              className="

                mb-5

                rounded-2xl

                border

                border-red-200

                bg-red-50

                px-5

                py-4

              "

            >

              <p

                className="

                  text-sm

                  font-semibold

                  text-red-700

                "

              >

                Gagal mengambil data

              </p>

              <p

                className="

                  mt-1

                  text-sm

                  text-red-600

                "

              >

                {errorMessage}

              </p>

              <button

                type="button"

                onClick={() =>

                  window.location.reload()

                }

                className="

                  mt-3

                  rounded-lg

                  bg-white

                  px-3

                  py-2

                  text-xs

                  font-semibold

                  text-red-700

                  shadow-sm

                  ring-1

                  ring-red-200

                  transition

                  hover:bg-red-50

                "

              >

                Coba Lagi

              </button>

            </div>

          )}

          {/* ==================================================

              LOADING

          ================================================== */}

          {loading ? (

            <div

              className="

                rounded-2xl

                border

                border-slate-200

                bg-white

                px-6

                py-16

                text-center

                shadow-[0_8px_24px_rgba(15,23,42,0.03)]

              "

            >

              <div

                className="

                  mx-auto

                  h-8

                  w-8

                  animate-spin

                  rounded-full

                  border-2

                  border-slate-200

                  border-t-[#5A81FA]

                "

              />

              <p

                className="

                  mt-4

                  text-sm

                  text-slate-500

                "

              >

                Memuat riwayat izin...

              </p>

            </div>

          ) : filteredPermits.length > 0 ? (

            /* ==================================================

               LIST

            ================================================== */

            <div className="space-y-4">

              {filteredPermits.map((permit) => (

                <article

                  key={permit.id}

                  className="

                    rounded-2xl

                    border

                    border-slate-200

                    bg-white

                    p-5

                    shadow-[0_7px_24px_rgba(15,23,42,0.04)]

                    transition

                    hover:-translate-y-[1px]

                    hover:border-slate-300

                    hover:shadow-[0_10px_28px_rgba(15,23,42,0.07)]

                    sm:p-6

                  "

                >

                  <div

                    className="

                      flex

                      flex-col

                      gap-5

                      lg:flex-row

                      lg:items-center

                      lg:justify-between

                    "

                  >

                    {/* LEFT */}

                    <div className="min-w-0 flex-1">

                      <div

                        className="

                          flex

                          flex-wrap

                          items-center

                          gap-2.5

                        "

                      >

                        <h2

                          className="

                            text-base

                            font-bold

                            text-slate-900

                            sm:text-[17px]

                          "

                        >

                          {permit.jenis_izin}

                        </h2>

                        <span

                          className={`

                            inline-flex

                            items-center

                            rounded-full

                            border

                            px-2.5

                            py-1

                            text-[11px]

                            font-semibold

                            ${getStatusClass(

                              permit.status

                            )}

                          `}

                        >

                          {getStatusLabel(

                            permit.status

                          )}

                        </span>

                      </div>

                      <div

                        className="

                          mt-3

                          flex

                          flex-wrap

                          items-center

                          gap-x-3

                          gap-y-1.5

                          text-sm

                          text-slate-500

                        "

                      >

                        <span>

                          {permit.tanggal_izin}

                        </span>

                        <span className="text-slate-300">

                          •

                        </span>

                        <span>

                          {permit.jam_keluar} -{" "}

                          {permit.estimasi_kembali}

                        </span>

                      </div>

                      <p

                        className="

                          mt-2.5

                          max-w-[700px]

                          line-clamp-2

                          text-sm

                          leading-6

                          text-slate-500

                        "

                      >

                        {permit.alasan}

                      </p>

                    </div>

                    {/* DETAIL */}

                    <button

                      type="button"

                      onClick={() =>

                        handleDetail(permit)

                      }

                      className="

                        inline-flex

                        shrink-0

                        items-center

                        justify-center

                        gap-2

                        self-start

                        rounded-xl

                        border

                        border-slate-200

                        bg-white

                        px-4

                        py-2.5

                        text-sm

                        font-semibold

                        text-slate-600

                        transition

                        hover:border-[#C5D0FF]

                        hover:bg-[#F5F7FF]

                        hover:text-[#3F55C3]

                        lg:self-center

                      "

                    >

                      Lihat Detail

                      <IconChevronRight

                        className="h-4 w-4"

                      />

                    </button>

                  </div>

                </article>

              ))}

            </div>

          ) : (

            /* ==================================================

               EMPTY STATE

            ================================================== */

            <div

              className="

                rounded-2xl

                border

                border-dashed

                border-slate-300

                bg-white

                px-6

                py-16

                text-center

                shadow-[0_8px_24px_rgba(15,23,42,0.03)]

              "

            >

              <div

                className="

                  mx-auto

                  flex

                  h-12

                  w-12

                  items-center

                  justify-center

                  rounded-xl

                  bg-slate-100

                  text-slate-400

                "

              >

                <IconClipboard className="h-6 w-6" />

              </div>

              <h2

                className="

                  mt-4

                  text-base

                  font-bold

                  text-slate-800

                "

              >

                Belum ada pengajuan

              </h2>

              <p

                className="

                  mx-auto

                  mt-2

                  max-w-md

                  text-sm

                  leading-6

                  text-slate-500

                "

              >

                Tidak ditemukan pengajuan yang

                sesuai dengan filter atau pencarian

                Anda.

              </p>

              {search ||

              activeFilter !== "SEMUA" ? (

                <button

                  type="button"

                  onClick={() => {

                    setSearch("");

                    setActiveFilter("SEMUA");

                  }}

                  className="

                    mt-4

                    rounded-lg

                    bg-[#EEF2FF]

                    px-4

                    py-2

                    text-xs

                    font-semibold

                    text-[#3F55C3]

                    transition

                    hover:bg-[#E3E8FF]

                  "

                >

                  Reset Filter

                </button>

              ) : (

                <button

                  type="button"

                  onClick={handleAjukanIzin}

                  className="

                    mt-4

                    inline-flex

                    items-center

                    gap-2

                    rounded-xl

                    bg-[#4F70D8]

                    px-4

                    py-2.5

                    text-xs

                    font-semibold

                    text-white

                    transition

                    hover:bg-[#4163CB]

                  "

                >

                  <IconPlus className="h-4 w-4" />

                  Ajukan Izin

                </button>

              )}

            </div>

          )}

        </main>

      </div>

    </div>

  );

}
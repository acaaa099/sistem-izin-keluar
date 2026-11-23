<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">

    <title>Surat Izin Keluar Kantor</title>

    <style>
        @page {
            margin: 35px 45px;
        }

        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 12px;
            color: #111111;
            line-height: 1.6;
        }

        .header {
            text-align: center;
            margin-bottom: 25px;
        }

        .header h1 {
            margin: 0;
            font-size: 16px;
            font-weight: bold;
        }

        .header h2 {
            margin: 2px 0 0;
            font-size: 15px;
            font-weight: bold;
        }

        .header p {
            margin: 2px 0;
            font-size: 11px;
        }

        .line {
            border-bottom: 2px solid #111111;
            margin-top: 10px;
        }

        .title {
            text-align: center;
            margin: 25px 0;
        }

        .title h3 {
            margin: 0;
            font-size: 14px;
            text-decoration: underline;
        }

        .title p {
            margin: 3px 0;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }

        td {
            padding: 6px 4px;
            vertical-align: top;
        }

        .label {
            width: 180px;
        }

        .footer {
            margin-top: 45px;
        }

        .signature {
            width: 280px;
            margin-left: auto;
            text-align: center;
        }

        .signature-space {
            height: 70px;
        }

        .small {
            font-size: 10px;
        }
    </style>
</head>

<body>

    @php
        /*
         * ==================================================
         * FORMAT JENIS / KEPERLUAN
         * ==================================================
         *
         * Nilai database tetap menggunakan format asli:
         * keperluan-pribadi
         *
         * Tetapi pada surat PDF ditampilkan sebagai:
         * Keperluan Pribadi
         */

        $jenisIzin = $permit->jenis_izin ?? '';

        $jenisIzinNormalized = strtolower(
            trim(
                str_replace(
                    ['_', ' '],
                    '-',
                    $jenisIzin
                )
            )
        );

        $jenisIzinLabels = [
            'keperluan-pribadi' => 'Keperluan Pribadi',
            'urusan-keluarga' => 'Urusan Keluarga',
            'urusan-dinas' => 'Urusan Dinas',
            'lainnya' => 'Lainnya',
        ];

        $jenisIzinLabel =
            $jenisIzinLabels[$jenisIzinNormalized]
            ?? $jenisIzin
            ?? '-';


        /*
         * ==================================================
         * FORMAT TANGGAL INDONESIA
         * ==================================================
         *
         * Tidak bergantung pada locale Carbon.
         */

        $namaBulan = [
            1 => 'Januari',
            2 => 'Februari',
            3 => 'Maret',
            4 => 'April',
            5 => 'Mei',
            6 => 'Juni',
            7 => 'Juli',
            8 => 'Agustus',
            9 => 'September',
            10 => 'Oktober',
            11 => 'November',
            12 => 'Desember',
        ];

        $tanggalIzin = \Carbon\Carbon::parse(
            $permit->tanggal_izin
        );

        $tanggalIzinIndonesia =
            $tanggalIzin->format('d')
            . ' '
            . $namaBulan[(int) $tanggalIzin->format('n')]
            . ' '
            . $tanggalIzin->format('Y');


        $tanggalSurat = \Carbon\Carbon::now();

        $tanggalSuratIndonesia =
            $tanggalSurat->format('d')
            . ' '
            . $namaBulan[(int) $tanggalSurat->format('n')]
            . ' '
            . $tanggalSurat->format('Y');


        /*
         * ==================================================
         * APPROVAL
         * ==================================================
         */

        $approval = $permit->approvals
            ->where('action', 'APPROVE')
            ->sortByDesc('acted_at')
            ->first();
    @endphp


    <!-- HEADER -->

    <div class="header">

        <h1>PENGADILAN NEGERI PALANGKA RAYA</h1>

        <h2>KELAS IA</h2>

        <p>
            Jl. P. Diponegoro No. 21, Palangka Raya
        </p>

        <div class="line"></div>

    </div>


    <!-- JUDUL -->

    <div class="title">

        <h3>SURAT IZIN KELUAR KANTOR</h3>

        <p>
            Nomor Pengajuan: {{ $permit->id }}
        </p>

    </div>


    <!-- PEMBUKA -->

    <p>
        Dengan ini menerangkan bahwa:
    </p>


    <!-- DATA PEGAWAI -->

    <table>

        <tr>
            <td class="label">
                Nama
            </td>

            <td>
                :
            </td>

            <td>
                {{ $permit->user->name }}
            </td>
        </tr>


        <tr>
            <td class="label">
                NIP
            </td>

            <td>
                :
            </td>

            <td>
                {{ $permit->user->nip ?? '-' }}
            </td>
        </tr>


        <tr>
            <td class="label">
                Jabatan
            </td>

            <td>
                :
            </td>

            <td>
                {{ $permit->user->jabatan ?? '-' }}
            </td>
        </tr>


        <tr>
            <td class="label">
                Unit
            </td>

            <td>
                :
            </td>

            <td>
                {{ $permit->user->unit->name ?? '-' }}
            </td>
        </tr>


        <tr>
            <td class="label">
                Jenis / Keperluan
            </td>

            <td>
                :
            </td>

            <td>
                {{ $jenisIzinLabel }}
            </td>
        </tr>


        <tr>
            <td class="label">
                Tanggal Izin
            </td>

            <td>
                :
            </td>

            <td>
                {{ $tanggalIzinIndonesia }}
            </td>
        </tr>


        <tr>
            <td class="label">
                Jam Keluar
            </td>

            <td>
                :
            </td>

            <td>
                {{ $permit->jam_keluar }}
            </td>
        </tr>


        <tr>
            <td class="label">
                Perkiraan Kembali
            </td>

            <td>
                :
            </td>

            <td>
                {{ $permit->estimasi_kembali }}
            </td>
        </tr>


        <tr>
            <td class="label">
                Alasan / Keterangan
            </td>

            <td>
                :
            </td>

            <td>
                {{ $permit->alasan }}
            </td>
        </tr>

    </table>


    <!-- PENUTUP -->

    <p style="margin-top: 25px;">
        Demikian surat izin ini dibuat untuk dipergunakan sebagaimana mestinya.
    </p>


    <!-- TANDA TANGAN -->

    <div class="footer">

        <div class="signature">

            <p>
                Palangka Raya,
                {{ $tanggalSuratIndonesia }}
            </p>

            <p>
                Yang memberikan persetujuan,
            </p>


            <div class="signature-space"></div>


            <strong>
                {{ $approval?->approver?->name ?? 'Atasan yang berwenang' }}
            </strong>

            <br>

            <span class="small">
                {{ $approval?->approver?->jabatan ?? 'Pejabat yang berwenang' }}
            </span>

        </div>

    </div>

</body>
</html>
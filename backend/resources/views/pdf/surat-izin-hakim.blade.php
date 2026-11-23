
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Izin Keluar Kantor - Hakim</title>

    <style>
        @page {
            size: A4 portrait;
            margin: 1.7cm 2cm 1.8cm 2cm;
        }

        * {
            box-sizing: border-box;
        }

        body {
            font-family: "Times New Roman", serif;
            font-size: 11.5pt;
            color: #000;
            line-height: 1.4;
        }

        .kop {
            width: 100%;
            border-collapse: collapse;
            border-bottom: 2px solid #000;
            margin-bottom: 14px;
        }

        .kop td {
            border: none;
            vertical-align: middle;
            padding: 0 0 8px;
        }

        .kop-logo {
            width: 88px;
            text-align: left;
            padding-right: 5px !important;
        }

        .kop-logo img {
            display: block;
            width: 78px;
            height: 100px;
        }

        .kop-teks {
            text-align: center;
            font-weight: bold;
            font-size: 10pt;
            line-height: 1.3;
        }

        .kop-penyeimbang {
            width: 88px;
        }

        .alamat {
            font-size: 7.5pt;
            font-weight: normal;
            line-height: 1.35;
            margin-top: 4px;
        }

        .dasar {
            width: 100%;
            border-collapse: collapse;
            margin-top: 12px;
            margin-bottom: 24px;
        }

        .dasar td {
            border: none;
            padding: 0;
            vertical-align: top;
        }

        .dasar-kosong {
            width: 52%;
        }

        .dasar-isi {
            width: 48%;
            font-size: 10pt;
            line-height: 1.4;
        }

        .judul {
            text-align: center;
            font-weight: bold;
            font-size: 12pt;
            margin: 0 0 25px;
        }

        .isi {
            width: 100%;
            border-collapse: collapse;
            line-height: 1.45;
        }

        .isi td {
            border: none;
            padding: 5px 0;
            vertical-align: top;
        }

        .label {
            width: 37%;
        }

        .titik {
            width: 3%;
            text-align: center;
        }

        .nilai {
            width: 60%;
            word-wrap: break-word;
        }

        .penutup {
            margin-top: 23px;
            text-align: justify;
            line-height: 1.6;
        }

        .ttd {
            width: 48%;
            margin-left: auto;
            margin-top: 27px;
            text-align: center;
            line-height: 1.45;
            page-break-inside: avoid;
        }

        .ruang-ttd {
            height: 65px;
        }

        .nama {
            font-weight: bold;
            text-decoration: underline;
        }
    </style>
</head>

<body>
@php
    $pemohon = $permit->user;

    $approval = $permit->approvals
        ->where('action', 'APPROVE')
        ->sortByDesc('acted_at')
        ->first();

    $pejabat = $approval ? $approval->approver : null;

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

    $formatTanggal = function ($nilaiTanggal) use ($namaBulan) {
        $tanggal = \Carbon\Carbon::parse($nilaiTanggal);

        return $tanggal->format('d')
            . ' '
            . $namaBulan[(int) $tanggal->format('n')]
            . ' '
            . $tanggal->format('Y');
    };

    $tanggalIzinIndonesia = $formatTanggal($permit->tanggal_izin);
    $tanggalSuratIndonesia = $formatTanggal(\Carbon\Carbon::now());

    $jamKeluar = substr((string) $permit->jam_keluar, 0, 5);
    $jamKembali = substr((string) $permit->estimasi_kembali, 0, 5);

    $jenisIzin = strtolower(
        trim(
            str_replace(
                ['_', ' '],
                '-',
                $permit->jenis_izin ?? ''
            )
        )
    );

    $keperluan = [
        'keperluan-pribadi' => 'Keperluan Pribadi',
        'urusan-keluarga' => 'Urusan Keluarga',
        'urusan-dinas' => 'Urusan Dinas',
        'lainnya' => 'Lainnya',
    ][$jenisIzin] ?? ($permit->jenis_izin ?? '-');

    $jabatanPejabat = $pejabat
        ? (
            $pejabat->jabatan
            ?: optional($pejabat->role)->name
            ?: 'Pejabat yang berwenang'
        )
        : 'Belum tersedia';
@endphp

<table class="kop">
    <tr>
        <td class="kop-logo">
            <img
                src="{{ public_path('images/logo-pn-palangkaraya.jpg') }}"
                alt="Logo Pengadilan Negeri Palangka Raya"
            >
        </td>

        <td class="kop-teks">
            MAHKAMAH AGUNG REPUBLIK INDONESIA<br>
            DIREKTORAT JENDERAL BADAN PERADILAN UMUM<br>
            PENGADILAN TINGGI PALANGKARAYA<br>
            PENGADILAN NEGERI PALANGKARAYA

            <div class="alamat">
                Jl. P. Diponegoro No. 21 Kota Palangka Raya,
                Kalimantan Tengah 73111<br>
                Situs web: https://pn-palangkaraya.go.id
            </div>
        </td>

        <td class="kop-penyeimbang"></td>
    </tr>
</table>

<table class="dasar">
    <tr>
        <td class="dasar-kosong"></td>
        <td class="dasar-isi">
            Peraturan Mahkamah Agung<br>
            Nomor 7 Tahun 2016<br>
            Tentang Penegakan Disiplin Kerja Hakim<br>
            Pada Mahkamah Agung dan Badan Peradilan<br>
            Yang Berada di bawahnya
        </td>
    </tr>
</table>

<div class="judul">
    IZIN KELUAR KANTOR
</div>

<table class="isi">
    <tr>
        <td class="label">Yang bertandatangan di bawah ini</td>
        <td class="titik">:</td>
        <td class="nilai">
            {{ $pejabat->name ?? 'Belum tersedia' }}
        </td>
    </tr>

    <tr>
        <td class="label">Selaku</td>
        <td class="titik">:</td>
        <td class="nilai">{{ $jabatanPejabat }}</td>
    </tr>

    <tr>
        <td class="label">Dengan ini memberikan izin kepada</td>
        <td class="titik">:</td>
        <td class="nilai">{{ $pemohon->name ?? '-' }}</td>
    </tr>

    <tr>
        <td class="label">NIP</td>
        <td class="titik">:</td>
        <td class="nilai">{{ $pemohon->nip ?: '-' }}</td>
    </tr>

    <tr>
        <td class="label">Untuk keluar kantor pada</td>
        <td class="titik">:</td>
        <td class="nilai">{{ $tanggalIzinIndonesia }}</td>
    </tr>

    <tr>
        <td class="label"></td>
        <td class="titik"></td>
        <td class="nilai">
            Pukul {{ $jamKeluar }} s.d. {{ $jamKembali }}
        </td>
    </tr>

    <tr>
        <td class="label">Untuk keperluan</td>
        <td class="titik">:</td>
        <td class="nilai">{{ $keperluan }}</td>
    </tr>
</table>

<div class="penutup">
    Demikian izin ini diberikan kepada yang bersangkutan
    untuk digunakan sebagaimana mestinya.
</div>

<div class="ttd">
    Palangka Raya, {{ $tanggalSuratIndonesia }}<br>
    Pejabat yang memberikan izin,

    <div class="ruang-ttd"></div>

    <span class="nama">
        {{ $pejabat->name ?? 'Pejabat yang berwenang' }}
    </span><br>

    NIP. {{ $pejabat->nip ?? '' }}
</div>

</body>
</html>


<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Surat Izin Keluar Kantor - Pegawai</title>

    <style>
        @page {
            size: A4 portrait;
            margin: 1.7cm 2cm 1.8cm 2cm;
        }

        * {
            box-sizing: border-box;
        }

        body {
            font-family: "DejaVu Sans", sans-serif;
            font-size: 10pt;
            color: #000;
            line-height: 1.45;
        }

        .kop {
            width: 100%;
            border-collapse: collapse;
            border-bottom: 2px solid #000;
            margin-bottom: 10px;
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
        }

        .kop-penyeimbang {
            width: 88px;
        }

        .kop-instansi {
            font-weight: bold;
            font-size: 9.5pt;
            line-height: 1.35;
        }

        .kop-alamat {
            font-size: 7.5pt;
            line-height: 1.35;
            margin-top: 4px;
        }

        .dasar {
            width: 100%;
            border-collapse: collapse;
            margin-top: 12px;
            margin-bottom: 22px;
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
            font-size: 9.5pt;
            line-height: 1.55;
        }

        .judul {
            text-align: center;
            font-weight: bold;
            font-size: 12pt;
            margin: 0 0 24px;
        }

        .pejabat {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }

        .pejabat td {
            border: none;
            padding: 3px 0;
            vertical-align: top;
        }

        .pejabat-label {
            width: 105px;
        }

        .pejabat-value {
            border-bottom: 1px solid #000 !important;
            padding-bottom: 5px !important;
        }

        .pengantar {
            margin: 0 0 12px;
        }

        .identitas {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
        }

        .identitas td {
            border: none;
            padding: 5px 0;
            vertical-align: top;
            line-height: 1.4;
        }

        .identitas .label {
            width: 29%;
        }

        .identitas .titik-dua {
            width: 4%;
            text-align: center;
        }

        .identitas .nilai {
            width: 67%;
            word-wrap: break-word;
        }

        .penutup {
            margin-top: 24px;
            text-align: justify;
        }

        .tanda-tangan {
            width: 48%;
            margin-left: auto;
            margin-top: 34px;
            text-align: left;
            page-break-inside: avoid;
        }

        .ruang-tanda-tangan {
            height: 62px;
        }

        .nama-pejabat {
            font-weight: bold;
            text-decoration: underline;
        }

        .nip-pejabat {
            margin-top: 3px;
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

    $approver = $approval ? $approval->approver : null;

    $tanggalSurat = \Carbon\Carbon::now();

    $bulanIndonesia = [
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

    $formatTanggal = function ($tanggal) use ($bulanIndonesia) {
        $tanggal = \Carbon\Carbon::parse($tanggal);

        return $tanggal->format('d')
            . ' '
            . $bulanIndonesia[(int) $tanggal->format('n')]
            . ' '
            . $tanggal->format('Y');
    };

    $jenisIzin = strtolower(
        trim(
            str_replace(
                ['_', ' '],
                '-',
                $permit->jenis_izin ?? ''
            )
        )
    );

    $labelIzin = [
        'keperluan-pribadi' => 'Keperluan Pribadi',
        'urusan-keluarga' => 'Urusan Keluarga',
        'urusan-dinas' => 'Urusan Dinas',
        'lainnya' => 'Lainnya',
    ][$jenisIzin] ?? ($permit->jenis_izin ?? '-');

    $jabatanPejabat = $approver
        ? (
            $approver->jabatan
            ?: optional($approver->role)->name
            ?: 'Pejabat yang berwenang'
        )
        : 'Pejabat yang berwenang';
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
            <div class="kop-instansi">
                MAHKAMAH AGUNG REPUBLIK INDONESIA
            </div>
            <div class="kop-instansi">
                DIREKTORAT JENDERAL BADAN PERADILAN UMUM
            </div>
            <div class="kop-instansi">
                PENGADILAN TINGGI PALANGKARAYA
            </div>
            <div class="kop-instansi">
                PENGADILAN NEGERI PALANGKARAYA
            </div>

            <div class="kop-alamat">
                Jl. P. Diponegoro No. 21 Kota Palangka Raya,
                Kalimantan Tengah 73111
            </div>
            <div class="kop-alamat">
                Website: https://pn-palangkaraya.go.id
            </div>
        </td>

        <td class="kop-penyeimbang"></td>
    </tr>
</table>

<table class="dasar">
    <tr>
        <td class="dasar-kosong"></td>
        <td class="dasar-isi">
            SK Ketua Mahkamah Agung RI<br>
            Nomor : 071/KMA/SK/V/2008<br>
            Tanggal : 14 Mei 2008
        </td>
    </tr>
</table>

<div class="judul">
    SURAT IZIN KELUAR KANTOR
</div>

<table class="pejabat">
    <tr>
        <td class="pejabat-label">Pejabat :</td>
        <td class="pejabat-value">
            {{ $jabatanPejabat }}
        </td>
    </tr>
</table>

<p class="pengantar">
    Memberikan izin keluar kantor kepada:
</p>

<table class="identitas">
    <tr>
        <td class="label">Nama</td>
        <td class="titik-dua">:</td>
        <td class="nilai">{{ $pemohon->name ?? '-' }}</td>
    </tr>
    <tr>
        <td class="label">NIP</td>
        <td class="titik-dua">:</td>
        <td class="nilai">{{ $pemohon->nip ?: '-' }}</td>
    </tr>
    <tr>
        <td class="label">Jabatan</td>
        <td class="titik-dua">:</td>
        <td class="nilai">{{ $pemohon->jabatan ?: '-' }}</td>
    </tr>
    <tr>
        <td class="label">Unit Kerja</td>
        <td class="titik-dua">:</td>
        <td class="nilai">
            {{ optional($pemohon->unit)->name ?: '-' }}
        </td>
    </tr>
    <tr>
        <td class="label">Untuk Keperluan</td>
        <td class="titik-dua">:</td>
        <td class="nilai">{{ $labelIzin }}</td>
    </tr>
</table>

<p class="penutup">
    Demikian surat izin ini diberikan untuk digunakan
    sebagaimana mestinya.
</p>

<div class="tanda-tangan">
    Palangka Raya, {{ $formatTanggal($tanggalSurat) }}<br>
    Pejabat yang memberikan izin,

    <div class="ruang-tanda-tangan"></div>

    <div class="nama-pejabat">
        {{ $approver->name ?? 'Pejabat yang berwenang' }}
    </div>

    <div class="nip-pejabat">
        NIP. {{ $approver->nip ?? '' }}
    </div>
</div>

</body>
</html>

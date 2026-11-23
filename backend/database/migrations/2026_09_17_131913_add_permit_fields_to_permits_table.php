<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('permits', function (Blueprint $table) {
            $table->string('jenis_izin', 100)->after('user_id');

            $table->date('tanggal_izin')->after('jenis_izin');

            $table->time('jam_keluar')->after('tanggal_izin');

            $table->time('estimasi_kembali')->after('jam_keluar');

            $table->time('jam_kembali')
                ->nullable()
                ->after('estimasi_kembali');

            $table->text('alasan')->after('jam_kembali');

            $table->string('status', 50)
                ->default('DIAJUKAN')
                ->after('alasan');

            $table->string('surat_pdf_path', 500)
                ->nullable()
                ->after('status');

            $table->dateTime('submitted_at')
                ->nullable()
                ->after('surat_pdf_path');

            $table->dateTime('approved_at')
                ->nullable()
                ->after('submitted_at');

            $table->dateTime('completed_at')
                ->nullable()
                ->after('approved_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('permits', function (Blueprint $table) {
            $table->dropColumn([
                'jenis_izin',
                'tanggal_izin',
                'jam_keluar',
                'estimasi_kembali',
                'jam_kembali',
                'alasan',
                'status',
                'surat_pdf_path',
                'submitted_at',
                'approved_at',
                'completed_at',
            ]);
        });
    }
};
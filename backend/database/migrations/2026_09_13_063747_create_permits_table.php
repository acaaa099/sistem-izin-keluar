<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('permits', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->string('jenis_izin');
            $table->date('tanggal_izin');
            $table->time('jam_keluar');
            $table->time('estimasi_kembali')->nullable();
            $table->time('jam_kembali')->nullable();

            $table->text('alasan');

            $table->string('status')->default('DIAJUKAN');

            $table->string('surat_pdf_path')->nullable();

            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('completed_at')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('permits');
    }
};
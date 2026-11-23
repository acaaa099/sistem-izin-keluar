<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('role_id')
                ->nullable()
                ->after('id')
                ->constrained('roles')
                ->nullOnDelete();

            $table->foreignId('unit_id')
                ->nullable()
                ->after('role_id')
                ->constrained('units')
                ->nullOnDelete();

            $table->string('username')->unique()->after('name');

            $table->string('nip')->nullable()->unique()->after('username');

            $table->string('jabatan')->nullable()->after('nip');

            $table->string('pangkat_golongan')->nullable()->after('jabatan');

            $table->boolean('is_active')->default(true)->after('password');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['role_id']);
            $table->dropForeign(['unit_id']);

            $table->dropUnique(['username']);
            $table->dropUnique(['nip']);

            $table->dropColumn([
                'role_id',
                'unit_id',
                'username',
                'nip',
                'jabatan',
                'pangkat_golongan',
                'is_active',
            ]);
        });
    }
};
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('permits', 'approval_target_id')) {
            Schema::table('permits', function (Blueprint $table) {
                $table->foreignId('approval_target_id')
                    ->nullable()
                    ->after('user_id')
                    ->constrained('users')
                    ->nullOnDelete();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('permits', 'approval_target_id')) {
            Schema::table('permits', function (Blueprint $table) {
                $table->dropForeign(['approval_target_id']);
                $table->dropColumn('approval_target_id');
            });
        }
    }
};
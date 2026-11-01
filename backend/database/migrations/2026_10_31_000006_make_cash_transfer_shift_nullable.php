<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cash_transfers', function (Blueprint $table) {
            $table->dropForeign(['shift_id']);
            $table->foreignId('shift_id')
                ->nullable()
                ->change()
                ->constrained('shifts')
                ->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('cash_transfers', function (Blueprint $table) {
            $table->dropForeign(['shift_id']);
            $table->foreignId('shift_id')
                ->nullable(false)
                ->change()
                ->constrained('shifts')
                ->restrictOnDelete();
        });
    }
};

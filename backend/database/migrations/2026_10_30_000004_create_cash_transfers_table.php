<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cash_transfers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shift_id')
                ->nullable()
                ->constrained('shifts')
                ->onDelete('restrict');
            $table->decimal('amount', 15, 2);
            $table->string('from_location');
            $table->string('to_location');
            $table->foreignId('transferred_by')->constrained('users')->restrictOnDelete();
            $table->string('reference')->nullable()->unique();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cash_transfers');
    }
};

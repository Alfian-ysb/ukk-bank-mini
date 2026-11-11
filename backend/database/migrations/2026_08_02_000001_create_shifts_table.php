<?php

use App\Enums\ShiftStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shifts', function (Blueprint $table) {
            $table->id();
            $table->date('shift_date');
            $table->enum('status', array_column(ShiftStatus::cases(), 'value'))->default(ShiftStatus::OPEN->value);
            $table->decimal('opening_balance', 15, 2);
            $table->json('assigned_staff');
            $table->decimal('closing_digital_balance', 15, 2)->nullable();
            $table->decimal('closing_physical_balance', 15, 2)->nullable();
            $table->decimal('total_deposits', 15, 2)->default(0);
            $table->decimal('total_withdrawals', 15, 2)->default(0);
            $table->decimal('difference', 15, 2)->nullable();
            $table->foreignId('opened_by')->constrained('users')->restrictOnDelete();
            $table->foreignId('closed_by')->nullable()->constrained('users')->restrictOnDelete();
            $table->foreignId('approved_by')->nullable()->constrained('users')->restrictOnDelete();
            $table->timestamp('closed_at')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
        });

        Schema::create('shift_denominations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shift_id')->constrained('shifts')->cascadeOnDelete();
            $table->string('type', 10);
            $table->unsignedInteger('denomination');
            $table->unsignedInteger('quantity');
            $table->unsignedBigInteger('amount');
            $table->timestamps();
            $table->unique(['shift_id', 'type', 'denomination']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shift_denominations');
        Schema::dropIfExists('shifts');
    }
};

<?php

use App\Enums\TransactionRequestStatus;
use App\Enums\TransactionTypes;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transaction_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('customers')->restrictOnDelete();
            $table->foreignId('user_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('shift_id')->constrained('shifts')->restrictOnDelete();
            $table->enum('transaction_type', array_column(TransactionTypes::cases(), 'value'));
            $table->decimal('amount', 15, 2);
            $table->enum('status', array_column(TransactionRequestStatus::cases(), 'value'))
                ->default(TransactionRequestStatus::PENDING->value);
            $table->unsignedTinyInteger('verification_attempts')->default(0);
            $table->timestamp('expires_at');
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('rejected_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index(['customer_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transaction_requests');
    }
};

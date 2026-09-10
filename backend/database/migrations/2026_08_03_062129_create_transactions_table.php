<?php

use App\Enums\TransactionTypes;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /** 
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('customers')->onDelete('restrict');
            $table->foreignId('user_id')->constrained('users')->onDelete('restrict');
            $table->dateTime('date');
            $table->enum('transaction_type', array_column(TransactionTypes::cases(), 'value'));
            $table->integer('amount')->unsigned();
            $table->timestamps();
        });
        // DB::statement('ALTER TABLE transactions ADD CONSTRAINT check_amount CHECK (amount > 0)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // DB::statement('ALTER TABLE transactions DROP CONSTRAINT check_amount');
        Schema::dropIfExists('transactions');
    }
};

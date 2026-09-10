<?php

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
        Schema::create('accounting_journals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transaction_id')->constrained('transactions')->onDelete('restrict');
            $table->enum('account_code', ['101', '201']);
            $table->string('position');
            $table->integer('amount')->unsigned();
            $table->timestamps();
        });

        // DB::statement('ALTER TABLE accounting_journals ADD CONSTRAINT check_amount CHECK (amount > 0)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // DB::statement('ALTER TABLE accounting_journals DROP CONSTRAINT check_amount');
        Schema::dropIfExists('accounting_journals');
    }
};

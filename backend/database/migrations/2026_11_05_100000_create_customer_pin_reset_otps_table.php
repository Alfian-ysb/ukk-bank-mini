<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customer_pin_reset_otps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->unique()->constrained()->cascadeOnDelete();
            $table->char('challenge_id', 64)->unique();
            $table->char('code_hash', 64);
            $table->timestamp('expires_at')->index();
            $table->timestamp('last_sent_at');
            $table->unsignedTinyInteger('attempts')->default(0);
            $table->timestamp('used_at')->nullable();
            $table->timestamps();
        });

        DB::table('customer_pin_reset_tokens')
            ->whereNull('used_at')
            ->update(['used_at' => now()]);
    }

    public function down(): void
    {
        Schema::dropIfExists('customer_pin_reset_otps');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('customer_pin_reset_otps', function (Blueprint $table) {
            $table->string('pending_email')->nullable()->after('code_hash');
        });
    }

    public function down(): void
    {
        Schema::table('customer_pin_reset_otps', function (Blueprint $table) {
            $table->dropColumn('pending_email');
        });
    }
};

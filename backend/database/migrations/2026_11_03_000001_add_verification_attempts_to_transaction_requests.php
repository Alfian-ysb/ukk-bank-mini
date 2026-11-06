<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('transaction_requests', 'verification_attempts')) {
            Schema::table('transaction_requests', function (Blueprint $table) {
                $table->unsignedTinyInteger('verification_attempts')->default(0)->after('status');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('transaction_requests', 'verification_attempts')) {
            Schema::table('transaction_requests', function (Blueprint $table) {
                $table->dropColumn('verification_attempts');
            });
        }
    }
};

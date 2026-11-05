<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('customer_pin_reset_otps', 'purpose')) {
            Schema::table('customer_pin_reset_otps', function (Blueprint $table) {
                $table->string('purpose', 16)->default('pin')->after('customer_id');
            });
        }

        if (! Schema::hasIndex('customer_pin_reset_otps', 'customer_pin_reset_otps_customer_id_purpose_unique')) {
            Schema::table('customer_pin_reset_otps', function (Blueprint $table) {
                $table->unique(['customer_id', 'purpose']);
            });
        }

        if (Schema::hasIndex('customer_pin_reset_otps', 'customer_pin_reset_otps_customer_id_unique')) {
            Schema::table('customer_pin_reset_otps', function (Blueprint $table) {
                $table->dropUnique('customer_pin_reset_otps_customer_id_unique');
            });
        }

        if (! Schema::hasColumn('customer_pin_reset_tokens', 'purpose')) {
            Schema::table('customer_pin_reset_tokens', function (Blueprint $table) {
                $table->string('purpose', 16)->default('pin')->after('customer_id');
            });
        }

        if (! Schema::hasIndex('customer_pin_reset_tokens', 'customer_pin_reset_tokens_customer_id_purpose_unique')) {
            Schema::table('customer_pin_reset_tokens', function (Blueprint $table) {
                $table->unique(['customer_id', 'purpose']);
            });
        }

        if (Schema::hasIndex('customer_pin_reset_tokens', 'customer_pin_reset_tokens_customer_id_unique')) {
            Schema::table('customer_pin_reset_tokens', function (Blueprint $table) {
                $table->dropUnique('customer_pin_reset_tokens_customer_id_unique');
            });
        }
    }

    public function down(): void
    {
        DB::table('customer_pin_reset_tokens')->where('purpose', '!=', 'pin')->delete();
        Schema::table('customer_pin_reset_tokens', function (Blueprint $table) {
            $table->unique('customer_id');
        });
        Schema::table('customer_pin_reset_tokens', function (Blueprint $table) {
            $table->dropUnique('customer_pin_reset_tokens_customer_id_purpose_unique');
        });
        Schema::table('customer_pin_reset_tokens', function (Blueprint $table) {
            $table->dropColumn('purpose');
        });

        DB::table('customer_pin_reset_otps')->where('purpose', '!=', 'pin')->delete();
        Schema::table('customer_pin_reset_otps', function (Blueprint $table) {
            $table->unique('customer_id');
        });
        Schema::table('customer_pin_reset_otps', function (Blueprint $table) {
            $table->dropUnique('customer_pin_reset_otps_customer_id_purpose_unique');
        });
        Schema::table('customer_pin_reset_otps', function (Blueprint $table) {
            $table->dropColumn('purpose');
        });
    }
};

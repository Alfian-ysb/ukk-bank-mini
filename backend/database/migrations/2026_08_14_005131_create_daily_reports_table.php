<?php

use App\Enums\ReportStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('daily_reports', function (Blueprint $table) {
            $table->id();
            $table->date('report_date');
            $table->integer('initial_balance')->unsigned();
            $table->text('assigned_tellers')->nullable();
            $table->integer('total_withdrawals')->unsigned();
            $table->integer('final_balance')->unsigned();
            $table->integer('physical_balance')->unsigned();
            $table->enum('status', array_column(ReportStatus::cases(), 'value'))->default(ReportStatus::PENDING->value);
            $table->foreignId('handled_by')->constrained('u
            \']sers')->onDelete('restrict');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('daily_reports');
    }
};

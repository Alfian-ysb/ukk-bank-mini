<?php

use App\Enums\Status;
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
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            // $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('account_number')->unique();
            $table->string('nis')->unique();
            $table->string('student_name');
            $table->string('class');
            $table->enum('status', array_column(Status::cases(), 'value'))->default(Status::ACTIVE->value);
            $table->string('pin');
            $table->string('password');
            $table->integer('saldo')->default(0)->unsigned();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};

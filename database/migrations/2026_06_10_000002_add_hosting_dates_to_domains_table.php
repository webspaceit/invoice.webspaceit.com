<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('domains', function (Blueprint $table) {
            $table->date('hosting_registration_date')->nullable()->after('hosting_provider');
            $table->date('hosting_expiry_date')->nullable()->after('hosting_registration_date');
        });
    }

    public function down(): void
    {
        Schema::table('domains', function (Blueprint $table) {
            $table->dropColumn(['hosting_registration_date', 'hosting_expiry_date']);
        });
    }
};

<?php

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
        Schema::table('domains', function (Blueprint $table) {
            $table->string('domain_registered_email', 255)->nullable()->after('domain_name');
            $table->string('domain_registrar_link', 500)->nullable()->after('domain_registered_email');
            $table->text('domain_contact_person')->nullable()->after('domain_registrar_link');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('domains', function (Blueprint $table) {
            $table->dropColumn(['domain_registered_email', 'domain_registrar_link', 'domain_contact_person']);
        });
    }
};

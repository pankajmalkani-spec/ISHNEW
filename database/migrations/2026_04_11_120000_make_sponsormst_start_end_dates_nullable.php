<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('sponsormst')) {
            return;
        }

        $driver = Schema::getConnection()->getDriverName();

        if ($driver === 'mysql') {
            DB::statement('ALTER TABLE `sponsormst` MODIFY `start_date` DATE NULL');
            DB::statement('ALTER TABLE `sponsormst` MODIFY `end_date` DATE NULL');
        } elseif ($driver === 'pgsql') {
            DB::statement('ALTER TABLE "sponsormst" ALTER COLUMN "start_date" DROP NOT NULL');
            DB::statement('ALTER TABLE "sponsormst" ALTER COLUMN "end_date" DROP NOT NULL');
        }

        DB::table('sponsormst')->whereDate('start_date', '1970-01-01')->update(['start_date' => null]);
        DB::table('sponsormst')->whereDate('end_date', '1970-01-01')->update(['end_date' => null]);
    }

    public function down(): void
    {
        // Intentionally minimal: restoring NOT NULL would break rows with NULL dates.
    }
};

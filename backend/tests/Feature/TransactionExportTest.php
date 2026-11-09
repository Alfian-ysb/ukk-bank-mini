<?php

namespace Tests\Feature;

use App\Exports\TransactionsExport;
use App\Models\User;
use Maatwebsite\Excel\Facades\Excel;
use Tests\TestCase;

class TransactionExportTest extends TestCase
{
    public function test_admin_export_includes_all_matching_transactions_without_pagination(): void
    {
        Excel::fake();
        Excel::matchByRegex();
        $admin = new User;
        $admin->role = 'admin';

        $this->actingAs($admin, 'sanctum')
            ->get('/api/admin/transactions/export?start_date=2026-03-01&end_date=2026-03-31')
            ->assertOk();

        Excel::assertDownloaded(
            '/^laporan-transaksi-\d{8}-\d{6}\.xlsx$/',
            function (TransactionsExport $export): bool {
                $query = $export->query();
                $bindings = array_map(
                    fn ($binding) => $binding instanceof \DateTimeInterface
                        ? $binding->format('Y-m-d H:i:s')
                        : $binding,
                    $query->getBindings()
                );

                return $query->getQuery()->limit === null
                    && in_array('2026-03-01 00:00:00', $bindings, true)
                    && in_array('2026-03-31 23:59:59', $bindings, true);
            }
        );
    }

    public function test_supervisor_can_export_transactions_matching_a_date_filter(): void
    {
        Excel::fake();
        Excel::matchByRegex();
        $supervisor = new User;
        $supervisor->role = 'supervisor';

        $this->actingAs($supervisor, 'sanctum')
            ->get('/api/supervisor/transactions/export?date=2026-03-10')
            ->assertOk();

        Excel::assertDownloaded(
            '/^laporan-transaksi-\d{8}-\d{6}\.xlsx$/',
            fn (TransactionsExport $export): bool => in_array(
                '2026-03-10',
                $export->query()->getBindings(),
                true
            ) && $export->query()->getQuery()->limit === null
        );
    }

    public function test_transaction_export_rejects_other_roles(): void
    {
        $teller = new User;
        $teller->role = 'teller';

        $this->actingAs($teller, 'sanctum')
            ->get('/api/admin/transactions/export')
            ->assertForbidden();
    }
}

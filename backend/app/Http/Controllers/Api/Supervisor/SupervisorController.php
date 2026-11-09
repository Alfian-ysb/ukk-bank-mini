<?php

namespace App\Http\Controllers\Api\Supervisor;

use App\Exports\TransactionsExport;
use App\Http\Controllers\Controller;
use App\Models\AccountingJournal;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class SupervisorController extends Controller
{
    public function accountingJournal(Request $request)
    {
        $validated = $request->validate([
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ]);
        $journals = AccountingJournal::with(['transaction', 'transaction.customer', 'transaction.user', 'transaction.shift'])
            ->latest('created_at')
            ->latest('id')
            ->paginate($validated['per_page'] ?? 15);

        return response()->json([
            'status' => 'success',
            'data' => $journals->items(),
            'pagination' => [
                'current_page' => $journals->currentPage(),
                'per_page' => $journals->perPage(),
                'total' => $journals->total(),
                'last_page' => $journals->lastPage(),
                'from' => $journals->firstItem(),
                'to' => $journals->lastItem(),
            ],
        ]);
    }

    public function getAllTransactions(Request $request)
    {
        $validated = $request->validate(array_merge($this->transactionFilterRules(), [
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ]));

        $transactions = $this->transactionQuery($validated)->paginate($validated['per_page'] ?? 15);

        if ($transactions->total() === 0) {
            return response()->json([
                'status' => 'error',
                'message' => 'No transactions found',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $transactions->items(),
            'pagination' => [
                'current_page' => $transactions->currentPage(),
                'per_page' => $transactions->perPage(),
                'total' => $transactions->total(),
                'last_page' => $transactions->lastPage(),
                'from' => $transactions->firstItem(),
                'to' => $transactions->lastItem(),
            ],
        ]);
    }

    public function exportTransactions(Request $request)
    {
        $filters = $request->validate($this->transactionFilterRules());

        return Excel::download(
            new TransactionsExport($this->transactionQuery($filters)),
            'laporan-transaksi-'.now()->format('Ymd-His').'.xlsx'
        );
    }

    private function transactionFilterRules(): array
    {
        return [
            'date' => ['sometimes', 'date'],
            'week' => ['sometimes', 'date'],
            'month' => ['sometimes', 'date_format:Y-m'],
            'start_date' => ['sometimes', 'date'],
            'end_date' => ['sometimes', 'date', 'after_or_equal:start_date'],
        ];
    }

    private function transactionQuery(array $filters): Builder
    {
        $query = Transaction::with(['customer', 'user', 'shift'])
            ->latest('created_at')
            ->latest('id');

        if (! empty($filters['date'])) {
            $query->whereDate('created_at', $filters['date']);
        }

        if (! empty($filters['week'])) {
            $startOfWeek = Carbon::parse($filters['week'])->startOfWeek();
            $endOfWeek = Carbon::parse($filters['week'])->endOfWeek();
            $query->whereBetween('created_at', [$startOfWeek, $endOfWeek]);
        }

        if (! empty($filters['month'])) {
            $date = Carbon::parse($filters['month']);
            $query->whereYear('created_at', $date->year)
                ->whereMonth('created_at', $date->month);
        }

        if (! empty($filters['start_date']) && ! empty($filters['end_date'])) {
            $query->whereBetween('created_at', [
                Carbon::parse($filters['start_date'])->startOfDay(),
                Carbon::parse($filters['end_date'])->endOfDay(),
            ]);
        }

        return $query;
    }
}

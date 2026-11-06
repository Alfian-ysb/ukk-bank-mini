<?php

namespace App\Http\Controllers\Api\Supervisor;

use App\Http\Controllers\Controller;
use App\Models\AccountingJournal;
use App\Models\Transaction;
use Illuminate\Http\Request;

class SupervisorController extends Controller
{
    public function accountingJournal()
    {
        $journals = AccountingJournal::with(['transaction', 'transaction.customer', 'transaction.user', 'transaction.shift'])->latest()->get();

        if (!$journals) {
            return response()->json([
                'status' => 'error',
                'message' => 'No accounting journals found',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $journals,
        ]);
    }

    public function getAllTransactions(Request $request)
    {
        $validated = $request->validate([
            'date'       => ['sometimes', 'date'],                     // Filter hari tertentu (YYYY-MM-DD)
            'week'       => ['sometimes', 'date'],                     // Tanggal acuan minggu (YYYY-MM-DD)
            'month'      => ['sometimes', 'date_format:Y-m'],         // Filter bulan (YYYY-MM)
            'start_date' => ['sometimes', 'date'],                     // Filter rentang tanggal (mulai)
            'end_date'   => ['sometimes', 'date', 'after_or_equal:start_date'], // Filter rentang tanggal (selesai)
        ]);

        $query = Transaction::with(['customer', 'user', 'shift'])->latest();

        // 1. Filter Hari Specific (misal: 2026-05-20)
        if ($request->filled('date')) {
            $query->whereDate('created_at', $request->date);
        }

        // 2. Filter Minggu Specific (mengambil rentang awal & akhir minggu dari tanggal yang dikirim)
        if ($request->filled('week')) {
            $startOfWeek = \Carbon\Carbon::parse($request->week)->startOfWeek();
            $endOfWeek   = \Carbon\Carbon::parse($request->week)->endOfWeek();
            $query->whereBetween('created_at', [$startOfWeek, $endOfWeek]);
        }

        // 3. Filter Bulan Specific (misal: 2026-05)
        if ($request->filled('month')) {
            $date = \Carbon\Carbon::parse($request->month);
            $query->whereYear('created_at', $date->year)
                ->whereMonth('created_at', $date->month);
        }

        // 4. Filter Rentang Tanggal (Custom Range)
        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('created_at', [
                \Carbon\Carbon::parse($request->start_date)->startOfDay(),
                \Carbon\Carbon::parse($request->end_date)->endOfDay()
            ]);
        }

        // Mengambil data (jika tidak ada parameter di atas yang diisi, otomatis mengambil semua data)
        $transactions = $query->get();

        if ($transactions->isEmpty()) {
            return response()->json([
                'status' => 'error',
                'message' => 'No transactions found',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $transactions,
        ]);
    }
}

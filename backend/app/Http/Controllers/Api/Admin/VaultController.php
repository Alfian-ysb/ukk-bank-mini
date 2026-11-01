<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\SetupVaultOpeningBalanceRequest;
use App\Models\CashTransfer;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class VaultController extends Controller
{
    public function setupOpeningBalance(SetupVaultOpeningBalanceRequest $request)
    {
        $transfer = DB::transaction(function () use ($request) {
            $alreadySetup = CashTransfer::where('reference', 'main-vault-opening-balance')
                ->lockForUpdate()
                ->exists();

            if ($alreadySetup) {
                throw ValidationException::withMessages([
                    'amount' => 'Saldo awal Brankas Utama sudah pernah diset.',
                ]);
            }

            $amount = (int) $request->input('amount');

            return CashTransfer::create([
                'shift_id' => null,
                'amount' => $amount,
                'from_location' => 'Saldo Awal Sistem',
                'to_location' => 'Brankas Utama',
                'transferred_by' => Auth::id(),
                'reference' => 'main-vault-opening-balance',
            ]);
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Saldo awal Brankas Utama berhasil disimpan.',
            'data' => [
                'location' => 'Brankas Utama',
                'amount' => $transfer->amount,
                'from_location' => $transfer->from_location,
                'to_location' => $transfer->to_location,
                'transferred_by' => $transfer->transferred_by,
                'created_at' => $transfer->created_at,
            ],
        ], 201);
    }

    public function getOpeningBalance()
    {
        $transfer = CashTransfer::where('reference', 'main-vault-opening-balance')->first();

        if (!$transfer) {
            return response()->json([
                'status' => 'error',
                'message' => 'Saldo awal Brankas Utama belum diset.',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'location' => 'Brankas Utama',
                'amount' => $transfer->amount,
                'from_location' => $transfer->from_location,
                'to_location' => $transfer->to_location,
                'transferred_by' => $transfer->transferred_by,
                'created_at' => $transfer->created_at,
            ],
        ]);
    }
}

<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Transaction;
use App\Models\TransactionRequest;
use App\Services\TransactionApprovalService;
use App\Enums\TransactionRequestStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class CustomerController extends Controller
{
    public function __construct(
        private readonly TransactionApprovalService $approvalService,
    ) {
    }

    public function history(Request $request)
    {
        $customer = $request->user()->id;

        $history = Transaction::where('customer_id', $customer)->orderBy('created_at', 'desc')->get();

        return response()->json([
            'status' => 'success',
            'data' => $history
        ]);
    }

    public function latestHistory(){
        
        // mengambil 5 transaksi terakhir dari nasabah yang sedang login
        $customer = Auth::user();
        $latestTransactions = Transaction::where('customer_id', $customer->id)
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();
        
        return response()->json([
            'status' => 'success',
            'data' => $latestTransactions
        ]);
    }

    public function updateFcmToken(Request $request)
    {
        $customer = $request->user();

        if (! $customer instanceof Customer) {
            return response()->json([
                'status' => 'error',
                'message' => 'Endpoint hanya dapat digunakan oleh nasabah.',
            ], 403);
        }

        $validated = $request->validate([
            'fcm_token' => ['required', 'string', 'max:4096'],
        ]);

        $customer->update([
            'fcm_token' => $validated['fcm_token'],
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'FCM token berhasil disimpan',
        ]);
    }

    public function transactionRequest(TransactionRequest $transactionRequest)
    {
        if ($transactionRequest->customer_id !== $this->customerId()) {
            return $this->transactionRequestNotFound();
        }

        $this->approvalService->expireIfNeeded($transactionRequest);

        return response()->json([
            'status' => 'success',
            'data' => $this->transactionRequestData($transactionRequest),
        ]);
    }

    public function approveTransactionRequest(Request $request, TransactionRequest $transactionRequest)
    {
        if ($transactionRequest->customer_id !== $this->customerId()) {
            return $this->transactionRequestNotFound();
        }

        $validated = $request->validate([
            'pin' => ['required', 'string', 'digits:6'],
        ]);

        try {
            $completed = $this->approvalService->approve($transactionRequest, $validated['pin']);
        } catch (ValidationException $exception) {
            if ($exception->errors()['pin'] ?? false) {
                throw $exception;
            }

            return response()->json([
                'status' => 'error',
                'message' => $exception->errors()['request'][0]
                    ?? 'Permintaan transaksi sudah diproses, kedaluwarsa, atau tidak dapat diproses.',
                'errors' => $exception->errors(),
            ], 409);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Transaksi berhasil disetujui.',
            'data' => $this->transactionRequestData($completed),
        ]);
    }

    public function rejectTransactionRequest(Request $request, TransactionRequest $transactionRequest)
    {
        if ($transactionRequest->customer_id !== $this->customerId()) {
            return $this->transactionRequestNotFound();
        }

        $request->validate([
            'reason' => ['sometimes', 'nullable', 'string', 'max:255'],
        ]);

        try {
            $rejected = $this->approvalService->reject($transactionRequest);
        } catch (ValidationException $exception) {
            return response()->json([
                'status' => 'error',
                'message' => 'Permintaan transaksi sudah diproses, kedaluwarsa, atau tidak dapat diproses.',
                'errors' => $exception->errors(),
            ], 409);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Transaksi ditolak.',
            'data' => $this->transactionRequestData($rejected),
        ]);
    }

    public function changePin(Request $request)
    {
        $request->validate([
            'old_pin' => 'required|string',
            'new_pin' => 'required|string|min:4|max:6',
        ]);

        $customer = $request->user();

        if (!password_verify($request->old_pin, $customer->pin)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Old PIN is incorrect'
            ], 400);
        }

        $customer->pin = bcrypt($request->new_pin);
        $customer->save();

        return response()->json([
            'status' => 'success',
            'message' => 'PIN changed successfully'
        ]);
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'old_password' => 'required|string',
            'new_password' => 'required|string|min:6',
        ]);

        $customer = $request->user();

        if (!password_verify($request->old_password, $customer->password)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Old password is incorrect'
            ], 400);
        }

        $customer->password = bcrypt($request->new_password);
        $customer->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Password changed successfully'
        ]);
    }

    private function customerId(): int
    {
        return (int) Auth::id();
    }

    private function transactionRequestData(TransactionRequest $transactionRequest): array
    {
        return [
            'request_id' => $transactionRequest->id,
            'transaction_type' => $transactionRequest->transaction_type,
            'amount' => $transactionRequest->amount,
            'verification_attempts' => $transactionRequest->verification_attempts,
            'status' => $transactionRequest->status instanceof TransactionRequestStatus
                ? $transactionRequest->status->value
                : $transactionRequest->status,
            'expires_at' => $transactionRequest->expires_at,
            'approved_at' => $transactionRequest->approved_at,
            'rejected_at' => $transactionRequest->rejected_at,
            'completed_at' => $transactionRequest->completed_at,
        ];
    }

    private function transactionRequestNotFound()
    {
        return response()->json([
            'status' => 'error',
            'message' => 'Permintaan transaksi tidak ditemukan.',
        ], 404);
    }
}

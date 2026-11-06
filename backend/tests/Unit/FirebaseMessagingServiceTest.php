<?php

namespace Tests\Unit;

use App\Services\FirebaseMessagingService;
use App\Models\Customer;
use App\Models\TransactionRequest;
use App\Services\TransactionApprovalService;
use Kreait\Firebase\Contract\Messaging;
use Kreait\Firebase\Messaging\CloudMessage;
use Mockery;
use RuntimeException;
use Tests\TestCase;

class FirebaseMessagingServiceTest extends TestCase
{
    public function test_transaction_payload_contains_only_non_sensitive_data(): void
    {
        $messaging = Mockery::mock(Messaging::class);
        $messaging->shouldReceive('send')
            ->once()
            ->withArgs(function (CloudMessage $message): bool {
                $payload = $message->jsonSerialize();
                $data = $payload['data'];

                return $data === [
                    'type' => 'transaction_approval',
                    'request_id' => '12',
                    'transaction_type' => 'withdrawal',
                    'amount' => '100000',
                ]
                    && ! array_key_exists('pin', $data)
                    && ! array_key_exists('password', $data);
            })
            ->andReturn(['name' => 'messages/1']);

        $service = new FirebaseMessagingService($messaging);

        $this->assertSame(
            'messages/1',
            $service->sendToToken(
                'fcm-token',
                'Persetujuan transaksi',
                'Ada transaksi.',
                [
                    'type' => 'transaction_approval',
                    'request_id' => '12',
                    'transaction_type' => 'withdrawal',
                    'amount' => '100000',
                ],
            ),
        );
    }

    public function test_empty_customer_token_skips_notification(): void
    {
        $messaging = Mockery::mock(FirebaseMessagingService::class);
        $messaging->shouldNotReceive('sendToToken');

        $request = new TransactionRequest;
        $request->setRelation('customer', new Customer(['fcm_token' => null]));

        (new TransactionApprovalService($messaging))->sendApprovalNotification($request);

        $this->addToAssertionCount(1);
    }

    public function test_firebase_failure_is_reported_as_notification_failure(): void
    {
        $messaging = Mockery::mock(FirebaseMessagingService::class);
        $messaging->shouldReceive('sendToToken')->once()->andThrow(new RuntimeException('Firebase unavailable'));

        $request = new TransactionRequest;
        $request->setRelation('customer', new Customer(['fcm_token' => 'token']));

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('Notifikasi persetujuan transaksi gagal dikirim.');

        (new TransactionApprovalService($messaging))->sendApprovalNotification($request);
    }
}

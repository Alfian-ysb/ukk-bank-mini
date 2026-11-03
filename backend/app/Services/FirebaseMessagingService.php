<?php

namespace App\Services;

use Kreait\Firebase\Contract\Messaging;
use Kreait\Firebase\Messaging\CloudMessage;
use Kreait\Firebase\Messaging\Notification;

class FirebaseMessagingService
{
    public function __construct(
        private readonly Messaging $messaging,
    ) {
    }

    /**
     * @param array<string, string> $data
     */
    public function sendToToken(
        string $token,
        string $title,
        string $body,
        array $data = [],
    ): string {
        $message = CloudMessage::new()
            ->withToken($token)
            ->withNotification(Notification::create($title, $body))
            ->withData($data);

        $result = $this->messaging->send($message);

        return $result['name'];
    }
}

<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CustomerPinResetMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly string $otp,
        public readonly int $expiresInMinutes,
        public readonly string $purpose = 'pin',
        public readonly ?string $targetEmail = null,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->purpose === 'password'
                ? 'Kode OTP Reset Password Bank Mini'
                : ($this->purpose === 'email'
                    ? 'Kode OTP Perubahan Email Bank Mini'
                    : 'Kode OTP Reset PIN Bank Mini'),
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.customer-pin-reset',
        );
    }
}

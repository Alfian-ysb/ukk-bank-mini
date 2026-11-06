<?php

namespace App\Enums;

enum TransactionRequestStatus: string
{
    case PENDING = 'pending';
    case APPROVED = 'approved';
    case REJECTED = 'rejected';
    case EXPIRED = 'expired';
    case COMPLETED = 'completed';
}

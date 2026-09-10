<?php

namespace App\Enums;

enum ReportStatus: string
{
    case PENDING = 'pending';
    case APPROVED = 'approved';
}

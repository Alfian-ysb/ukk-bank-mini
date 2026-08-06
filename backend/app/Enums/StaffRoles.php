<?php

namespace App\Enums;

enum StaffRoles: string
{
    case ADMIN = 'admin';
    case SUPERVISOR = 'supervisor';
    case TELLER = 'teller';
}

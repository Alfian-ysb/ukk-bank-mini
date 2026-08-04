<?php

namespace App\Enums;

enum UserRole:string
{
    case ADMIN = 'admin';
    case SUPERVISOR = 'supervisor';
    case TELLER = 'teller';
    case NASABAH = 'nasabah';
}

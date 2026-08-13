<?php

namespace App\Enums;

enum Status: string
{
    case BLOCKED = "blocked";
    case INACTIVE = "inactive";
    case ACTIVE = "active";
}

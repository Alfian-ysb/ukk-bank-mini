<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['report_date', 'initial_balance', 'total_deposits', 'total_withdrawals', 'final_balance', 'physical_balance', 'status', 'handled_by'])]
class DailyReport extends Model
{
    public function user(){
        return $this->belongsTo(User::class, 'handled_by');
    }
}

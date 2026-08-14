<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CustomerResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'account_number' => $this->account_number,
            'nis'            => $this->nis,
            'student_name'   => $this->student_name,
            'class'          => $this->class,
            'status'         => $this->status,
            'created_at'     => $this->created_at?->toIso8601String(),
            'updated_at'     => $this->updated_at?->toIso8601String(),
        ];
        // return [
        //     'id' => $this->id,
        //     'user_id' => $this->users?->id,
        //     'username' => $this->users?->username,
        //     'full_name' => $this->users?->full_name,
        //     'account_number' => $this->customer?->account_number,
        //     'nis' => $this->customer?->nis,
        //     'student_name' => $this->customer?->student_name,
        //     'class' => $this->customer?->class,
        //     'status' => $this->customer?->status,
        //     // 'balance' => $this->customer?->balance,
        //     'created_at' => $this->customer?->created_at?->toIso8601String(),
        // ];
    }
}

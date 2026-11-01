<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class OpenShiftRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'shift_date' => ['nullable', 'date'],
            'assigned_staff' => ['required', 'array', 'min:1', 'max:3', 'distinct'],
            'assigned_staff.*' => ['string', 'distinct'],
            'opening_denominations' => ['required', 'array', 'min:1'],
            'opening_denominations.*.denomination' => ['required', 'integer', 'min:1'],
            'opening_denominations.*.quantity' => ['required', 'integer', 'min:0'],
        ];
    }
}

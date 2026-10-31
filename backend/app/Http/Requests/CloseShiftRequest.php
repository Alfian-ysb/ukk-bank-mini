<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CloseShiftRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'closing_denominations' => ['required', 'array', 'min:1'],
            'closing_denominations.*.denomination' => ['required', 'integer', 'min:1'],
            'closing_denominations.*.quantity' => ['required', 'integer', 'min:0'],
        ];
    }
}

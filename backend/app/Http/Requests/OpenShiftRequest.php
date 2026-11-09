<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

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

    public function after(): array
    {
        return [
            function (Validator $validator): void {
                $denominations = $this->input('opening_denominations', []);

                if ($validator->errors()->any()) {
                    return;
                }

                if (
                    is_array($denominations)
                    && collect($denominations)->every(
                        fn (array $item): bool => (int) $item['quantity'] === 0
                    )
                ) {
                    $validator->errors()->add(
                        'opening_denominations',
                        'Form rincian lembaran saldo awal harus diisi dengan jumlah lembaran yang valid.'
                    );
                }
            },
        ];
    }
}

<?php

namespace App\Http\Requests;

use App\Enums\Status;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateCustomerRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'nis' => ['sometimes', 'string', 'unique:customers,nis,' . $this->route('id')],
            'student_name' => ['sometimes', 'string'],
            'status' => ['sometimes', 'in:' . implode(',', array_column(Status::cases(), 'value'))],
            'major' => ['sometimes', 'string'],
            'cohort_year' => ['sometimes', 'string'],
            'pin' => ['sometimes', 'string', 'size:6'],
            'password' => ['sometimes', 'string', 'min:6'],
        ];
    }
}

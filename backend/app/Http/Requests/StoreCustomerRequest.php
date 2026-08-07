<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreCustomerRequest extends FormRequest
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
            'username' => ['required', 'string', 'unique:users,username'],
            'full_name' => ['required', 'string'],
            'account_number' => ['required', 'string', 'unique:customers,account_number'],
            'password' => ['required', 'string', 'min:6'],
            'nis' => ['required', 'string', 'unique:customers,nis'],
            'student_name' => ['required', 'string'],
            'class' => ['required', 'string'],
            'pin' => ['required', 'string', 'size:6'],
        ];
    }
}

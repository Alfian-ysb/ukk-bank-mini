<?php

namespace App\Imports;

use App\Actions\CreateCustomerAction;
use App\Models\Customer;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class CustomersImport implements ToCollection, WithHeadingRow
{
    private int $importedCount = 0;

    public function __construct(
        private readonly CreateCustomerAction $createCustomer,
    ) {}

    public function collection(Collection $collection): void
    {
        $errors = [];
        $seenNisFile = [];
        $seenEmailsFile = [];
        $sanitizedCollection = [];

        if ($collection->isEmpty()) {
            throw ValidationException::withMessages([
                'file' => ['File CSV tidak memiliki data nasabah.'],
            ]);
        }

        // 1. OPTIMASI: Ambil seluruh NIS dari database sekaligus (HANYA 1 QUERY)
        // flip() mengubah nilai NIS menjadi KEY array agar pencarian bernilai O(1)
        $existingDbNis = Customer::pluck('nis')->flip()->all();
        $existingDbEmails = Customer::withTrashed()
            ->whereNotNull('email')
            ->pluck('email')
            ->mapWithKeys(fn (string $email): array => [strtolower($email) => true])
            ->all();

        foreach ($collection as $index => $row) {
            $rowNumber = $index + 2;
            $rawData = $row->toArray();

            // Cast dan sanitasi data
            $data = [
                'nis' => isset($rawData['nis']) ? trim((string) $rawData['nis']) : null,
                'student_name' => isset($rawData['student_name']) ? trim((string) $rawData['student_name']) : null,
                'email' => isset($rawData['email']) && trim((string) $rawData['email']) !== ''
                    ? trim((string) $rawData['email'])
                    : null,
                'major' => isset($rawData['major']) ? trim((string) $rawData['major']) : null,
                'cohort_year' => isset($rawData['cohort_year']) ? trim((string) $rawData['cohort_year']) : null,
                'pin' => isset($rawData['pin']) ? trim((string) $rawData['pin']) : null,
                'password' => isset($rawData['password']) ? trim((string) $rawData['password']) : null,
            ];

            // 2. Buat Validator TANPA rule 'unique:customers,nis'
            $validator = Validator::make($data, [
                'nis' => ['required', 'string'],
                'student_name' => ['required', 'string'],
                'email' => ['nullable', 'email', 'max:255'],
                'major' => ['required', 'string'],
                'cohort_year' => ['required', 'string'],
                'pin' => ['required', 'string', 'size:6'],
                'password' => ['required', 'string', 'min:6'],
            ]);

            $nisValue = $data['nis'] ?? null;

            // 3. Pengecekan Unique di Memory PHP
            $isDuplicateInDb = $nisValue && isset($existingDbNis[$nisValue]);
            $isDuplicateInFile = $nisValue && isset($seenNisFile[$nisValue]);
            $emailValue = $data['email'] ? strtolower($data['email']) : null;
            $isDuplicateEmailInDb = $emailValue && isset($existingDbEmails[$emailValue]);
            $isDuplicateEmailInFile = $emailValue && isset($seenEmailsFile[$emailValue]);

            if ($isDuplicateEmailInDb) {
                $validator->errors()->add('email', 'Email sudah terdaftar di database.');
            }

            if ($isDuplicateEmailInFile) {
                $validator->errors()->add('email', 'Email duplikat pada file CSV.');
            }

            if ($validator->fails() || $isDuplicateInDb || $isDuplicateInFile) {
                if ($isDuplicateInDb) {
                    $validator->errors()->add('nis', 'NIS sudah terdaftar di database.');
                }

                if ($isDuplicateInFile) {
                    $validator->errors()->add('nis', 'NIS duplikat pada file CSV.');
                }

                foreach ($validator->errors()->messages() as $attribute => $messages) {
                    $errors["baris_{$rowNumber}.{$attribute}"] = $messages;
                }

                continue;
            }

            if ($nisValue) {
                $seenNisFile[$nisValue] = true;
            }

            if ($emailValue) {
                $seenEmailsFile[$emailValue] = true;
            }

            $sanitizedCollection[] = $data;
        }

        if ($errors !== []) {
            throw ValidationException::withMessages($errors);
        }

        foreach ($sanitizedCollection as $data) {
            $this->createCustomer->execute($data);
            $this->importedCount++;
        }
    }

    public function importedCount(): int
    {
        return $this->importedCount;
    }
}

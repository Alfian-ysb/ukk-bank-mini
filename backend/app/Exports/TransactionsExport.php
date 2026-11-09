<?php

namespace App\Exports;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Carbon;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithCustomValueBinder;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use PhpOffice\PhpSpreadsheet\Cell\Cell;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\Cell\DefaultValueBinder;

class TransactionsExport extends DefaultValueBinder implements FromQuery, WithCustomValueBinder, WithHeadings, WithMapping
{
    public function __construct(private readonly Builder $transactions) {}

    public function query(): Builder
    {
        return $this->transactions;
    }

    public function bindValue(Cell $cell, mixed $value): bool
    {
        if (is_string($value)) {
            $cell->setValueExplicit($value, DataType::TYPE_STRING);

            return true;
        }

        return parent::bindValue($cell, $value);
    }

    public function headings(): array
    {
        return [
            'Waktu / Tanggal',
            'No. Rekening',
            'Nama Siswa',
            'Jurusan',
            'Jenis Transaksi',
            'Nominal',
            'Teller',
        ];
    }

    public function map($transaction): array
    {
        $date = $transaction->date ?? $transaction->created_at;

        return [
            $date ? Carbon::parse($date)->format('d/m/Y H:i') : '-',
            $transaction->customer?->account_number ?? '-',
            $transaction->customer?->student_name ?? '-',
            $transaction->customer?->major ?? '-',
            $transaction->transaction_type === 'deposit' ? 'Setor Tunai' : 'Tarik Tunai',
            (int) $transaction->amount,
            implode(', ', $transaction->shift?->assigned_staff ?? []),
        ];
    }
}

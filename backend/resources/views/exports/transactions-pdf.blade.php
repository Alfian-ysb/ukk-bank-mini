<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Laporan Transaksi</title>
    <style>
        @page {
            size: A4 portrait;
            margin: 22mm 10mm 20mm;
        }

        body {
            color: #1f2937;
            font-family: "DejaVu Sans", sans-serif;
            font-size: 7.5pt;
        }

        h1 {
            margin: 0 0 4px;
            font-size: 15pt;
            text-align: center;
        }

        .subtitle,
        .metadata {
            margin: 3px 0;
            color: #4b5563;
            text-align: center;
        }

        .metadata {
            margin-bottom: 14px;
            font-size: 7pt;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
        }

        thead {
            display: table-header-group;
        }

        tr {
            page-break-inside: avoid;
        }

        th,
        td {
            border: 1px solid #9ca3af;
            padding: 5px 4px;
            vertical-align: top;
            overflow-wrap: break-word;
            word-wrap: break-word;
        }

        th {
            background: #e5e7eb;
            color: #111827;
            font-weight: bold;
            text-align: left;
        }

        .date { width: 15%; }
        .account { width: 12%; }
        .name { width: 16%; }
        .major { width: 12%; }
        .type { width: 12%; }
        .amount { width: 13%; }
        .teller { width: 20%; }

        .page-number {
            position: fixed;
            right: 0;
            bottom: -12mm;
            left: 0;
            color: #6b7280;
            font-size: 7pt;
            text-align: center;
        }

        .page-number::after {
            content: "Halaman " counter(page) " dari " counter(pages);
        }
    </style>
</head>
<body>
    <h1>Laporan Transaksi</h1>
    <p class="subtitle">Bank Mini SMK Negeri 1 Bantul</p>
    <p class="metadata">
        Dibuat {{ $generatedAt->format('d/m/Y H:i') }}
        @if (!empty($filters['date']))
            | Tanggal: {{ \Illuminate\Support\Carbon::parse($filters['date'])->format('d/m/Y') }}
        @elseif (!empty($filters['week']))
            | Minggu mulai: {{ \Illuminate\Support\Carbon::parse($filters['week'])->format('d/m/Y') }}
        @elseif (!empty($filters['month']))
            | Bulan: {{ \Illuminate\Support\Carbon::parse($filters['month'])->format('m/Y') }}
        @elseif (!empty($filters['start_date']) && !empty($filters['end_date']))
            | Periode: {{ \Illuminate\Support\Carbon::parse($filters['start_date'])->format('d/m/Y') }}
            - {{ \Illuminate\Support\Carbon::parse($filters['end_date'])->format('d/m/Y') }}
        @else
            | Semua periode
        @endif
    </p>

    <table>
        <thead>
            <tr>
                <th class="date">Waktu / Tanggal</th>
                <th class="account">No. Rekening</th>
                <th class="name">Nama Siswa</th>
                <th class="major">Jurusan</th>
                <th class="type">Jenis Transaksi</th>
                <th class="amount">Nominal</th>
                <th class="teller">Teller</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($transactions as $transaction)
                <tr>
                    <td class="date">
                        {{ ($transaction->date || $transaction->created_at) ? \Illuminate\Support\Carbon::parse($transaction->date ?? $transaction->created_at)->format('d/m/Y H:i') : '-' }}
                    </td>
                    <td class="account">{{ $transaction->customer?->account_number ?? '-' }}</td>
                    <td class="name">{{ $transaction->customer?->student_name ?? '-' }}</td>
                    <td class="major">{{ $transaction->customer?->major ?? '-' }}</td>
                    <td class="type">
                        {{ $transaction->transaction_type === 'deposit' ? 'Setor Tunai' : 'Tarik Tunai' }}
                    </td>
                    <td class="amount">Rp{{ number_format((float) $transaction->amount, 0, ',', '.') }}</td>
                    <td class="teller">{{ implode(', ', $transaction->shift?->assigned_staff ?? []) ?: '-' }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="7">Tidak ada data transaksi untuk filter yang dipilih.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div class="page-number"></div>
</body>
</html>

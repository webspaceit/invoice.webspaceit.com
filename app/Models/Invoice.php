<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Invoice extends Model
{
    public const STATUSES = ['draft', 'unpaid', 'partial', 'paid', 'overdue'];

    public const DEFAULT_NOTE = 'You are requested to pay the due invoice within the three working days from the due date. You can pay the bill by Cash, Bank or Bkash Merchant. Thanks for your communications with us.';

    protected $fillable = [
        'client_id',
        'invoice_number',
        'invoice_date',
        'due_date',
        'paid_date',
        'subtotal',
        'discount_amount',
        'tax_rate',
        'tax_amount',
        'invoice_total',
        'total_paid',
        'amount_due',
        'payment_status',
        'note',
        'signature',
        'payment_slip',
        'signatory_designation',
    ];

    protected $casts = [
        'invoice_date' => 'date:Y-m-d',
        'due_date' => 'date:Y-m-d',
        'paid_date' => 'date:Y-m-d',
        'subtotal' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'tax_rate' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'invoice_total' => 'decimal:2',
        'total_paid' => 'decimal:2',
        'amount_due' => 'decimal:2',
    ];

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(InvoiceItem::class);
    }

    public static function nextInvoiceNumber(): string
    {
        $year = now()->year;
        $prefix = "WSI-{$year}-";
        $lastInvoice = self::query()
            ->where('invoice_number', 'like', "{$prefix}%")
            ->orderByDesc('invoice_number')
            ->first();

        $next = $lastInvoice
            ? ((int) str($lastInvoice->invoice_number)->afterLast('-')->toString()) + 1
            : 1;

        return $prefix.str_pad((string) $next, 4, '0', STR_PAD_LEFT);
    }

    public static function calculateTotals(array $items, float $discountAmount, float $taxRate, float $totalPaid): array
    {
        $subtotal = collect($items)->sum(fn (array $item): float => round((float) $item['unit_amount'] * (float) $item['quantity'], 2));
        $discount = min(max($discountAmount, 0), $subtotal);
        $taxableAmount = max($subtotal - $discount, 0);
        $taxAmount = round($taxableAmount * max($taxRate, 0) / 100, 2);
        $invoiceTotal = round($taxableAmount + $taxAmount, 2);
        $paid = min(max($totalPaid, 0), $invoiceTotal);

        return [
            'subtotal' => round($subtotal, 2),
            'discount_amount' => round($discount, 2),
            'tax_rate' => round(max($taxRate, 0), 2),
            'tax_amount' => $taxAmount,
            'invoice_total' => $invoiceTotal,
            'total_paid' => round($paid, 2),
            'amount_due' => round(max($invoiceTotal - $paid, 0), 2),
        ];
    }
}

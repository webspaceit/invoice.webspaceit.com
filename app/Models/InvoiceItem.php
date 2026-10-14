<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InvoiceItem extends Model
{
    protected $fillable = [
        'description',
        'unit_amount',
        'cost_amount',
        'quantity',
        'line_total',
    ];

    protected $casts = [
        'unit_amount' => 'decimal:2',
        'cost_amount' => 'decimal:2',
        'quantity' => 'decimal:2',
        'line_total' => 'decimal:2',
    ];

    /**
     * Never expose internal cost prices to clients. Admin-only screens
     * (e.g. the invoice form) call makeVisible() explicitly.
     */
    protected $hidden = ['cost_amount'];

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }
}

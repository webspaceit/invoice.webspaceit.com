<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Domain extends Model
{
    protected $fillable = [
        'client_id',
        'domain_name',
        'domain_registered_email',
        'domain_registrar_link',
        'hosting_provider',
        'hosting_registration_date',
        'hosting_expiry_date',
        'registration_date',
        'expiry_date',
        'status',
    ];

    protected $casts = [
        'hosting_registration_date' => 'date:Y-m-d',
        'hosting_expiry_date' => 'date:Y-m-d',
        'registration_date' => 'date:Y-m-d',
        'expiry_date' => 'date:Y-m-d',
    ];

    protected $appends = ['computed_status'];

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function getComputedStatusAttribute(): string
    {
        $status = $this->status;

        if ($status === 'active' && $this->expiry_date) {
            $daysUntilExpiry = now()->startOfDay()->diffInDays($this->expiry_date, false);

            if ($daysUntilExpiry < 0) {
                return 'expired';
            }

            if ($daysUntilExpiry <= 30) {
                return 'expiring_soon';
            }
        }

        return $status;
    }
}

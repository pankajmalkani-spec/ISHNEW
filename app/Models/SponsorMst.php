<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SponsorMst extends Model
{
    protected $table = 'sponsormst';

    public $timestamps = false;

    protected $fillable = [
        'sponsorcategory_id',
        'organization_name',
        'logo',
        'website',
        'contact_name',
        'email',
        'mobile',
        'amount_sponsored',
        'start_date',
        'end_date',
        'status',
        'addeddate',
        'addedby',
        'modifieddate',
        'modifiedby',
    ];

    protected function casts(): array
    {
        return [
            'amount_sponsored' => 'integer',
            'status' => 'integer',
            'start_date' => 'date',
            'end_date' => 'date',
        ];
    }
}

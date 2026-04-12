<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FlowchartMst extends Model
{
    protected $table = 'flowchartmst';

    public $timestamps = false;

    protected $fillable = [
        'name',
        'description',
        'defined_by',
        'status',
        'addeddate',
        'addedby',
        'modifieddate',
        'modifiedby',
    ];

    protected function casts(): array
    {
        return [
            'defined_by' => 'integer',
            'status' => 'integer',
        ];
    }

    public function lines(): HasMany
    {
        return $this->hasMany(FlowchartTrans::class, 'charttrans_id');
    }
}

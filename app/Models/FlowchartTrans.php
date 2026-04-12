<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FlowchartTrans extends Model
{
    protected $table = 'flowcharttrans';

    public $timestamps = false;

    protected $fillable = [
        'charttrans_id',
        'contentedit_id',
        'plan',
        'activity_name',
        'responsibilty',
        'sort',
        'modifieddate',
        'modifiedby',
    ];

    protected function casts(): array
    {
        return [
            'charttrans_id' => 'integer',
            'contentedit_id' => 'integer',
            'plan' => 'integer',
            'responsibilty' => 'integer',
            'sort' => 'integer',
        ];
    }

    public function master(): BelongsTo
    {
        return $this->belongsTo(FlowchartMst::class, 'charttrans_id');
    }
}

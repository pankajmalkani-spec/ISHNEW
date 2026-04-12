<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Newsource extends Model
{
    protected $table = 'newsource';

    public $timestamps = false;

    protected $fillable = [
        'name',
        'description',
        'status',
        'addeddate',
        'addedby',
        'modifieddate',
        'modifiedby',
    ];

    protected function casts(): array
    {
        return [
            'status' => 'integer',
        ];
    }
}

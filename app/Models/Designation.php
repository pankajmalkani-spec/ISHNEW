<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Designation extends Model
{
    protected $table = 'designation';

    public $timestamps = false;

    protected $fillable = [
        'designation',
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

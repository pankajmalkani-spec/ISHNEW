<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SponsorCategory extends Model
{
    protected $table = 'sponsorcategory';

    public $timestamps = false;

    protected $fillable = [
        'name',
        'note',
        'status',
        'addeddate',
        'addedby',
        'modifieddate',
        'modifiedby',
    ];
}
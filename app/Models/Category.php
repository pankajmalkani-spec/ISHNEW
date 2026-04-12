<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    protected $table = 'categorymst';

    public $timestamps = false;

    protected $fillable = [
        'title',
        'code',
        'color',
        'sort',
        'banner_img',
        'box_img',
        'status',
        'addeddate',
        'addedby',
        'modifieddate',
        'modifiedby',
    ];
}
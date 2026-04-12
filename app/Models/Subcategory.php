<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Subcategory extends Model
{
    protected $table = 'subcategorymst';

    public $timestamps = false;

    protected $fillable = [
        'name',
        'category_id',
        'subcat_code',
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
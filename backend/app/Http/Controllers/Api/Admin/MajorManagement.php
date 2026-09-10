<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Major;
use Illuminate\Http\Request;

class MajorManagement extends Controller
{
    public function index(){
        $majors = Major::all();

        return response()->json([
            'status' => 'success',
            'data' => [
                'major_name' => $majors->pluck('major_name'),
                'unique_code' => $majors->pluck('unique_code'),
            ],
        ]);
    }

    
}

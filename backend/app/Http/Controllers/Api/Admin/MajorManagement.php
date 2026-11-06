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

    public function view($id)
    {
        $major = Major::find($id);

        if (!$major) {
            return response()->json([
                'status' => 'error',
                'message' => 'Major not found',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $major,
        ]);
    }

    public function create(Request $request)
    {
        $validated = $request->validate([
            'major_name' => 'required|string|max:255',
        ]);
        // kode unnik urut mulai dari 01 urut

        $major = Major::create([
            'major_name' => $validated['major_name'],
            'unique_code' => strtoupper(substr($validated['major_name'], 0, 3)) . '-' . uniqid(),
        ]);

        return response()->json([
            'status' => 'success',
            'data' => $major,
        ], 201);
    }

    
}

<?php

namespace App\Http\Controllers;

use App\Models\MainProduct;
use App\Models\SpecialProduct;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SearchController extends Controller
{
    public function index()
    {
        return Inertia::render('Search', [
            'mainProducts' => [],
            'specialProducts' => [],
            'search' => ''
        ]);
    }

    public function search(Request $request)
    {
        $search = $request->input('search');

        $mainProducts = MainProduct::whereRaw('MATCH(name, code, description) AGAINST(? IN BOOLEAN MODE)', [$search . '*'])
            ->orWhere('name', 'LIKE', "%{$search}%")
            ->orWhere('code', 'LIKE', "%{$search}%")
            ->get();

        $specialProducts = SpecialProduct::whereRaw('MATCH(name, code, description) AGAINST(? IN BOOLEAN MODE)', [$search . '*'])
            ->orWhere('name', 'LIKE', "%{$search}%")
            ->orWhere('code', 'LIKE', "%{$search}%")
            ->get();

        return Inertia::render('Search', [
            'mainProducts' => $mainProducts,
            'specialProducts' => $specialProducts,
            'search' => $search
        ]);
    }
}

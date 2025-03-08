<?php

namespace App\Http\Controllers;

use App\Models\MainProduct;
use App\Models\SpecialProduct;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SearchController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search', '');

        if (!empty($search)) {
            return $this->performSearch($request);
        }

        return Inertia::render('Search', [
            'mainProducts' => [
                'data' => [],
                'links' => [],
                'total' => 0
            ],
            'specialProducts' => [
                'data' => [],
                'links' => [],
                'total' => 0
            ],
            'search' => ''
        ]);
    }

    public function search(Request $request)
    {
        return $this->performSearch($request);
    }

    private function performSearch(Request $request)
    {
        $search = $request->input('search', '');
        $perPage = 15;

        if (empty($search)) {
            return redirect()->route('search.index');
        }

        $normalizedSearch = preg_replace('/\s+/', ' ', trim($search));
        $unifiedSearch = $this->unifyString($normalizedSearch);

        $mainProducts = MainProduct::query();
        $specialProducts = SpecialProduct::query();

        $applySearchConditions = function($query) use ($normalizedSearch, $unifiedSearch) {
            $query->where(function($q) use ($normalizedSearch, $unifiedSearch) {
                $q->where('name', '=', $normalizedSearch)
                    ->orWhereRaw("LOWER(REPLACE(REPLACE(REPLACE(REPLACE(name, '-', ''), ' ', ''), ',', ''), '.', '')) = ?", [strtolower($unifiedSearch)])
                    ->orWhere('name', 'LIKE', "%{$normalizedSearch}%")
                    ->orWhereRaw("LOWER(REPLACE(REPLACE(REPLACE(REPLACE(name, '-', ''), ' ', ''), ',', ''), '.', '')) LIKE ?", ["%".strtolower($unifiedSearch)."%"]);

                $tokens = preg_split('/[\s\-,\.]+/', $normalizedSearch);
                if (count($tokens) > 1) {
                    $q->orWhere(function($subq) use ($tokens) {
                        foreach ($tokens as $token) {
                            if (strlen($token) >= 1) {
                                $subq->where('name', 'LIKE', "%{$token}%");
                            }
                        }
                    });
                }
            });

            return $query;
        };

        $mainProducts = $applySearchConditions($mainProducts);
        $specialProducts = $applySearchConditions($specialProducts);

        $orderByRelevance = function($query) use ($normalizedSearch, $unifiedSearch) {
            $relevanceScore = '(';

            $relevanceScore .= "CASE WHEN name = '{$normalizedSearch}' THEN 1000 ELSE 0 END + ";
            $relevanceScore .= "CASE WHEN LOWER(REPLACE(REPLACE(REPLACE(REPLACE(name, '-', ''), ' ', ''), ',', ''), '.', '')) = '".strtolower($unifiedSearch)."' THEN 900 ELSE 0 END + ";

            $relevanceScore .= "CASE WHEN name LIKE '{$normalizedSearch}%' THEN 800 ELSE 0 END + ";
            $relevanceScore .= "CASE WHEN LOWER(REPLACE(REPLACE(REPLACE(REPLACE(name, '-', ''), ' ', ''), ',', ''), '.', '')) LIKE '".strtolower($unifiedSearch)."%' THEN 700 ELSE 0 END + ";

            $relevanceScore .= "CASE WHEN name LIKE '%{$normalizedSearch}%' THEN 600 ELSE 0 END + ";
            $relevanceScore .= "CASE WHEN LOWER(REPLACE(REPLACE(REPLACE(REPLACE(name, '-', ''), ' ', ''), ',', ''), '.', '')) LIKE '%".strtolower($unifiedSearch)."%' THEN 500 ELSE 0 END";

            $tokens = preg_split('/[\s\-,\.]+/', $normalizedSearch);
            foreach ($tokens as $index => $token) {
                if (strlen($token) >= 2) {
                    $score = 400 - ($index * 10);
                    $relevanceScore .= " + CASE WHEN name LIKE '%{$token}%' THEN {$score} ELSE 0 END";
                }
            }

            $relevanceScore .= ")";

            $query->orderByRaw("{$relevanceScore} DESC")
                ->orderBy('name', 'ASC');

            return $query;
        };

        $mainProducts = $orderByRelevance($mainProducts);
        $specialProducts = $orderByRelevance($specialProducts);

        $mainProductsResults = $mainProducts->paginate(
            $perPage,
            ['*'],
            'main_page'
        )->withQueryString();

        $specialProductsResults = $specialProducts->paginate(
            $perPage,
            ['*'],
            'special_page'
        )->withQueryString();

        return Inertia::render('Search', [
            'mainProducts' => $mainProductsResults,
            'specialProducts' => $specialProductsResults,
            'search' => $search
        ]);
    }

    private function unifyString($string)
    {
        return preg_replace('/[\s\-\.,]+/', '', $string);
    }
}

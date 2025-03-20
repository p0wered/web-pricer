<?php

namespace App\Http\Controllers;

use App\Models\MainProduct;
use App\Models\SpecialProduct;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

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
        $mainPage = $request->input('main_page', 1);
        $specialPage = $request->input('special_page', 1);

        if (empty($search)) {
            return redirect()->route('search.index');
        }

        $cacheKey = "search_results_{$search}";

        $cachedResults = Cache::get($cacheKey);

        if (!$cachedResults) {
            $normalizedSearch = preg_replace('/\s+/', ' ', trim($search));
            $unifiedSearch = $this->unifyString($normalizedSearch);

            $mainProducts = MainProduct::query();
            $specialProducts = SpecialProduct::query();

            $applySearchConditions = function($query) use ($normalizedSearch, $unifiedSearch) {
                $unifiedSearchLower = strtolower($unifiedSearch);

                $query->where(function($q) use ($unifiedSearchLower) {
                    $q->where('normalized_name', '=', $unifiedSearchLower);
                    $q->orWhere('normalized_name', 'LIKE', "%{$unifiedSearchLower}%");
                });

                return $query;
            };

            $mainProducts = $applySearchConditions($mainProducts);
            $specialProducts = $applySearchConditions($specialProducts);

            $orderByRelevance = function($query) use ($normalizedSearch, $unifiedSearch) {
                $normalizedSearchLower = strtolower($normalizedSearch);
                $unifiedSearchLower = strtolower($unifiedSearch);

                $relevanceScore = '(';
                $relevanceScore .= "CASE WHEN LOWER(name) = ? THEN 1000 ELSE 0 END + ";
                $relevanceScore .= "CASE WHEN LOWER(REPLACE(REPLACE(REPLACE(REPLACE(name, '-', ''), ' ', ''), ',', ''), '.', '')) = ? THEN 900 ELSE 0 END + ";
                $relevanceScore .= "CASE WHEN LOWER(name) LIKE ? THEN 800 ELSE 0 END + ";
                $relevanceScore .= "CASE WHEN LOWER(REPLACE(REPLACE(REPLACE(REPLACE(name, '-', ''), ' ', ''), ',', ''), '.', '')) LIKE ? THEN 700 ELSE 0 END + ";
                $relevanceScore .= "CASE WHEN LOWER(name) LIKE ? THEN 600 ELSE 0 END + ";
                $relevanceScore .= "CASE WHEN LOWER(REPLACE(REPLACE(REPLACE(REPLACE(name, '-', ''), ' ', ''), ',', ''), '.', '')) LIKE ? THEN 500 ELSE 0 END";

                $tokens = preg_split('/[\s\-,\.]+/', $normalizedSearch);
                foreach ($tokens as $index => $token) {
                    if (strlen($token) >= 2) {
                        $score = 400 - ($index * 10);
                        $relevanceScore .= " + CASE WHEN LOWER(name) LIKE ? THEN {$score} ELSE 0 END";
                    }
                }

                $relevanceScore .= ")";

                $params = [
                    $normalizedSearchLower,
                    $unifiedSearchLower,
                    $normalizedSearchLower . "%",
                    $unifiedSearchLower . "%",
                    "%" . $normalizedSearchLower . "%",
                    "%" . $unifiedSearchLower . "%"
                ];

                foreach ($tokens as $token) {
                    if (strlen($token) >= 2) {
                        $params[] = "%" . strtolower($token) . "%";
                    }
                }

                $query->orderByRaw("{$relevanceScore} DESC", $params)
                    ->orderBy('name', 'ASC');

                return $query;
            };

            $mainProducts = $orderByRelevance($mainProducts);
            $specialProducts = $orderByRelevance($specialProducts);

            $mainProductsAll = $mainProducts->get(['id', 'name', 'code', 'quantity', 'price', 'sheet_name', 'description']);
            $specialProductsAll = $specialProducts->get(['id', 'name', 'code', 'quantity', 'price', 'sheet_name', 'description']);

            $cachedResults = [
                'mainProductsAll' => $mainProductsAll,
                'specialProductsAll' => $specialProductsAll
            ];

            Cache::put($cacheKey, $cachedResults, now()->addMinutes(15));
        }

        $mainProductsCollection = collect($cachedResults['mainProductsAll']);
        $specialProductsCollection = collect($cachedResults['specialProductsAll']);

        $mainProductsPaginator = new \Illuminate\Pagination\LengthAwarePaginator(
            $mainProductsCollection->forPage($mainPage, $perPage),
            $mainProductsCollection->count(),
            $perPage,
            $mainPage,
            ['path' => \Illuminate\Support\Facades\Request::url(), 'query' => ['main_page' => $mainPage, 'special_page' => $specialPage, 'search' => $search]]
        );

        $specialProductsPaginator = new \Illuminate\Pagination\LengthAwarePaginator(
            $specialProductsCollection->forPage($specialPage, $perPage),
            $specialProductsCollection->count(),
            $perPage,
            $specialPage,
            ['path' => \Illuminate\Support\Facades\Request::url(), 'query' => ['main_page' => $mainPage, 'special_page' => $specialPage, 'search' => $search]]
        );

        return Inertia::render('Search', [
            'mainProducts' => $mainProductsPaginator,
            'specialProducts' => $specialProductsPaginator,
            'search' => $search,
            'allData' => [
                'mainProductsAll' => $cachedResults['mainProductsAll'],
                'specialProductsAll' => $cachedResults['specialProductsAll']
            ]
        ]);
    }

    private function unifyString($string)
    {
        return preg_replace('/[\s\-\.,]+/', '', $string);
    }
}

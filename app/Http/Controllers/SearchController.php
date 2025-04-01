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

        $cacheKey = "search_results_" . md5($search);
        $cachedResults = Cache::get($cacheKey);

        if (!$cachedResults) {
            $normalizedSearch = preg_replace('/\s+/', ' ', trim($search));
            $tokens = explode(' ', $normalizedSearch);
            $baseToken = array_shift($tokens);
            $baseTokenUnified = strtolower($this->unifyString($baseToken));

            $mainProducts = MainProduct::query();
            $specialProducts = SpecialProduct::query();

            $applyBaseCondition = function ($query) use ($baseTokenUnified) {
                $query->where(function ($q) use ($baseTokenUnified) {
                    $q->where('normalized_name', '=', $baseTokenUnified)
                        ->orWhere('normalized_name', 'LIKE', "{$baseTokenUnified}%");
                });
                return $query;
            };

            $mainProducts = $applyBaseCondition($mainProducts);
            $specialProducts = $applyBaseCondition($specialProducts);

            if (!empty($tokens)) {
                $applyAdditionalConditions = function ($query) use ($tokens) {
                    foreach ($tokens as $token) {
                        $tokenUnified = strtolower($this->unifyString($token));
                        $query->where('normalized_name', 'LIKE', "%{$tokenUnified}%");
                    }
                    return $query;
                };

                $mainProducts = $applyAdditionalConditions($mainProducts);
                $specialProducts = $applyAdditionalConditions($specialProducts);
            }

            $orderByRelevance = function ($query) use ($baseTokenUnified, $tokens) {
                $relevanceScore = '(';
                $relevanceScore .= "CASE WHEN LOWER(name) LIKE ? THEN 1000 ELSE 0 END";

                $params = [ $baseTokenUnified . '%' ];

                foreach ($tokens as $index => $token) {
                    $score = 500 - ($index * 50);
                    $relevanceScore .= " + CASE WHEN LOWER(name) LIKE ? THEN {$score} ELSE 0 END";
                    $params[] = "%" . strtolower($token) . "%";
                }
                $relevanceScore .= ")";

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
                'specialProductsAll' => $specialProductsAll,
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

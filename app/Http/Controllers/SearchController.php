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

        $cacheKey = "search_results_{$search}_{$mainPage}_{$specialPage}";

        $cachedResults = Cache::get($cacheKey);
        if ($cachedResults) {
            return Inertia::render('Search', $cachedResults);
        }

        $normalizedSearch = preg_replace('/\s+/', ' ', trim($search));
        $unifiedSearch = $this->unifyString($normalizedSearch);

        $mainProducts = MainProduct::query();
        $specialProducts = SpecialProduct::query();

        $applySearchConditions = function($query) use ($normalizedSearch, $unifiedSearch) {
            $unifiedSearchLower = strtolower($unifiedSearch);
            $normalizedSearchLower = strtolower($normalizedSearch);

            $query->where(function($q) use ($normalizedSearch, $unifiedSearch, $unifiedSearchLower, $normalizedSearchLower) {
                $q->where(DB::raw('LOWER(name)'), '=', $normalizedSearchLower);

                $q->orWhereRaw("LOWER(REPLACE(REPLACE(REPLACE(REPLACE(name, '-', ''), ' ', ''), ',', ''), '.', '')) = ?", [$unifiedSearchLower]);

                if (DB::connection()->getDriverName() === 'mysql') {
                    $q->orWhereRaw("MATCH(name, code, description) AGAINST(? IN BOOLEAN MODE)", [$normalizedSearch . '*']);
                } else {
                    $q->orWhere(DB::raw('LOWER(name)'), 'LIKE', "%{$normalizedSearchLower}%");
                    $q->orWhere(DB::raw('LOWER(code)'), 'LIKE', "%{$normalizedSearchLower}%");
                    $q->orWhere(DB::raw('LOWER(description)'), 'LIKE', "%{$normalizedSearchLower}%");
                }

                $q->orWhereRaw("LOWER(REPLACE(REPLACE(REPLACE(REPLACE(name, '-', ''), ' ', ''), ',', ''), '.', '')) LIKE ?", ["%{$unifiedSearchLower}%"]);

                $tokens = preg_split('/[\s\-,\.]+/', $normalizedSearch);
                if (count($tokens) > 1) {
                    $q->orWhere(function($subq) use ($tokens) {
                        foreach ($tokens as $token) {
                            if (strlen($token) >= 1) {
                                $subq->where(DB::raw('LOWER(name)'), 'LIKE', "%".strtolower($token)."%");
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

        $mainProductsResults = $mainProducts->paginate(
            $perPage,
            ['id', 'name', 'code', 'quantity', 'price', 'sheet_name', 'description'],
            'main_page'
        )->withQueryString();

        $specialProductsResults = $specialProducts->paginate(
            $perPage,
            ['id', 'name', 'code', 'quantity', 'price', 'description'],
            'special_page'
        )->withQueryString();

        $results = [
            'mainProducts' => $mainProductsResults,
            'specialProducts' => $specialProductsResults,
            'search' => $search
        ];

        Cache::put($cacheKey, $results, now()->addMinutes(15));

        return Inertia::render('Search', $results);
    }

    private function unifyString($string)
    {
        return preg_replace('/[\s\-\.,]+/', '', $string);
    }
}

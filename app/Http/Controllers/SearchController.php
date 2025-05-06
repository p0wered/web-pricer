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
                'total' => 0,
            ],
            'specialProducts' => [
                'data' => [],
                'total' => 0,
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

        if (empty($search)) {
            return redirect()->route('search.index');
        }

        $normalizedSearch = $this->normalizeSearchQuery($search);

        $cacheKey = "search_results_" . md5($normalizedSearch);
        $cachedResults = Cache::get($cacheKey);

        if (!$cachedResults) {
            $normalizedSearch = preg_replace('/\s+/', ' ', trim($normalizedSearch));
            $tokens = explode(' ', $normalizedSearch);
            $baseToken = array_shift($tokens);
            $baseTokenLower = strtolower($baseToken);

            $mainProducts = MainProduct::query();
            $specialProducts = SpecialProduct::query();

            $applyBaseCondition = function ($query) use ($baseTokenLower) {
                $query->where(function ($q) use ($baseTokenLower) {
                    $q->whereRaw("LOWER(name) = ?", [$baseTokenLower])
                        ->orWhereRaw("LOWER(name) LIKE ?", [$baseTokenLower . '%'])
                        ->orWhereRaw("LOWER(name) LIKE ?", ['%' . $baseTokenLower . '%'])
                        ->orWhereRaw("LOWER(name) LIKE ?", ['%-' . $baseTokenLower . '%']);
                });
                return $query;
            };

            $mainProducts = $applyBaseCondition($mainProducts);
            $specialProducts = $applyBaseCondition($specialProducts);

            if (!empty($tokens)) {
                $applyAdditionalConditions = function ($query) use ($tokens) {
                    foreach ($tokens as $token) {
                        $tokenLower = strtolower($token);

                        if (is_numeric(str_replace(',', '.', $tokenLower))) {
                            $tokenWithDot = str_replace(',', '.', $tokenLower);
                            $tokenWithComma = str_replace('.', ',', $tokenLower);

                            $query->where(function($q) use ($tokenWithDot, $tokenWithComma) {
                                $q->whereRaw("LOWER(name) LIKE ?", ["%{$tokenWithDot}%"])
                                    ->orWhereRaw("LOWER(name) LIKE ?", ["%{$tokenWithComma}%"]);
                            });
                        } else {
                            $query->whereRaw("LOWER(name) LIKE ?", ["%{$tokenLower}%"]);
                        }
                    }
                    return $query;
                };

                $mainProducts = $applyAdditionalConditions($mainProducts);
                $specialProducts = $applyAdditionalConditions($specialProducts);
            }

            $orderByRelevance = function ($query) use ($baseTokenLower, $tokens) {
                $relevanceScore = '(';
                $relevanceScore .= "CASE WHEN LOWER(name) LIKE ? THEN 1000 ELSE 0 END";
                $params = [$baseTokenLower . '%'];

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

            $mainProductsAll = $mainProducts->get(['id', 'name', 'code', 'quantity', 'price', 'sheet_name']);
            $specialProductsAll = $specialProducts->get(['id', 'name', 'code', 'quantity', 'price', 'sheet_name', 'description']);

            $cachedResults = [
                'mainProductsAll' => $mainProductsAll,
                'specialProductsAll' => $specialProductsAll,
            ];

            Cache::put($cacheKey, $cachedResults, now()->addMinutes(15));
        }

        return Inertia::render('Search', [
            'mainProducts' => [
                'data' => $cachedResults['mainProductsAll'],
                'total' => count($cachedResults['mainProductsAll']),
            ],
            'specialProducts' => [
                'data' => $cachedResults['specialProductsAll'],
                'total' => count($cachedResults['specialProductsAll']),
            ],
            'search' => $search,
            'allData' => [
                'mainProductsAll' => $cachedResults['mainProductsAll'],
                'specialProductsAll' => $cachedResults['specialProductsAll']
            ]
        ]);
    }

    private function normalizeSearchQuery($search)
    {
        return $search;
    }
}

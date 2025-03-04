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

        $searchTerms = preg_split('/\s+/', trim($search));

        $mainProducts = MainProduct::query();
        $specialProducts = SpecialProduct::query();

        $applySearchConditions = function($query) use ($searchTerms, $search) {
            $query->where(function($q) use ($searchTerms, $search) {
                foreach ($searchTerms as $term) {
                    if (strlen($term) >= 2) {
                        $q->orWhere('name', 'LIKE', "%{$term}%");
                    }
                }

                if (strlen($search) >= 2) {
                    $q->orWhere('name', 'LIKE', "%{$search}%");
                }
            });

            return $query;
        };

        $mainProducts = $applySearchConditions($mainProducts);
        $specialProducts = $applySearchConditions($specialProducts);

        $orderByRelevance = function($query) use ($searchTerms, $search) {
            $relevanceScore = '(';

            $relevanceScore .= "(CASE WHEN name = '{$search}' THEN 100 ELSE 0 END) + ";

            $relevanceScore .= "(CASE WHEN name LIKE '{$search}%' THEN 50 ELSE 0 END) + ";

            foreach ($searchTerms as $term) {
                if (strlen($term) >= 2) {
                    $relevanceScore .= "(CASE WHEN name LIKE '%{$term}%' THEN 10 ELSE 0 END) + ";
                }
            }

            $relevanceScore = rtrim($relevanceScore, "+ ") . ")";
            $query->orderByRaw("{$relevanceScore} DESC");
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
}

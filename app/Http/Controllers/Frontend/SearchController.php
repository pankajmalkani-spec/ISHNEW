<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Services\FrontendSharedViewData;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\View\View;

class SearchController extends Controller
{
    public function index(Request $request): View|\Illuminate\Http\JsonResponse
    {
        $keyword = trim((string) $request->query('sKeyword', $request->query('keyword', '')));
        $now = now()->format('Y-m-d H:i:s');

        $page = max(1, (int) $request->query('page', 1));
        
        $results = collect();
        $hasMore = false;
        
        if ($keyword !== '') {
            $like = '%'.addcslashes($keyword, '%_\\').'%';
            $base = DB::table('contenttrans as ct')
                ->leftJoin('categorymst as c', 'c.id', '=', 'ct.category_id')
                ->leftJoin('subcategorymst as sc', 'ct.subcategory_id', '=', 'sc.id')
                ->leftJoin('newsource as ns', 'ct.news_source', '=', 'ns.id')
                ->selectRaw('ct.cover_img, ct.title, ct.description, ct.seo_keyword, ct.schedule_date, LOWER(ct.permalink) as permalink, LOWER(c.code) as categorycode, c.color as categorycolor, LOWER(sc.subcat_code) as subcategorycode, sc.name as subcategoryname, sc.color as subcategorycolor, ns.name as newsourcename, ct.youtube_url, ct.youtube_video, ct.youtube_url_check')
                ->where('ct.final_releasestatus', 1)
                ->where('ct.schedule_date', '<=', $now)
                ->where(function ($q) use ($like): void {
                    $q->where('ct.title', 'like', $like)
                        ->orWhere('ct.description', 'like', $like)
                        ->orWhere('ct.seo_keyword', 'like', $like);
                });
                
            $results = (clone $base)
                ->orderByDesc('ct.schedule_date')
                ->get();
        }

        if ($request->ajax()) {
            $nav = FrontendSharedViewData::navigationMenuOnly();
            return response()->json([
                'html' => view('frontend.partials.search_video_cards', array_merge(['videos' => $results], $nav))->render(),
                'has_more' => false,
                'next_page' => null,
            ]);
        }

        $nav = FrontendSharedViewData::navigationMenuOnly();

        return view('frontend.search', array_merge($nav, [
            'cslider' => FrontendSharedViewData::sponsorCarousel(),
            'results' => $results,
            'keyword' => $keyword,
            'hasMore' => $hasMore,
            'nextPage' => 2,
        ]));
    }
}

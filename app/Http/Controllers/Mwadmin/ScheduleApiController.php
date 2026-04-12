<?php

namespace App\Http\Controllers\Mwadmin;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Mwadmin\Concerns\AuthorizesMwadminPermissions;
use App\Http\Controllers\Mwadmin\Concerns\ResolvesMwadminUser;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ScheduleApiController extends Controller
{
    use AuthorizesMwadminPermissions;
    use ResolvesMwadminUser;

    /** Weekly grid: same query as legacy schedule_model::get_result */
    public function week(Request $request): JsonResponse
    {
        if ($deny = $this->mwadminDenyUnless($request, 'schedule', 'allow_view')) {
            return $deny;
        }

        $weekStartParam = trim((string) $request->query('week_start', ''));
        $monday = $weekStartParam !== '' && preg_match('/^\d{4}-\d{2}-\d{2}$/', $weekStartParam)
            ? Carbon::parse($weekStartParam)->startOfWeek(Carbon::MONDAY)
            : Carbon::now()->startOfWeek(Carbon::MONDAY);

        $monday = $monday->startOfDay();

        $categories = DB::table('categorymst')
            ->select('id', 'title')
            ->where('status', 1)
            ->orderBy('title')
            ->get();

        $weekDays = [];
        for ($i = 0; $i < 7; $i++) {
            $d = $monday->copy()->addDays($i);
            $weekDays[] = [
                'date' => $d->format('Y-m-d'),
                'weekday' => $d->format('D'),
                'day' => (int) $d->format('j'),
            ];
        }

        $outCategories = [];
        foreach ($categories as $cat) {
            $catId = (int) $cat->id;
            $cells = [];
            foreach ($weekDays as $wd) {
                $cells[] = $this->fetchDayContents($catId, $wd['date']);
            }
            $outCategories[] = [
                'id' => $catId,
                'title' => (string) $cat->title,
                'cells' => $cells,
            ];
        }

        $endDisplay = $monday->copy()->addDays(6);

        return response()->json([
            'week_start' => $monday->format('Y-m-d'),
            'week_end' => $endDisplay->format('Y-m-d'),
            'label_from' => $monday->format('d-M-y'),
            'label_to' => $endDisplay->format('d-M-y'),
            'week_days' => $weekDays,
            'categories' => $outCategories,
        ]);
    }

    /**
     * @return list<array{id: int, title: string, color: string}>
     */
    private function fetchDayContents(int $categoryId, string $ymd): array
    {
        $dayStart = $ymd.' 00:00:00';
        $dayEnd = Carbon::parse($ymd)->addDay()->format('Y-m-d H:i:s');

        $rows = DB::table('contenttrans as ct')
            ->leftJoin('subcategorymst as sc', 'sc.id', '=', 'ct.subcategory_id')
            ->where('ct.category_id', $categoryId)
            ->where('ct.schedule_date', '>=', $dayStart)
            ->where('ct.schedule_date', '<', $dayEnd)
            ->where(function ($q): void {
                $q->where('ct.final_releasestatus', 1)->orWhere('ct.final_releasestatus', '1');
            })
            ->orderBy('ct.title')
            ->select([
                'ct.id',
                'ct.title',
                DB::raw('COALESCE(NULLIF(TRIM(sc.color), ""), "#56a438") as subcatcolor'),
            ])
            ->get();

        $out = [];
        foreach ($rows as $r) {
            $out[] = [
                'id' => (int) $r->id,
                'title' => (string) $r->title,
                'color' => (string) $r->subcatcolor,
            ];
        }

        return $out;
    }

    public function content(Request $request, int $id): JsonResponse
    {
        if ($deny = $this->mwadminDenyUnless($request, 'schedule', 'allow_view')) {
            return $deny;
        }

        $row = DB::table('contenttrans as ct')
            ->leftJoin('categorymst as c', 'c.id', '=', 'ct.category_id')
            ->leftJoin('subcategorymst as sc', 'sc.id', '=', 'ct.subcategory_id')
            ->where('ct.id', $id)
            ->selectRaw(
                'ct.id, ct.title as ctitle, ct.schedule_date, ct.subcategory_id, ct.final_releasestatus, ct.category_id, c.title as cat_name, sc.name as subcat_name'
            )
            ->first();

        if (! $row) {
            return response()->json(['message' => 'Not found.'], 404);
        }

        return response()->json([
            'data' => [
                'id' => (int) $row->id,
                'title' => (string) $row->ctitle,
                'schedule_date' => $row->schedule_date,
                'category_name' => (string) ($row->cat_name ?? ''),
                'subcategory_name' => (string) ($row->subcat_name ?? ''),
                'final_releasestatus' => (string) ($row->final_releasestatus ?? '0'),
            ],
        ]);
    }

    public function updateStatus(Request $request): JsonResponse
    {
        if ($deny = $this->mwadminDenyUnless($request, 'schedule', 'allow_edit')) {
            return $deny;
        }

        $validated = $request->validate([
            'content_id' => ['required', 'integer', 'min:1'],
            'status' => ['required', 'integer', 'in:0,1'],
        ]);

        $contentId = (int) $validated['content_id'];
        $status = (int) $validated['status'];

        $updated = DB::table('contenttrans')->where('id', $contentId)->update([
            'final_releasestatus' => (string) $status,
        ]);

        if ($updated === 0 && ! DB::table('contenttrans')->where('id', $contentId)->exists()) {
            return response()->json(['message' => 'Content not found.'], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Contenttrans updated successfully.',
        ]);
    }
}

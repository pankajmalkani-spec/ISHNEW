<?php

namespace App\Http\Controllers\Mwadmin;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Mwadmin\Concerns\AuthorizesMwadminPermissions;
use App\Http\Controllers\Mwadmin\Concerns\ResolvesMwadminUser;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardApiController extends Controller
{
    use AuthorizesMwadminPermissions;
    use ResolvesMwadminUser;

    public function options(Request $request): JsonResponse
    {
        if ($deny = $this->mwadminDenyUnlessAny($request, 'dashboard', ['allow_view', 'allow_access'])) {
            return $deny;
        }
        if ($deny = $this->mwadminDenyUnlessAny($request, 'newslisting', ['allow_view', 'allow_access'])) {
            return $deny;
        }

        $session = (array) $request->session()->get('ishnews_session', []);
        $defaultUserId = (string) ($session['user_id'] ?? '0');

        $categories = DB::table('categorymst')->select('id', 'title')->where('status', 1)->orderBy('title')->get();
        $users = DB::table('users')->select('userid as id', 'username')->where('status', 1)->orderBy('username')->get();

        return response()->json([
            'categories' => $categories,
            'users' => $users,
            'default_user_id' => $defaultUserId,
        ]);
    }

    /**
     * P2D workflow rows: contenttrans + contentcharttrans (legacy mwadmin/dashboard DatatableRefresh).
     */
    public function index(Request $request): JsonResponse
    {
        if ($deny = $this->mwadminDenyUnlessAny($request, 'dashboard', ['allow_view', 'allow_access'])) {
            return $deny;
        }
        if ($deny = $this->mwadminDenyUnlessAny($request, 'newslisting', ['allow_view', 'allow_access'])) {
            return $deny;
        }

        $perPageParam = (string) $request->query('per_page', '20');
        $allRows = strtolower($perPageParam) === 'all';
        $perPage = $allRows ? 100000 : max(1, min((int) $perPageParam, 100));

        $categoryId = trim((string) $request->query('category_id', ''));
        $subcategoryId = trim((string) $request->query('subcategory_id', ''));
        $status = trim((string) $request->query('status', ''));
        $p2dstatus = trim((string) $request->query('p2dstatus', ''));
        $user = trim((string) $request->query('user', '0'));
        $featured = trim((string) $request->query('featured', ''));
        $startDate = trim((string) $request->query('start_date', ''));
        $endDate = trim((string) $request->query('end_date', ''));
        $search = trim((string) $request->query('search', ''));

        $query = DB::table('contenttrans as ct')
            ->leftJoin('contentcharttrans as cct', 'ct.id', '=', 'cct.contentedit_id')
            ->leftJoin('categorymst as cm', 'cm.id', '=', 'ct.category_id')
            ->leftJoin('subcategorymst as scm', 'scm.id', '=', 'ct.subcategory_id')
            ->leftJoin('users as u', 'cct.user_id', '=', 'u.userid')
            ->select([
                'ct.id',
                'ct.p2d_caseno',
                'ct.cover_img',
                'ct.title',
                'ct.due_date',
                'cm.title as category_name',
                'scm.name as subcategory_name',
                'cct.activity_name',
                'cct.responsibilty',
                'cct.remarks',
                'cct.activity_status',
                'u.username as user_name',
                'cct.id as chart_id',
            ]);

        if ($categoryId !== '' && ctype_digit($categoryId)) {
            $query->where('ct.category_id', (int) $categoryId);
        }
        if ($subcategoryId !== '' && ctype_digit($subcategoryId)) {
            $query->where('ct.subcategory_id', (int) $subcategoryId);
        }

        if ($status !== '' && $p2dstatus !== '' && ctype_digit($status) && ctype_digit($p2dstatus)) {
            $st = (int) $status;
            $p2d = (int) $p2dstatus;
            if ($p2d === 0) {
                $query->whereRaw('cct.activity_status != ?', [$st]);
            } elseif ($p2d === 1) {
                $query->where('cct.activity_status', $st);
            }
        }

        if ($user !== '' && $user !== '0' && ctype_digit($user)) {
            $query->where('u.userid', (int) $user);
        }

        if ($startDate !== '' && $endDate !== '') {
            $from = $this->parseDmyToDateString($startDate);
            $to = $this->parseDmyToDateString($endDate);
            if ($from !== null && $to !== null) {
                $query->whereRaw('DATE(ct.due_date) between ? and ?', [$from, $to]);
            }
        }

        if ($featured === '0' || $featured === '1') {
            $query->where('ct.featured_content', $featured);
        }

        if ($search !== '') {
            $like = '%'.$search.'%';
            $query->where(function ($q) use ($like): void {
                $q->where('ct.title', 'like', $like)
                    ->orWhere('ct.p2d_caseno', 'like', $like)
                    ->orWhere('cm.title', 'like', $like)
                    ->orWhere('scm.name', 'like', $like)
                    ->orWhere('cct.activity_name', 'like', $like)
                    ->orWhere('u.username', 'like', $like);
            });
        }

        $query->orderByDesc(DB::raw('COALESCE(cct.id, 0)'))->orderByDesc('ct.id');

        $paginator = $query->paginate($perPage)->withQueryString();
        $items = collect($paginator->items())->map(fn ($row) => $this->transformRow((array) $row))->values();

        return response()->json([
            'data' => $items,
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'last_page' => $paginator->lastPage(),
            ],
        ]);
    }

    /**
     * @param  array<string, mixed>  $row
     * @return array<string, mixed>
     */
    private function transformRow(array $row): array
    {
        $cover = (string) ($row['cover_img'] ?? '');
        $dueRaw = $row['due_date'] ?? null;
        $dueDisplay = $this->formatDueDateForDisplay($dueRaw);

        return [
            'id' => (int) ($row['id'] ?? 0),
            'chart_id' => isset($row['chart_id']) ? (int) $row['chart_id'] : null,
            'p2d_caseno' => (string) ($row['p2d_caseno'] ?? ''),
            'category_name' => (string) ($row['category_name'] ?? ''),
            'subcategory_name' => (string) ($row['subcategory_name'] ?? ''),
            'cover_img' => $cover,
            'cover_img_url' => $this->publicNewsImageUrl($cover, 'cover'),
            'title' => (string) ($row['title'] ?? ''),
            'due_date' => $dueDisplay,
            'activity_name' => (string) ($row['activity_name'] ?? ''),
            'responsibilty' => (string) ($row['responsibilty'] ?? ''),
            'user_name' => (string) ($row['user_name'] ?? ''),
            'activity_status' => $this->activityStatusLabel($row['activity_status'] ?? null),
            'activity_status_code' => $row['activity_status'] !== null ? (int) $row['activity_status'] : null,
            'remarks' => (string) ($row['remarks'] ?? ''),
        ];
    }

    private function activityStatusLabel(mixed $code): string
    {
        $n = $code === null || $code === '' ? null : (int) $code;
        return match ($n) {
            1 => 'Pending',
            2 => 'WIP',
            3 => 'Done',
            4 => 'Issue',
            5 => 'NA',
            default => '',
        };
    }

    private function formatDueDateForDisplay(mixed $raw): string
    {
        if ($raw === null || $raw === '') {
            return '';
        }
        $s = trim((string) $raw);
        if ($s === '01-01-1970 12:00' || $s === '00-00-0000 12:00') {
            return '';
        }
        try {
            $c = Carbon::parse($raw);

            return $c->format('d-m-Y H:i');
        } catch (\Throwable) {
            return $s;
        }
    }

    private function parseDmyToDateString(string $dmy): ?string
    {
        $dmy = trim($dmy);
        if ($dmy === '') {
            return null;
        }
        try {
            return Carbon::createFromFormat('d-m-Y', $dmy)->format('Y-m-d');
        } catch (\Throwable) {
            return null;
        }
    }

    private function publicNewsImageUrl(?string $filename, string $kind): ?string
    {
        $s = trim((string) $filename);
        if ($s === '') {
            return null;
        }
        if (str_starts_with($s, 'http://') || str_starts_with($s, 'https://')) {
            return $s;
        }
        $name = $this->normalizeNewsImageFilename($s);
        if ($name === '') {
            return null;
        }
        $sub = $kind === 'banner' ? 'bannerImages' : 'coverImages';
        $base = config('ish_news.images_base_url');
        if (is_string($base) && $base !== '') {
            return rtrim($base, '/').'/NewsContents/'.$sub.'/'.$name;
        }

        return asset('images/NewsContents/'.$sub.'/'.$name);
    }

    private function normalizeNewsImageFilename(?string $raw): string
    {
        $s = trim((string) $raw);
        if ($s === '') {
            return '';
        }
        $s = str_replace('\\', '/', $s);
        if (str_contains($s, '/')) {
            $s = basename($s);
        }
        if (str_starts_with($s, 'coverImages/')) {
            $s = substr($s, strlen('coverImages/'));
        }
        if (str_starts_with($s, 'bannerImages/')) {
            $s = substr($s, strlen('bannerImages/'));
        }

        return $s;
    }
}

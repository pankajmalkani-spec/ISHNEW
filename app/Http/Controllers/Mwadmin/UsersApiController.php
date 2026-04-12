<?php

namespace App\Http\Controllers\Mwadmin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Validation\Rule;

class UsersApiController extends Controller
{
    public function options(): JsonResponse
    {
        return response()->json([
            'designations' => DB::table('designation')->select('id', 'designation')->where('status', 1)->orderBy('designation')->get(),
            'roles' => DB::table('access_roles')->select('arid', 'rolename')->where('status', 1)->orderBy('rolename')->get(),
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        $perPageParam = (string) $request->query('per_page', '10');
        $allRows = strtolower($perPageParam) === 'all';
        $perPage = $allRows ? 100000 : max(1, min((int) $perPageParam, 100));
        $search = trim((string) $request->query('search', ''));

        $query = DB::table('users as u')
            ->leftJoin('designation as d', 'd.id', '=', 'u.designation')
            ->selectRaw('u.userid, u.salutation, u.first_name, u.last_name, u.username, u.email, u.p2d_intials, u.profile_photo, u.status, d.designation');

        if ($search !== '') {
            $query->where(function ($q) use ($search): void {
                $q->where('u.first_name', 'like', "%{$search}%")
                    ->orWhere('u.last_name', 'like', "%{$search}%")
                    ->orWhere('u.username', 'like', "%{$search}%")
                    ->orWhere('u.email', 'like', "%{$search}%")
                    ->orWhere('u.p2d_intials', 'like', "%{$search}%");
            });
        }

        $paginator = $query->orderByDesc('u.userid')->paginate($perPage)->withQueryString();
        $rows = collect($paginator->items())->map(function ($row) {
            return [
                'userid' => (int) $row->userid,
                'name' => trim(($row->salutation ? "{$row->salutation} " : '').($row->first_name ?? '').' '.($row->last_name ?? '')),
                'username' => $row->username,
                'designation' => $row->designation ?? '',
                'email' => $row->email,
                'p2d_intials' => $row->p2d_intials,
                'profile_photo_url' => $row->profile_photo ? url('images/UserProfile_photo/'.$row->profile_photo) : null,
                'status' => (int) $row->status,
            ];
        })->values();

        return response()->json([
            'data' => $rows,
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'last_page' => $paginator->lastPage(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'salutation' => ['nullable', 'string', 'max:20'],
            'first_name' => ['required', 'string', 'max:60', 'regex:/^[a-zA-Z\s]+$/'],
            'last_name' => ['required', 'string', 'max:60', 'regex:/^[a-zA-Z\s]+$/'],
            'username' => ['required', 'string', 'max:60', 'unique:users,username'],
            'email' => ['required', 'email', 'max:120', 'unique:users,email'],
            'designation' => ['nullable', 'integer'],
            'p2d_intials' => ['nullable', 'string', 'max:20'],
            'status' => ['required', 'in:0,1'],
            'password' => ['required', 'string', 'min:4', 'max:50'],
            'role_ids' => ['nullable', 'array'],
            'role_ids.*' => ['integer'],
            'profile_img' => ['nullable', 'image', 'mimes:jpg,jpeg,png,gif,webp', 'max:5120'],
        ]);

        $userId = $this->resolveRealUserId($request);
        $profilePhoto = $request->hasFile('profile_img') ? $this->storeProfileImage($request->file('profile_img')) : '';

        $newId = DB::table('users')->insertGetId([
            'username' => $validated['username'],
            'password' => $this->encryptLegacyPassword($validated['password']),
            'salutation' => $validated['salutation'] ?? '',
            'first_name' => ucwords($validated['first_name']),
            'last_name' => ucwords($validated['last_name']),
            'designation' => $validated['designation'] ?? null,
            'p2d_intials' => strtoupper((string) ($validated['p2d_intials'] ?? '')),
            'profile_photo' => $profilePhoto,
            'email' => $validated['email'],
            'status' => (int) $validated['status'],
            'addeddate' => now(),
            'addedby' => $userId,
            'modifieddate' => now(),
            'modifiedby' => $userId,
        ]);

        $this->syncRoles($newId, $validated['role_ids'] ?? []);
        return response()->json(['message' => 'User created successfully.'], 201);
    }

    public function show(int $id): JsonResponse
    {
        $user = DB::table('users')->where('userid', $id)->first();
        abort_if(!$user, 404);
        $roles = DB::table('usersrole')->where('userid', $id)->pluck('roleid')->map(fn ($v) => (int) $v)->values();

        return response()->json([
            'data' => [
                'userid' => (int) $user->userid,
                'salutation' => $user->salutation ?? '',
                'first_name' => $user->first_name ?? '',
                'last_name' => $user->last_name ?? '',
                'username' => $user->username ?? '',
                'designation' => $user->designation ?? '',
                'p2d_intials' => $user->p2d_intials ?? '',
                'email' => $user->email ?? '',
                'status' => (int) ($user->status ?? 0),
                'profile_photo_url' => $user->profile_photo ? url('images/UserProfile_photo/'.$user->profile_photo) : null,
                'role_ids' => $roles,
            ],
        ]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $user = DB::table('users')->where('userid', $id)->first();
        abort_if(!$user, 404);

        $validated = $request->validate([
            'salutation' => ['nullable', 'string', 'max:20'],
            'first_name' => ['required', 'string', 'max:60', 'regex:/^[a-zA-Z\s]+$/'],
            'last_name' => ['required', 'string', 'max:60', 'regex:/^[a-zA-Z\s]+$/'],
            'username' => ['required', 'string', 'max:60', Rule::unique('users', 'username')->ignore($id, 'userid')],
            'email' => ['required', 'email', 'max:120', Rule::unique('users', 'email')->ignore($id, 'userid')],
            'designation' => ['nullable', 'integer'],
            'p2d_intials' => ['nullable', 'string', 'max:20'],
            'status' => ['required', 'in:0,1'],
            'role_ids' => ['nullable', 'array'],
            'role_ids.*' => ['integer'],
            'profile_img' => ['nullable', 'image', 'mimes:jpg,jpeg,png,gif,webp', 'max:5120'],
        ]);

        $userId = $this->resolveRealUserId($request);
        $update = [
            'username' => $validated['username'],
            'salutation' => $validated['salutation'] ?? '',
            'first_name' => ucwords($validated['first_name']),
            'last_name' => ucwords($validated['last_name']),
            'designation' => $validated['designation'] ?? null,
            'p2d_intials' => strtoupper((string) ($validated['p2d_intials'] ?? '')),
            'email' => $validated['email'],
            'status' => (int) $validated['status'],
            'modifieddate' => now(),
            'modifiedby' => $userId,
        ];

        if ($request->hasFile('profile_img')) {
            if (!empty($user->profile_photo)) {
                $oldPath = public_path('images/UserProfile_photo/'.$user->profile_photo);
                if (is_file($oldPath)) @unlink($oldPath);
            }
            $update['profile_photo'] = $this->storeProfileImage($request->file('profile_img'));
        }

        DB::table('users')->where('userid', $id)->update($update);
        $this->syncRoles($id, $validated['role_ids'] ?? []);

        return response()->json(['message' => 'User updated successfully.']);
    }

    public function destroy(int $id): JsonResponse
    {
        $user = DB::table('users')->where('userid', $id)->first();
        abort_if(!$user, 404);
        if (!empty($user->profile_photo)) {
            $oldPath = public_path('images/UserProfile_photo/'.$user->profile_photo);
            if (is_file($oldPath)) @unlink($oldPath);
        }
        DB::table('usersrole')->where('userid', $id)->delete();
        DB::table('users')->where('userid', $id)->delete();
        return response()->json(['message' => 'User deleted successfully.']);
    }

    public function resetPassword(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'new_password' => ['required', 'string', 'min:4', 'max:50'],
        ]);
        $userId = $this->resolveRealUserId($request);
        DB::table('users')->where('userid', $id)->update([
            'password' => $this->encryptLegacyPassword($validated['new_password']),
            'modifieddate' => now(),
            'modifiedby' => $userId,
        ]);
        return response()->json(['message' => 'Password changed successfully.']);
    }

    private function syncRoles(int $userid, array $roleIds): void
    {
        DB::table('usersrole')->where('userid', $userid)->delete();
        foreach ($roleIds as $roleId) {
            DB::table('usersrole')->insert([
                'userid' => $userid,
                'roleid' => (int) $roleId,
            ]);
        }
    }

    private function storeProfileImage($file): string
    {
        $dir = public_path('images/UserProfile_photo');
        File::ensureDirectoryExists($dir);
        $filename = date('YmdHis').'_'.bin2hex(random_bytes(4)).'.'.$file->getClientOriginalExtension();
        $file->move($dir, $filename);
        return $filename;
    }

    private function encryptLegacyPassword(string $plain): string
    {
        $salt = substr(md5((string) microtime(true).$plain.random_int(1000, 9999)), 0, 8);
        return $salt.md5($salt.$plain);
    }

    private function resolveRealUserId(Request $request): int
    {
        $session = (array) $request->session()->get('ishnews_session', []);
        $sessionUserId = (int) ($session['user_id'] ?? 0);
        if ($sessionUserId > 0 && DB::table('users')->where('userid', $sessionUserId)->exists()) {
            return $sessionUserId;
        }
        $username = (string) ($session['username'] ?? '');
        if ($username !== '') {
            $dbUserId = (int) (DB::table('users')->where('username', $username)->value('userid') ?? 0);
            if ($dbUserId > 0) return $dbUserId;
        }
        return 1;
    }
}
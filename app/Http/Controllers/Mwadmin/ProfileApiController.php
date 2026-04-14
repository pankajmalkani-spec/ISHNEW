<?php

namespace App\Http\Controllers\Mwadmin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class ProfileApiController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $id = $this->sessionUserId($request);
        $user = DB::table('users')->where('userid', $id)->first();
        abort_if(!$user, 404);

        return response()->json([
            'data' => [
                'username' => $user->username ?? '',
                'first_name' => $user->first_name ?? '',
                'last_name' => $user->last_name ?? '',
                'contactno' => $user->contactno ?? '',
                'email' => $user->email ?? '',
                'profile_photo_url' => ! empty($user->profile_photo)
                    ? url('images/UserProfile_photo/'.$user->profile_photo)
                    : null,
            ],
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $id = $this->sessionUserId($request);
        $user = DB::table('users')->where('userid', $id)->first();
        abort_if(!$user, 404);

        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:60', 'regex:/^[a-zA-Z\s]+$/'],
            'last_name' => ['required', 'string', 'max:60', 'regex:/^[a-zA-Z\s]+$/'],
            'contactno' => ['nullable', 'string', 'max:50'],
            'email' => ['required', 'email', 'max:120', Rule::unique('users', 'email')->ignore($id, 'userid')],
        ]);

        DB::table('users')->where('userid', $id)->update([
            'first_name' => ucwords($validated['first_name']),
            'last_name' => ucwords($validated['last_name']),
            'contactno' => (string) ($validated['contactno'] ?? ''),
            'email' => $validated['email'],
            'modifieddate' => now(),
            'modifiedby' => $id,
        ]);

        $fresh = DB::table('users')->where('userid', $id)->first();
        $session = (array) $request->session()->get('ishnews_session', []);
        $session['first_name'] = ucwords($validated['first_name']);
        $session['last_name'] = ucwords($validated['last_name']);
        if ($fresh) {
            $session['profile_photo'] = $fresh->profile_photo ?? null;
        }
        $request->session()->put('ishnews_session', $session);

        return response()->json(['message' => 'Profile updated successfully.']);
    }

    public function updatePassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'min:4', 'max:50', 'confirmed'],
        ]);

        $id = $this->sessionUserId($request);
        $user = DB::table('users')->where('userid', $id)->first();
        abort_if(!$user, 404);

        if (! $this->matchesLegacyHash($validated['current_password'], $user->password ?? null)) {
            return response()->json(['message' => 'Current password is incorrect.'], 422);
        }

        DB::table('users')->where('userid', $id)->update([
            'password' => $this->encryptLegacyPassword($validated['password']),
            'modifieddate' => now(),
            'modifiedby' => $id,
        ]);

        return response()->json(['message' => 'Password updated successfully.']);
    }

    private function sessionUserId(Request $request): int
    {
        $session = (array) $request->session()->get('ishnews_session', []);
        $uid = (int) ($session['user_id'] ?? 0);
        if ($uid > 0 && DB::table('users')->where('userid', $uid)->exists()) {
            return $uid;
        }
        $username = (string) ($session['username'] ?? '');
        if ($username !== '') {
            $dbId = (int) (DB::table('users')->where('username', $username)->value('userid') ?? 0);
            if ($dbId > 0) {
                return $dbId;
            }
        }
        abort(401);
    }

    private function encryptLegacyPassword(string $plain): string
    {
        $salt = substr(md5((string) microtime(true).$plain.random_int(1000, 9999)), 0, 8);

        return $salt.md5($salt.$plain);
    }

    private function matchesLegacyHash(string $plain, ?string $stored): bool
    {
        if (! is_string($stored) || strlen($stored) < 8) {
            return false;
        }
        $salt = substr($stored, 0, 8);

        return hash_equals($stored, $salt.md5($salt.$plain));
    }
}

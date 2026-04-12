<?php

namespace App\Http\Controllers\Mwadmin\Concerns;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

trait ResolvesMwadminUser
{
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
            if ($dbUserId > 0) {
                return $dbUserId;
            }
        }

        return 1;
    }
}

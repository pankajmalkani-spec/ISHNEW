<?php

namespace App\Http\Controllers\Mwadmin\Concerns;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Fine-grained checks aligned with legacy access_role_modules flags.
 */
trait AuthorizesMwadminPermissions
{
    protected function mwadminHas(Request $request, string $module, string $flag): bool
    {
        $session = (array) $request->session()->get('ishnews_session', []);
        if (! empty($session['superaccess'])) {
            return true;
        }
        $row = $session['modules'][$module] ?? [];
        if ($flag === 'allow_view') {
            return ! empty($row['allow_view']) || ! empty($row['allow_access']);
        }

        return ! empty($row[$flag]);
    }

    protected function mwadminDenyUnless(Request $request, string $module, string $flag): ?JsonResponse
    {
        if ($this->mwadminHas($request, $module, $flag)) {
            return null;
        }

        return response()->json(['message' => 'Forbidden.'], 403);
    }

    /** Pass if any listed permission is set (OR). */
    protected function mwadminDenyUnlessAny(Request $request, string $module, array $flags): ?JsonResponse
    {
        $session = (array) $request->session()->get('ishnews_session', []);
        if (! empty($session['superaccess'])) {
            return null;
        }
        foreach ($flags as $flag) {
            if ($this->mwadminHas($request, $module, $flag)) {
                return null;
            }
        }

        return response()->json(['message' => 'Forbidden.'], 403);
    }
}
